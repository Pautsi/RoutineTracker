
Project for course Web Software Development in Aalto University.
A self-monitoring app with authentication functionality. User can report daily data and view personal monthly and weekly data.
All users can see overview on all users' data.


Guidelines for running the application
======================================

Starting the application
------------------------

1. Set up database using three CREATE commands documented below.
2. Place database information in config.js.
3. Run app.js in the root folder.
3.1 If experiencing difficulties, try command "deno run --allow-net --allow-read --allow-write --unstable  app.js".
4. Application can be tried out locally in "http://localhost:7777".
5. When using the application in browser, use Chrome in incognito mode.


Creating the database
----------------------

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  password CHAR(60) NOT NULL
);

CREATE UNIQUE INDEX ON users((lower(email)));

CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  hours DECIMAL(4, 2),
  time VARCHAR(100),
  date DATE,
  quality NUMERIC(10, 2)
);


General instructions
---------------------

When using this application, note that:
* there are no automated tests.
* it is only available locally, not in an online location (e.g. Heroku).
* there is no API endpoint.
* at this point, database credentials are included in the code.
* week and month selection for summary will not work in e.g. Firefox. They work in Google Chrome.
* sessions may not work properly without incognito mode in browser.