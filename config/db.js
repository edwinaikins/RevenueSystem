const mysql = require("mysql2")
require("dotenv").config()
const conectionDetails = {
    host: process.env.HOST,
    user: process.env.PERSON,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
}

    const db = mysql.createPool(conectionDetails)

    
module.exports = db;