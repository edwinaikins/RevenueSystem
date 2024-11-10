const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require("./db");


module.exports = function(passport) {
  passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    // Query to find the user by email
    db.query('SELECT * FROM users WHERE email = ?', [email], async(err, results) => {
      if (err) return done(err);
      if (results.length === 0) {
        return done(null, false, { message: 'No user with that email' });
      }

      const user = results[0];
      
      // Compare passwords
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Password incorrect' });
        }
      });
    });
  }));

  // Serialize and deserialize user
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
      if (err) throw err;
      done(null, results[0]);
    });
  });
};
