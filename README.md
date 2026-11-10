# Online Sports Tournament Planner

A DBMS mini project based on an IPL-style sports tournament planner.

## Included
- `database.sql` — Oracle SQL schema, constraints, sample records, indexes and queries.
- `index.html` — Responsive tournament dashboard UI.
- `style.css` — Styling and responsive layouts.

## Database setup (Oracle SQL Developer)
1. Open SQL Developer and connect to your schema.
2. Open `database.sql`.
3. Execute the script from top to bottom using **Run Script (F5)**.
4. Review the query outputs in the Script Output / Results panel.

Important: This script is designed for a fresh schema. If you have already created these tables, drop the tables in reverse dependency order before rerunning:
PLAYER_STATS, SCOREBOARD, MATCH_SCHEDULE, PLAYER, TEAM, VENUE.

## Frontend setup
Open `index.html` directly in a browser. No build tools or server are required.

## Scope / limitations
- PL/SQL procedures and triggers are intentionally excluded as requested.
- The HTML/CSS frontend is a static prototype populated with illustrative sample data. It is not connected to Oracle. A backend (for example Java JDBC, PHP, or Node.js) is needed for live database integration.
- Points table logic is demonstrated in `database.sql` using SQL aggregation, conditional expressions, subqueries and analytic ranking.
- The sample points shown in the static page are illustrative and should be refreshed if you change the SQL sample data.

## Main DBMS concepts demonstrated
Primary keys, foreign keys, UNIQUE, CHECK, NOT NULL, joins, LIKE, aggregate functions, GROUP BY, subqueries, CASE, NVL, DENSE_RANK and indexes.
# DBMS_Mini_Project
# DBMS_Mini_Project
# DBMS_Mini_Project
