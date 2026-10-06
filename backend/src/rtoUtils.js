/**
 * Business logic helpers for RTO calculations.
 *
 * Rules:
 *  - Expected days  = all Tue/Wed/Thu in the month, minus holidays on Tue–Thu, minus approved absences on Tue–Thu
 *  - Actual days    = ANY weekday (Mon–Fri) the user was IN_OFFICE, excluding holidays
 *  - Percentage     = actualDays / expectedDays × 100
 *
 * Going in on Mon or Fri counts toward actual (bonus days).
 * Filing a leave on Mon or Fri does NOT reduce expected (only Tue–Thu absences reduce expected).
 */

const RTO_DAYS = new Set([2, 3, 4]); // Tue, Wed, Thu (0=Sun)
const APP_TIMEZONE = process.env.APP_TIMEZONE || 'Asia/Manila';

function isRtoDay(date) {
  return RTO_DAYS.has(date.getDay());
}

function isWeekday(date) {
  const d = date.getDay();
  return d >= 1 && d <= 5;
}

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Today's date as YYYY-MM-DD in APP_TIMEZONE, independent of the server's TZ
 * (hosted servers usually run UTC, which is still "yesterday" before 08:00 PHT).
 */
function todayString() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

/**
 * @param {number} year
 * @param {number} month  1-based
 * @param {string[]} inOfficeDates        YYYY-MM-DD  (any weekday)
 * @param {string[]} holidayDates         YYYY-MM-DD
 * @param {string[]} approvedAbsenceDates YYYY-MM-DD  (reduces expected when Tue–Thu)
 */
function calculateRtoStats(year, month, inOfficeDates, holidayDates, approvedAbsenceDates = []) {
  const holidaySet = new Set(holidayDates);
  const absenceSet = new Set(approvedAbsenceDates);
  const inOfficeSet = new Set(inOfficeDates);

  let expectedDays = 0;
  let actualDays = 0;

  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day, 12, 0, 0);
    const dateStr = toDateString(date);

    // ── Expected: Tue–Thu, non-holiday, non-approved-absence ──
    if (isRtoDay(date) && !holidaySet.has(dateStr) && !absenceSet.has(dateStr)) {
      expectedDays++;
    }

    // ── Actual: ANY weekday (Mon–Fri), non-holiday, marked IN_OFFICE ──
    if (isWeekday(date) && !holidaySet.has(dateStr) && inOfficeSet.has(dateStr)) {
      actualDays++;
    }
  }

  const percentage = expectedDays > 0 ? Math.round((actualDays / expectedDays) * 100) : 0;
  return { expectedDays, actualDays, percentage, approvedAbsences: approvedAbsenceDates.length };
}

module.exports = { isRtoDay, isWeekday, toDateString, todayString, calculateRtoStats };
