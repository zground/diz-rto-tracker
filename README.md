RTO Tracker

A personal Return-to-Office (RTO) compliance tracker built to help employees monitor office attendance, manage approved absences, account for Philippine public holidays, and review monthly and year-to-date compliance.

Technology stack: Angular 17 · Node.js · Express · MySQL

---

Download

Download the latest project files from the repository:

"Download RTO Tracker" (https://github.com/your-username/rto-tracker/archive/refs/heads/main.zip)

You can also clone the repository using Git:

git clone https://github.com/your-username/rto-tracker.git
cd rto-tracker

Replace "https://github.com/your-username/rto-tracker" with the actual repository URL before publishing this README.

---

Table of Contents

1. "Overview" (#overview)
2. "Features" (#features)
3. "RTO Business Rules" (#rto-business-rules)
4. "Technology Stack" (#technology-stack)
5. "Project Structure" (#project-structure)
6. "Prerequisites" (#prerequisites)
7. "Local Development Setup" (#local-development-setup)
8. "Environment Configuration" (#environment-configuration)
9. "Application Usage" (#application-usage)
10. "API Reference" (#api-reference)
11. "Database and Data Management" (#database-and-data-management)
12. "Authentication and Password Reset" (#authentication-and-password-reset)
13. "Production Deployment" (#production-deployment)
14. "Troubleshooting" (#troubleshooting)
15. "Known Documentation Considerations" (#known-documentation-considerations)
16. "Version History" (#version-history)

---

1. Overview

RTO Tracker helps users monitor attendance against a company policy requiring employees to work from the office on Tuesday, Wednesday, and Thursday.

The application provides a weekday calendar, attendance logging, holiday management, monthly statistics, and a year-to-date (YTD) compliance summary.

Attendance records and holiday information are stored in MySQL, allowing the application to use a persistent database rather than relying solely on browser-local data.

Key objectives

- Track daily office attendance and approved absences.
- Calculate monthly RTO compliance.
- Account for Philippine public holidays.
- Review historical attendance records.
- Monitor year-to-date compliance.
- Manage holidays directly from the calendar.
- Access persistent attendance data across supported devices and deployments.

2. Features

Monthly attendance calendar

- Displays weekdays only; weekends are hidden.
- Supports navigation between months.
- Allows users to select a weekday and manage its attendance status.
- Supports historical attendance review.

Attendance management

Users can record the following attendance statuses:

- In Office — records an office attendance day.
- Approved Leave — records an approved absence.
- Holiday — identifies a date excluded from expected attendance.

Quick-action buttons allow users to record today's attendance without opening the calendar modal.

Holiday management

- Includes seeded Philippine public holiday data for 2026.
- Automatically excludes configured public holidays from expected attendance.
- Supports manual holiday creation from the calendar modal.
- Allows an existing holiday's name to be edited.
- Supports removing a holiday entry.
- Prefills the existing holiday name when editing a date already marked as a holiday.

Manual holiday changes are stored in the holidays table. The exact user-level ownership and visibility rules depend on the database schema and backend implementation.

Monthly dashboard statistics

The dashboard displays:

- Expected RTO days.
- Actual office attendance days.
- Monthly compliance percentage.
- Approved absences.
- Additional attendance statistics available in the interface.

Year-to-date compliance

The YTD widget summarizes compliance from January through the selected month of the selected year.

The widget uses color-coded compliance indicators:

Compliance| Indicator
90% and above| Green
70% to below 90%| Amber
Below 70%| Red

These colors indicate compliance status; they do not change the underlying calculation.

Persistent data storage

MySQL stores application data, including attendance and holidays. This enables persistence across supported devices and deployments that connect to the same database.

The actual isolation of user records depends on the database schema and backend authorization rules.

Authentication and password recovery

The backend exposes endpoints for:

- User registration.
- Employee-number-based login.
- Password-reset email requests.
- Password resets using a token.

Password recovery requires valid SMTP configuration.

---

3. RTO Business Rules

The application follows the attendance rules below.

Rule| Behavior
Required RTO days| Tuesday, Wednesday, Thursday
Monday and Friday| Tracked but excluded from the RTO compliance calculation
Weekends| Hidden from the calendar
Public holidays| Excluded from expected attendance
Approved absence on Tuesday–Thursday| Credited by reducing the expected attendance requirement
Approved absence on Monday or Friday| Recorded without affecting RTO compliance
Monthly compliance| Actual attendance divided by expected attendance, multiplied by 100

Compliance calculation

The documented calculation is:

"Compliance (%) = Actual Days / Expected Days × 100"

For a reliable implementation, the calculation should use the following interpretation:

- Actual Days: qualifying office attendance days on Tuesday, Wednesday, and Thursday.
- Expected Days: required RTO days after excluding applicable public holidays and approved absences on Tuesday, Wednesday, and Thursday.

Monday and Friday records do not contribute to the RTO compliance numerator or denominator.

Example

Suppose a month contains 12 scheduled Tuesday–Thursday RTO days. One of those days is a public holiday and another is an approved absence.

- Scheduled RTO days: 12
- Public holidays excluded: 1
- Approved absences credited: 1
- Adjusted expected days: 10
- Actual office attendance: 9

The resulting compliance is:

"9 / 10 × 100 = 90%"

Implementation note: This example illustrates the documented business rules. Confirm that "rtoUtils.js" applies the same denominator and numerator logic.

Zero expected days

When no RTO days remain after exclusions, the application should avoid dividing by zero. The appropriate display—such as "N/A"—should be confirmed against the existing implementation and business requirements.

---

4. Technology Stack

Component| Technology| Responsibility
Frontend| Angular 17| Calendar, dashboard, forms, and user interaction
Backend| Node.js| Server-side runtime
API framework| Express| REST endpoints and request handling
Database| MySQL| Persistent attendance and holiday records
Authentication| JWT| Token-based authentication, as indicated by the login API
Email| Nodemailer| Password-reset email delivery
Development server| Angular CLI| Local frontend development
Deployment| GitHub Actions and FTP| Automated deployment workflow

The listed technologies reflect the supplied project documentation. Exact dependency versions, installed packages, and production configurations should be verified against the repository.

---

5. Project Structure

rto-tracker/
├── backend/
│   ├── schema.sql
│   └── src/
│       ├── index.js
│       ├── db.mysql.js
│       ├── rtoUtils.js
│       └── routes/
│           ├── attendance.js
│           ├── holidays.js
│           └── auth.js
│
└── frontend/
    └── src/app/
        ├── models/
        │   └── rto.models.ts
        ├── services/
        │   ├── rto.service.ts
        │   └── auth.service.ts
        └── components/
            └── calendar/
                ├── calendar.component.ts
                ├── calendar.component.html
                └── calendar.component.css

Backend components

- "index.js" — Express application entry point, documented to listen on port 3000.
- "db.mysql.js" — MySQL connection pool.
- "rtoUtils.js" — attendance and compliance calculation utilities.
- "routes/attendance.js" — attendance records and statistics.
- "routes/holidays.js" — holiday management.
- "routes/auth.js" — registration, login, and password recovery.
- "schema.sql" — database schema and seeded holiday data.

Frontend components

- "models/rto.models.ts" — application data models.
- "services/rto.service.ts" — attendance and RTO API communication.
- "services/auth.service.ts" — authentication-related API communication.
- "components/calendar/" — calendar display, attendance interaction, and styling.

---

6. Prerequisites

Install or prepare the following before running the application:

- Node.js compatible with the project's dependency requirements.
- npm.
- MySQL server and a database account with the necessary privileges.
- Angular CLI compatible with Angular 17, if required for local development.
- Git, if cloning the repository.
- SMTP credentials if testing password-reset emails.

Check the installed runtime versions:

node --version
npm --version

Use the versions specified in the project's package files or deployment configuration where available.

---

7. Local Development Setup

7.1 Prepare the database

Create or select the MySQL database intended for local development.

Review "backend/schema.sql" and ensure its "USE" statement references the correct database. Alternatively, select the intended database before executing the script.

Run the schema once against a new or appropriately prepared database.

The script is documented to create the required tables and seed Philippine public holidays for 2026.

Caution: Review existing database contents before rerunning schema or seed scripts. Confirm whether the script is safe to execute against an existing database.

7.2 Configure the backend

Navigate to the backend directory:

cd backend
npm install

Create "backend/.env" using ".env.example" as a reference, if that example exists.

Configure the required database settings and any authentication or SMTP variables expected by the application.

Start the API server:

node src/index.js

The documented local backend URL is:

"http://localhost:3000"

Check the server logs for database connection errors or missing configuration.

7.3 Configure the frontend

Open a second terminal:

cd frontend
npm install

Start the Angular development server:

npx ng serve

The documented frontend URL is:

"http://localhost:4200"

7.4 Configure API proxying

The Angular development server is configured to proxy "/api" requests to the backend at "http://localhost:3000" through "proxy.conf.json".

Confirm that the proxy file exists and that the Angular development command uses it.

If the application cannot reach the backend, verify:

- The Express server is running.
- The proxy target is correct.
- The API routes use the expected "/api" prefix.
- No local port conflicts exist.

---

8. Environment Configuration

Store sensitive configuration in environment variables rather than committing secrets to source control.

Depending on the existing implementation, the backend may require settings for:

Configuration| Purpose
Database host| MySQL server address
Database port| MySQL connection port
Database name| Application database
Database username| Database account
Database password| Database account password
JWT secret| Signing and validating authentication tokens
SMTP host| Outgoing mail server
SMTP port| Mail server port
SMTP username| Mail server authentication
SMTP password| Mail server authentication
Email sender| Configured sender address

These are configuration categories, not confirmed variable names. Use the names and requirements expected by the actual backend code.

Recommended practices:

- Keep ".env" out of Git.
- Use separate credentials for development and production.
- Use a least-privilege database account.
- Use a strong, unique JWT signing secret.
- Never expose backend secrets in Angular environment files or browser-delivered code.
- Do not log passwords, reset tokens, or authentication secrets.
- Restart the backend after changing environment variables when required by the hosting environment.

---

9. Application Usage

Record today's attendance

1. Open the application and sign in.
2. Locate the quick-action attendance controls.
3. Select the appropriate attendance status.
4. Confirm that the dashboard reflects the saved record.

Record or edit a historical date

1. Navigate to the relevant month.
2. Select the weekday to manage.
3. Choose the applicable attendance status.
4. Save the change and verify the resulting calendar state.

Add a holiday

1. Open the calendar.
2. Select the weekday to mark as a holiday.
3. Choose the Holiday action.
4. Enter the holiday name or note supported by the interface.
5. Save the entry.
6. Verify that the date is recognized as a holiday.

Edit or remove a holiday

1. Select the existing holiday.
2. Review the prefilled holiday name.
3. Update the name and save, or use the removal action.
4. Verify the updated holiday information and recalculated compliance.

Review monthly and YTD compliance

1. Select the month to review.
2. Review the expected days, actual days, approved absences, and compliance percentage.
3. Review the YTD widget for the aggregate period from January through the selected month.
4. Navigate to another month to review historical figures.

---

10. API Reference

The following endpoints are documented by the project.

Attendance

Base path: "/api/attendance"

Method| Endpoint| Parameters / Body| Purpose
GET| "/api/attendance"| "year", "month" query parameters| Retrieve monthly attendance, holidays, and statistics
GET| "/api/attendance/ytd"| "year", "month" query parameters| Retrieve year-to-date RTO statistics
POST| "/api/attendance/checkin"| Optional "date"; required "status"| Create or update an attendance record
DELETE| "/api/attendance/:date"| Date in "YYYY-MM-DD" format| Delete an attendance record

Supported documented check-in statuses:

- "IN_OFFICE"
- "APPROVED_ABSENCE"

Example request:

POST /api/attendance/checkin
Content-Type: application/json

{
  "date": "2026-10-27",
  "status": "IN_OFFICE"
}

If "date" is omitted, the API documentation indicates that the request may use today's date. Verify the exact defaulting behavior in the backend implementation.

Holidays

Base path: "/api/holidays"

Method| Endpoint| Parameters / Body| Purpose
GET| "/api/holidays"| Optional "year" query parameter| List holidays for a year
POST| "/api/holidays"| "{ "date": "YYYY-MM-DD", "name": "Holiday name" }"| Add or update a holiday
DELETE| "/api/holidays/:date"| Date in "YYYY-MM-DD" format| Remove a holiday

Example holiday request:

POST /api/holidays
Content-Type: application/json

{
  "date": "2026-10-27",
  "name": "Company Holiday"
}

Authentication

Base path: "/api/auth"

Method| Endpoint| Request fields| Purpose
POST| "/api/auth/register"| "fullName", "employeeNo", "email", "password"| Register a user
POST| "/api/auth/login"| "employeeNo", "password"| Authenticate a user and receive a JWT
POST| "/api/auth/forgot-password"| "email"| Request a password-reset email
POST| "/api/auth/reset-password"| "token", "password"| Reset a password using a token

Example login request:

{
  "employeeNo": "EMP001",
  "password": "your-password"
}

The employee number is illustrative only.

API implementation considerations

The API tables describe documented interfaces, not verified runtime behavior.

Before production release, verify:

- Request validation and response schemas.
- Authentication and authorization requirements for each endpoint.
- HTTP status codes and error responses.
- Date and timezone handling.
- Whether attendance operations are scoped to the authenticated user.
- Whether holiday creation and deletion require additional authorization.
- Rate limiting and protection against abusive requests.

---

11. Database and Data Management

MySQL is the application's documented persistent storage layer.

Schema initialization

The "backend/schema.sql" file contains the database schema and initial Philippine public holiday data for 2026.

For a new installation:

1. Select the correct database.
2. Review the schema and seed statements.
3. Execute the script.
4. Verify that the expected tables and holiday records exist.
5. Start the backend and test database connectivity.

Attendance persistence

Attendance changes are submitted through the API and stored in MySQL according to the backend's data model.

The API documents an upsert operation for check-ins, allowing an existing date's attendance status to be updated.

Holiday persistence

Holiday entries are created or updated through the holiday API and stored in the holidays table.

The project notes describe the holiday table as shared and the manual holiday feature as per-user. These descriptions should be reconciled against the actual schema and authorization logic before relying on per-user holiday isolation.

Backups and recovery

For production use, establish a database backup and recovery process appropriate to the hosting environment.

At minimum:

- Back up attendance and holiday data regularly.
- Protect backup files and database exports.
- Restrict access to production database credentials.
- Test restoration periodically.
- Document the recovery procedure.

---

12. Authentication and Password Reset

The backend provides registration, login, and password-reset endpoints.

Password-reset workflow

1. The user requests a password reset using their registered email address.
2. The backend processes the request and sends an email when the required configuration is available.
3. The user follows the reset workflow using the provided token.
4. The backend validates the token and processes the new password.

The actual token expiration, invalidation, password policy, and email-response behavior must be confirmed in the implementation.

SMTP requirements

Valid SMTP configuration is required for password-reset email delivery.

If email is not working:

- Confirm that the required environment variables exist.
- Check the SMTP host, port, username, and password.
- Verify the sender address and provider requirements.
- Inspect backend logs for Nodemailer errors.
- Check the recipient's spam folder.
- Restart the backend if its environment configuration has changed.

Production security checklist

Before exposing the application publicly, verify that:

- Passwords are securely hashed.
- JWT validation is enforced on protected endpoints.
- User-specific attendance access is enforced server-side.
- Password-reset tokens are securely generated, expire, and cannot be reused.
- Login and password-reset endpoints have appropriate rate limiting.
- Sensitive configuration is not committed to source control.
- Production traffic uses HTTPS.
- Error responses do not expose secrets or unnecessary internal details.

These are recommended validation items, not claims that every control is already implemented.

---

13. Production Deployment

The project documentation describes a GitHub Actions workflow that deploys the frontend and backend through FTP.

The deployment process also excludes sensitive files such as ".env" and "db.json".

Deployment checklist

Before deployment

- Confirm that the correct release or branch is being deployed.
- Install dependencies using the repository's intended process.
- Build the Angular frontend using the project's production build configuration.
- Verify backend dependencies and environment configuration.
- Confirm the production database and schema are ready.
- Review the deployment workflow and excluded files.
- Back up production data before schema changes.

During deployment

- Upload the intended frontend build artifacts.
- Deploy the backend files required by the production runtime.
- Ensure the server's ".env" remains available outside the deployed source package.
- Confirm that the deployed API and frontend use the correct production configuration.
- Restart the Node.js application using the hosting control panel or configured workflow step, if required.

After deployment

- Confirm that the frontend loads successfully.
- Test login and attendance operations.
- Verify holiday retrieval and editing.
- Verify monthly and YTD calculations.
- Test password recovery if SMTP is configured.
- Inspect backend logs for errors.
- Confirm that production secrets are not publicly accessible.

Shared hosting considerations

The documented hosting approach uses FTP deployment and a Node.js application on a hosting environment.

Confirm that the production hosting plan supports the required Node.js runtime, application startup process, database connectivity, and environment configuration.

Do not assume that a successful FTP upload means the application is running correctly.

---

14. Troubleshooting

HTTP 500 errors on login or password recovery

Possible causes include:

- Missing or incorrect environment variables.
- Database connection failures.
- JWT configuration errors.
- SMTP authentication or delivery errors.
- Unexpected backend exceptions.

Recommended checks:

1. Review the backend logs.
2. Confirm that the required environment variables are present.
3. Verify database connectivity.
4. Check SMTP configuration when the failure concerns email.
5. Restart the application after configuration changes, if required.

"express-rate-limit" X-Forwarded-For error

The project documentation states that the Express application configures:

app.set('trust proxy', 1);

This setting is intended to support operation behind a trusted proxy.

Verify that the actual proxy topology matches this configuration. Trusting an incorrect number of proxy hops or trusting untrusted proxy headers can undermine IP-based rate limiting.

Password-reset email is not sent

Check:

- SMTP host and port.
- SMTP username and password.
- Sender address configuration.
- Email provider authentication requirements.
- Backend logs for Nodemailer errors.
- Spam and junk folders.

Frontend cannot connect to the backend

Check:

- The backend is running on the expected port.
- The Angular proxy points to the correct backend.
- The request uses the correct "/api" path.
- The browser console and backend logs for errors.
- Production frontend API configuration, if the problem occurs after deployment.

Attendance does not persist

Check:

- The API request succeeds.
- The backend is connected to the intended MySQL database.
- The database user has the required permissions.
- The date and status pass backend validation.
- The frontend refreshes or updates its state after saving.

Compliance figures appear incorrect

Check:

- The selected month and year.
- The configured public holiday records.
- Approved absences on Tuesday, Wednesday, and Thursday.
- Whether Monday and Friday are excluded.
- The calculation logic in "rtoUtils.js".
- Whether the monthly and YTD endpoints use consistent rules.

Holiday changes affect unexpected records

Inspect the holidays table and its schema. Confirm whether holiday records are global or associated with individual users, and whether the API enforces the intended ownership rules.

---

15. Known Documentation Considerations

The following items should be validated against the repository before this README is treated as a complete technical specification.

1. Holiday ownership: The documentation describes manual holidays as per-user while also describing a shared holidays table. Confirm whether holidays are global, user-specific, or shared within another scope.

2. Compliance edge cases: Verify zero expected days, approved absences, holidays, and duplicate attendance records against "rtoUtils.js".

3. YTD calculation: Confirm that YTD aggregates the intended January-through-selected-month period and handles all relevant exclusions consistently.

4. Date and timezone behavior: Confirm how today's date is determined and whether backend, database, and frontend date handling use consistent calendar dates.

5. Authentication and authorization: Verify which endpoints require JWT authentication and how records are isolated between users.

6. Holiday seed coverage: The supplied documentation confirms seed data for 2026. Future public holiday coverage should not be assumed to update automatically unless a corresponding process exists.

7. Deployment configuration: Confirm the GitHub Actions workflow, production build command, FTP targets, excluded files, and application restart mechanism.

8. Version metadata: The current README declares version 5.2.0, but the supplied changelog only documents releases through v5.1.0. The v5.2.0 release notes should be added after its changes are confirmed.

---

16. Version History

v5.2.0

The README identifies this as the current documented version.

Release details: Add the confirmed changes introduced in this release before publishing a detailed changelog entry.

v5.1.0 — June 2026

- Feature: Added a YTD compliance widget to the dashboard statistics row.
- Backend: Added "GET /api/attendance/ytd?year=&month=" to aggregate RTO statistics from January through the selected month.
- Frontend: Added the "YtdData" model, "getYtdData()" service method, and "ytdData" property in the calendar component.
- UI: Added color-coded YTD compliance indicators:
  - Green: 90% and above.
  - Amber: 70% to below 90%.
  - Red: below 70%.
- Layout: Updated the statistics row to a six-column grid.

v5.0.0

- Added manual holiday entry through the calendar day modal.
- Added holiday-name prefilling when editing an existing holiday.
- Introduced the documented shared holidays table for holiday management alongside attendance records.

---

License

No license information was provided in the supplied project documentation. Add a license section if the repository has an approved license.

---

Project Maintenance

Keep this README aligned with the actual source code, database schema, environment configuration, and deployment workflow.

When a release changes API contracts, attendance rules, authentication, or deployment behavior, update the corresponding documentation and version history together.