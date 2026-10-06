const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');
const { toDateString, todayString, calculateRtoStats } = require('../rtoUtils');

/** Zero-pad a number to 2 digits. */
const pad = n => String(n).padStart(2, '0');

/**
 * GET /api/attendance?year=2026&month=4
 */
router.get('/', auth, async (req, res) => {
  try {
    const year  = parseInt(req.query.year,  10);
    const month = parseInt(req.query.month, 10);

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Valid year and month (1-12) are required.' });
    }

    const startDate = `${year}-${pad(month)}-01`;
    const daysInMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${pad(month)}-${pad(daysInMonth)}`;

    const [attendanceRows] = await pool.query(
      'SELECT date, status FROM attendance WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date',
      [req.user.id, startDate, endDate]
    );

    const [holidayRows] = await pool.query(
      'SELECT date, name FROM holidays WHERE date BETWEEN ? AND ? AND (user_id = ? OR user_id = 0) ORDER BY date, user_id ASC',
      [startDate, endDate, req.user.id]
    );

    const monthAttendance = attendanceRows.map(r => ({
      date:   r.date instanceof Date ? toDateString(r.date) : String(r.date),
      status: r.status,
    }));

    // Deduplicate holidays by date; ORDER BY user_id ASC means the personal
    // entry (higher id) is processed last and overwrites the shared one — so
    // a user's custom name for a public holiday takes precedence.
    const holidayByDate = new Map();
    for (const h of holidayRows) {
      const dateStr = h.date instanceof Date ? toDateString(h.date) : String(h.date);
      holidayByDate.set(dateStr, h.name);
    }
    const monthHolidays = Array.from(holidayByDate.entries()).map(([date, name]) => ({ date, name }));

    const inOfficeDates        = monthAttendance.filter(r => r.status === 'IN_OFFICE').map(r => r.date);
    const approvedAbsenceDates = monthAttendance.filter(r => r.status === 'APPROVED_ABSENCE').map(r => r.date);
    const holidayDates         = monthHolidays.map(h => h.date);

    const stats = calculateRtoStats(year, month, inOfficeDates, holidayDates, approvedAbsenceDates);

    res.json({ year, month, attendance: monthAttendance, holidays: monthHolidays, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * POST /api/attendance/checkin
 * Body: { date?: 'YYYY-MM-DD', status?: 'IN_OFFICE' | 'APPROVED_ABSENCE' }
 */
router.post('/checkin', auth, async (req, res) => {
  try {
    const dateStr = req.body.date || todayString();
    const status  = req.body.status || 'IN_OFFICE';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    if (!['IN_OFFICE', 'APPROVED_ABSENCE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    await pool.query(
      `INSERT INTO attendance (user_id, date, status) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [req.user.id, dateStr, status]
    );

    res.json({ success: true, date: dateStr, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * GET /api/attendance/ytd?year=YYYY&month=MM
 * Returns year-to-date aggregated RTO stats from January through the given month.
 */
router.get('/ytd', auth, async (req, res) => {
  try {
    const year  = parseInt(req.query.year,  10);
    const month = parseInt(req.query.month, 10);

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Valid year and month (1-12) are required.' });
    }

    const startDate = `${year}-01-01`;
    const daysInEndMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${pad(month)}-${pad(daysInEndMonth)}`;

    const [attendanceRows] = await pool.query(
      'SELECT date, status FROM attendance WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date',
      [req.user.id, startDate, endDate]
    );
    const [holidayRows] = await pool.query(
      'SELECT date FROM holidays WHERE date BETWEEN ? AND ? AND (user_id = ? OR user_id = 0) ORDER BY date, user_id ASC',
      [startDate, endDate, req.user.id]
    );

    const attendanceList = attendanceRows.map(r => ({
      date:   r.date instanceof Date ? toDateString(r.date) : String(r.date),
      status: r.status,
    }));

    // Deduplicate holiday dates; calculateRtoStats uses a Set internally but
    // deduplicating here makes the intent explicit and avoids redundant loops.
    const holidayDateSet = new Set(
      holidayRows.map(h => h.date instanceof Date ? toDateString(h.date) : String(h.date))
    );
    const holidayList = Array.from(holidayDateSet).map(date => ({ date }));

    let ytdActualDays   = 0;
    let ytdExpectedDays = 0;

    for (let m = 1; m <= month; m++) {
      const monthStart = `${year}-${pad(m)}-01`;
      const monthEnd   = `${year}-${pad(m)}-${pad(new Date(year, m, 0).getDate())}`;

      const inOfficeDates        = attendanceList.filter(r => r.status === 'IN_OFFICE'        && r.date >= monthStart && r.date <= monthEnd).map(r => r.date);
      const approvedAbsenceDates = attendanceList.filter(r => r.status === 'APPROVED_ABSENCE' && r.date >= monthStart && r.date <= monthEnd).map(r => r.date);
      const holidayDates         = holidayList.filter(h => h.date >= monthStart && h.date <= monthEnd).map(h => h.date);

      const s = calculateRtoStats(year, m, inOfficeDates, holidayDates, approvedAbsenceDates);
      ytdActualDays   += s.actualDays;
      ytdExpectedDays += s.expectedDays;
    }

    const ytdPercentage = ytdExpectedDays > 0 ? Math.round((ytdActualDays / ytdExpectedDays) * 100) : 0;

    res.json({ year, month, ytdActualDays, ytdExpectedDays, ytdPercentage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * DELETE /api/attendance/:date
 */
router.delete('/:date', auth, async (req, res) => {
  try {
    const dateStr = req.params.date;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const [result] = await pool.query(
      'DELETE FROM attendance WHERE user_id = ? AND date = ?',
      [req.user.id, dateStr]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No attendance record found for this date.' });
    }

    res.json({ success: true, date: dateStr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;