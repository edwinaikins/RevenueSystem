const express = require("express");
const session = require("express-session")
const path = require("path");
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const expressLayouts = require('express-ejs-layouts');
const passport = require("passport");
require("./config/passport")(passport);
const flash = require("connect-flash");
const errorHandler = require("./middleware/errorHandler");
const userRoute = require("./routes/userRoute");
const clientRoute = require("./routes/clientRoute");
const businessRoute = require("./routes/businessRoute");
const settingsRoute = require("./routes/settingsRoute");
const propertyRoute = require("./routes/propertyRoute");
const billingRoute = require("./routes/billingRoute");
const paymentRoute = require("./routes/paymentRoute");
const reportRoute = require("./routes/reportRoute")
const app = express();

app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));



app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


app.engine('ejs', require('ejs').__express);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set('layout', 'layouts/layout');

app.use("/user", userRoute);
app.use("/client", clientRoute);
app.use("/business", businessRoute);
app.use("/settings", settingsRoute);
app.use("/property", propertyRoute);
app.use("/billing", billingRoute);
app.use("/payment", paymentRoute);
app.use("/report", reportRoute);

  
app.use(errorHandler)

app.listen(PORT, ()=> console.log(`Server listening on http://localhost:${PORT}`))