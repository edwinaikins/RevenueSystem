const express = require("express");
const session = require("express-session")
const path = require("path");
const PORT = process.env.PORT || 3000;
const expressLayouts = require('express-ejs-layouts');
const passport = require("passport");
require("./config/passport")(passport);
const flash = require("connect-flash");
const errorHandler = require("./middleware/errorHandler");
const userRoute = require("./routes/userRoute")
const clientRoute = require("./routes/clientRoute")
const app = express();

app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());


app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set('layout', 'layouts/layout');

app.use("/user", userRoute);
app.use("/client", clientRoute);


  
app.use(errorHandler)

app.listen(PORT, ()=> console.log(`Server listening on http://localhost:${PORT}`))