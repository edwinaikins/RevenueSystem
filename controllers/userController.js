const db = require("../config/db")
const bcrypt = require("bcrypt");
const passport = require("passport");


exports.showLoginPage = (req,res)=>{
    res.render("login", { layout: false, pageTitle: 'Login Page' })
}

exports.registerUser = async (req, res) => {
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
        res.redirect('/user/login');
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error registering user');
    }
  }

  exports.authUser = (req, res, next) => {
    
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err); // Log the error to the console
        return next(err); // Pass the error to the next middleware
      }
      if (!user) {
        console.warn("Login failed:", info.message); // Log the failure reason to the console
        req.flash('error', info.message || 'Invalid email or password');
        return res.redirect('/user/login');
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err); // Log the login error to the console
          return next(err);
        }
        return res.redirect('/user/dashboard');
      });
    })(req, res, next);
  }

  exports.logout = (req, res) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect('/user/login');
    });
  }

  exports.getDashboard = (req, res) => {
    res.render('dashboard', { user: req.user });
  }