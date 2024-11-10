const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session")
const db = require("./config/db");
const path = require("path");
const PORT = process.env.PORT || 3000;
const expressLayouts = require('express-ejs-layouts');

const app = express();

app.use(expressLayouts);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set('layout', 'layouts/layout');

app.get("", (req, res) => {
    res.render("dashboard")
})


app.listen(PORT, ()=> console.log(`Server listening on http://localhost:${PORT}`))