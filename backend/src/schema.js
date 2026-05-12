const pool = require('./db');

async function runSchema() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS production (
      productionid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      productionname VARCHAR NOT NULL,
      productiontype VARCHAR NOT NULL
    );

    CREATE TABLE IF NOT EXISTS performance (
      performanceid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      performancedate TIMESTAMP NOT NULL,
      performancetype VARCHAR CHECK (performancetype IN ('matinee', 'evening')) NOT NULL,
      productionid UUID REFERENCES production(productionid)
    );

    CREATE TABLE IF NOT EXISTS seat (
      seatid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      seatnumber VARCHAR NOT NULL UNIQUE,
      seatcategory VARCHAR CHECK (seatcategory IN ('Orchestra', 'Mezzanine', 'Balcony', 'Box')) NOT NULL,
      price DECIMAL(10,2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS patron (
      patronid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      firstname VARCHAR NOT NULL,
      lastname VARCHAR NOT NULL,
      streetaddress VARCHAR,
      city VARCHAR,
      state VARCHAR,
      zipcode VARCHAR,
      phonenumber VARCHAR,
      email VARCHAR UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ticket (
      ticketid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patronid UUID REFERENCES patron(patronid),
      performanceid UUID REFERENCES performance(performanceid),
      seatid UUID REFERENCES seat(seatid),
      UNIQUE(performanceid, seatid)
    );

    CREATE TABLE IF NOT EXISTS users (
      userid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR UNIQUE NOT NULL,
      passwordhash VARCHAR NOT NULL,
      role VARCHAR CHECK (role IN ('clerk', 'manager')) NOT NULL
    );
  `);
  console.log('Schema ready');
}

module.exports = { runSchema };
