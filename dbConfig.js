require('dotenv').config();

const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const connectionString = `${process.env.DB_LINK}`;

const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString
});

module.exports = { pool };

