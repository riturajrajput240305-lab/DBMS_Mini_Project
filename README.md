# Online Sports Tournament Planner

A comprehensive DBMS mini project based on an IPL-style sports tournament planner.

## Architecture & Storage
- **`database.sql` — Single Source of Truth**: Full Oracle SQL schema, constraints, sample records, complex queries, analytical points calculation, and indexes. All application data (Teams, Players, Matches, Scoreboard, Player Stats, Venues) is stored in and synchronized directly to this SQL file.
- **`tournament-planner-react/` — Modern React 19 Frontend**:
  - **iOS Glassmorphism & Framer Motion**: Frosted glass effects (`backdrop-filter: blur(20px)`), smooth animations, full-screen snap-scrolling cards.
  - **Cricket History Constellation Background**: Interactive background featuring historic milestone dates in cricket that brighten and reveal details on mouse hover.
  - **Public View & Admin View**: Public portal for fans (live match scores, points table, squad rosters, stats) and an authenticated Admin Portal for organizers.
  - **Live SQL Sync**: Direct two-way synchronization with `database.sql` on disk. Changes made in the UI update `database.sql` in real-time.
- **`STUDY_GUIDE.md`**: Complete theoretical and viva preparation guide covering SQL queries, normalization, ACID properties, subqueries, and execution in Oracle SQL Developer.

---

## Quick Start

### 1. Launch the React Web Application
```bash
cd tournament-planner-react
npm install
npm run dev
```
Open **http://localhost:3000/** in your browser.

- **Public View**: Displays fixtures, live match scores, points table leaderboard, and squad rosters.
- **Admin Login**: Click **"🔒 Admin Login"** in the top navbar.
  - **Username**: `admin`
  - **Password**: `admin123` *(or `admin`)*
- **Live SQL Inspection**: In Admin Mode, click **"💾 database.sql"** to view and download the live SQL file anytime.

### 2. Execute in Oracle SQL Developer
1. Open Oracle SQL Developer and connect to your database schema.
2. Open `database.sql`.
3. Run the script using **Run Script (F5)**.
4. Verify results in the Script Output panel.

---

## DBMS Concepts Demonstrated
- **Table Constraints**: PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, NOT NULL, CASCADE CONSTRAINTS.
- **Relational Integrity**: Bidirectional Team-Captain and Team-Venue foreign keys.
- **Complex Subqueries**: Points table calculation with conditional aggregation (`SUM(CASE ...)`).
- **Analytic Functions**: `DENSE_RANK() OVER (...)` for dynamic standings ranking.
- **String Matching**: `LIKE` and `UPPER`/`LOWER` pattern matching for player and city search.
- **Indexes**: Performance indexing on player names, roles, match dates, and scoreboards.
