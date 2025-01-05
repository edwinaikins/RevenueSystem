const db = require("../config/db");
const bcrypt = require("bcrypt");
const passport = require("passport");

exports.showLoginPage = (req, res) => {
    res.render("login", { layout: false, pageTitle: 'Login Page' });
};

exports.registerUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Hash the password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert user into the database
        const [result] = await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

        // Redirect to login on successful registration
        //back end responds
        res.send({msg:"registered Successfully"})
        //res.redirect('/user/login');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.warn("Registration failed: User already exists."); // Log duplicate entry warning
            return res.status(400).send('User already exists.');
        }
        console.error("Error registering user:", err); // Log other errors
        res.status(500).send('Error registering user');
    }
};

exports.authUser = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error("Authentication error:", err); // Log authentication errors
            return next(err);
        }
        if (!user) {
            console.warn("Login failed:", info.message); // Log failure reason
            req.flash('error', info.message || 'Invalid email or password'); // Use flash messages for user feedback
            return res.redirect('/user/login');
        }

        // Log in the user
        req.logIn(user, (err) => {
            if (err) {
                console.error("Login error:", err); // Log login errors
                return next(err);
            }
            return res.redirect('/dashboard');
        });
    })(req, res, next);
};

exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            console.error("Logout error:", err); // Log logout errors
            return next(err);
        }
        res.redirect('/user/login');
    });
};

exports.getDashboard = (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'Please log in to access the dashboard.');
        return res.redirect('/user/login');
    }
    res.render('dashboard', { user: req.user });
};
