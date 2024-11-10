const mysql = require("mysql2")
require("dotenv").config()
const conectionDetails = {
    host: process.env.HOST,
    user: process.env.PERSON,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
}
const db = ()  => {
    const db = mysql.createConnection(conectionDetails)

    db.connect((err) => {
        if (err) {
          console.error('Database connection failed:', err.stack);
          return;
        }
        console.log('Connected to MySQL database.');
      });

    return db;
}
module.exports = db;