 # RTO Tracker &nbsp;![version](https://img.shields.io/badge/version-5.2.0-blue)

Personal return-to-office compliance tracker. Logs daily attendance against company RTO policy (Tue/Wed/Thu requirement) and gives a monthly compliance percentage at a glance.

Built with Angular 17, Node.js + Express, and MySQL.

---

## Features

- Monthly calendar — weekdays only, weekends hidden
- Click any day to log it as **In Office**, **Approved Leave**, or **Holiday**
- Quick-action buttons for today's attendance without opening the modal
- Approved leaves on Tue–Thu are credited and do not hurt compliance
- Philippine public holidays automatically excluded from expected days
- **Manual holiday entry** — click any weekday in the modal to mark it as a holiday, enter a name/note, and save it directly to the holidays table; existing holidays can be updated or removed the same way
- Stats cards: expected days, actual days, compliance %, approved absences
- Month navigation to review historical months
- Data persists in MySQL — shared across devices and deployments

---

## RTO Business Rules

| Rule | Detail |
|---|---|
| RTO days | Tuesday, Wednesday, Thursday only |
| Monday / Friday | Tracked but excluded from compliance calculation |
| Public holidays | Removed from expected days regardless of day |
| Approved absence (Tue–Thu) | Credited — reduces expected days |
| Approved absence (Mon/Fri) | Recorded but no compliance impact |
| Compliance % | `actualDays / expectedDays × 100` |

---

## Project Structure

```
rto-tracker/
├── backend/
│   ├── schema.sql            # MySQL schema + holiday seed data
│   └── src/
│       ├── index.js          # Express entry point (port 3000)
│       ├── db.mysql.js       # MySQL connection pool
│       ├── rtoUtils.js       # Compliance calculation logic
│       └── routes/
│           ├── attendance.js
│           ├── holidays.js
│           └── auth.js
│
└── frontend/
    └── src/app/
        ├── models/rto.models.ts
        ├── services/
        │   ├── rto.service.ts
        │   └── auth.service.ts
        └── components/calendar/
            ├── calendar.component.ts
            ├── calendar.component.html
            └── calendar.component.css
```

---

## Local Setup

### Backend

```bash
cd backend
npm install
node src/index.js     # http://localhost:3000
```

Requires a MySQL database. Before running `backend/schema.sql`, make sure the `USE` statement in that file matches your local database name (or select the correct database first), then run it once to create tables and seed Philippine public holidays. Configure credentials in `backend/.env` (see `.env.example` if present).

### Frontend

```bash
cd frontend
npm install
npx ng serve          # http://localhost:4200
```

The Angular dev server proxies `/api` requests to `http://localhost:3000` via `proxy.conf.json`.

---

## API Reference

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| GET | `/api/attendance` | `?year=&month=` | Monthly attendance, holidays, and stats |
| GET | `/api/attendance/ytd` | `?year=&month=` | Year-to-date aggregated RTO stats (Jan–selected month) |
| POST | `/api/attendance/checkin` | `{ date?, status }` | Upsert a record (`IN_OFFICE` or `APPROVED_ABSENCE`) |
| DELETE | `/api/attendance/:date` | — | Remove a record by date (`YYYY-MM-DD`) |
| GET | `/api/holidays` | `?year=` | List holidays for a year |
| POST | `/api/holidays` | `{ date, name }` | Add or update a holiday (used by manual holiday entry) |
| DELETE | `/api/holidays/:date` | — | Remove a holiday |
| POST | `/api/auth/register` | `{ fullName, employeeNo, email, password }` | Register a new user |
| POST | `/api/auth/login` | `{ employeeNo, password }` | Login and receive a JWT |
| POST | `/api/auth/forgot-password` | `{ email }` | Send password reset email |
| POST | `/api/auth/reset-password` | `{ token, password }` | Reset password via token |

---

## Notes

- Philippine public holidays for 2026 are pre-seeded via `schema.sql`.
- **Manual holiday entry** is per-user (stored in the shared `holidays` table) — any weekday in the calendar modal now has a Holiday button where you can type a holiday name and save it directly.
- The holiday entry form pre-fills the existing name when editing a day already marked as a holiday.

---

## Changelog

### v5.1.0 — June 2026
- **Feature:** Added YTD (Year-to-Date) compliance widget to the dashboard stats row.
- **Backend:** New `GET /api/attendance/ytd?year=&month=` endpoint aggregates RTO stats from January through the selected month.
- **Frontend:** `YtdData` model, `getYtdData()` service method, and `ytdData` property in the calendar component.
- **UI:** YTD widget displays Jan–current month compliance percentage with color-coded status (green ≥ 90 %, amber ≥ 70 %, red < 70 %). Stats row updated to 6-column grid.

### v5.0.0
- Manual holiday entry per user via calendar day modal.
- Holiday name pre-fill when editing an existing holiday.
- Shared holidays table with per-user attendance.

---

## Email & Password Reset

- The backend supports password reset via email using Nodemailer.
- You must provide valid SMTP credentials in your `.env` file (not included in this repo).
- For production, ensure your environment variables are set and the Node.js server is restarted after changes.
- For security, do not commit or share your SMTP credentials.

---

## Production Deployment

- The project includes a GitHub Actions workflow for CI/CD.
- The backend and frontend are deployed via FTP to your server.
- Sensitive files like `.env` and `db.json` are excluded from deployment for security.
- After deployment, use your hosting control panel or the workflow's restart step to restart the Node.js app.

---

## Troubleshooting

- **500 errors on /api/auth/login or /api/auth/forgot-password:**
  - Check backend logs for details (e.g., SMTP issues, missing environment variables).
  - Ensure `.env` is present and correct on the server.
- **express-rate-limit X-Forwarded-For error:**
  - The backend sets `app.set('trust proxy', 1);` for compatibility with proxies/cPanel.
- **Email not sending:**
  - Double-check SMTP settings and password.
  - Check spam folder.
  - Review backend logs for Nodemailer errors.
