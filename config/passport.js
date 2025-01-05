const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require("./db");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        // Query to find the user by email
        const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (results.length === 0) {
          return done(null, false, { message: "No user with that email" });
        }

        const user = results[0];

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Password incorrect" });
        }
      } catch (err) {
        console.error("Error during authentication:", err);
        return done(err);
      }
    })
  );

  // Serialize user to store user ID in session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user to retrieve user details by ID
  passport.deserializeUser(async (id, done) => {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (rows.length > 0) {
            return done(null, rows[0]);
        } else {
            return done(null, false);
        }
    } catch (error) {
        console.error('Error during user deserialization:', error);

        // Handle ECONNRESET specifically
        if (error.code === 'ECONNRESET') {
            return done(new Error('Database connection was reset. Please try again.'));
        }
        return done(error);
    }
});
};
