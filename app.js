const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session")
const db = require("./config/db");
const path = require("path");
const PORT = process.env.PORT || 3000;
const expressLayouts = require('express-ejs-layouts');
const passport = require("passport");
require("./config/passport")(passport);
const bcrypt = require("bcrypt");
const flash = require("connect-flash")

const app = express();

app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());


app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set('layout', 'layouts/layout');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }
  
  app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user });
  });
  

// app.get("", (req, res) => {
//     res.render("dashboard")
// })
app.get("/login", (req,res)=>{
    res.render("login", { layout: false, pageTitle: 'Login Page' })
})

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).send('User already exists.');
        }
        throw err;
      }
      res.redirect('/login');
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user');
  }
});


app.post('/login', (req, res, next) => {
    
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err); // Log the error to the console
        return next(err); // Pass the error to the next middleware
      }
      if (!user) {
        console.warn("Login failed:", info.message); // Log the failure reason to the console
        req.flash('error', info.message || 'Invalid email or password');
        return res.redirect('/login');
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err); // Log the login error to the console
          return next(err);
        }
        return res.redirect('/dashboard');
      });
    })(req, res, next);
  });
  

app.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect('/login');
    });
  });
app.get("/register/client", (req, res)=>{
    res.render("clients")
})
  app.post("/register/client", async(req, res) => {
    const { firstname, lastname, contact, email, address } = req.body;
    try{
        db.query("INSERT INTO clients (firstname, lastname, contact, email, address) VALUES (?, ?, ?, ?, ?)", [firstname, lastname, contact, email, address], (err, results) =>{
            if(err){
                throw err;
            }
            res.status(200).send("Client Created Succesfully")
        })
    }
    catch(err){
        console.error(err);
        res.status(500).send('Error creating client');
    }
  })
  


app.listen(PORT, ()=> console.log(`Server listening on http://localhost:${PORT}`))