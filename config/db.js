const mysql = require("mysql2/promise.js")
require("dotenv").config()
const conectionDetails = {
    host: process.env.HOST,
    user: process.env.PERSON,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000,
}

    const db = mysql.createPool(conectionDetails)

    
module.exports = db;