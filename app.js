const express = require("express");
const app = express();
const PORT = "8080";
const moogoose = require("mongoose");
moogoose.connect("mongodb://localhost:27017/auth_demo_app", {useNewUrlParser: true});
const bodyParser = require("body-parser");
const passport = require("passport");
const localStrategy = require("passport-local")
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./models/user");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
	secret: "This is a check to see if express-session is working properly",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ROUTES
app.get('/', (req, res) => {
	res.render("home");
});

app.get("/secret", isLoggedIn, (req, res) => {
	res.render("secret");
});

// AUTHENTICATION ROUTES
app.get("/register", (req, res) => {
	res.render("register");
});

app.post('/register', (req, res) => {
	var username = req.body.username;
	var password = req.body.password;
	User.register(new User({username: username}), password, (err, user)=>{
		if(err) {
			console.log(err);
			return res.render('register');
		} else {
			passport.authenticate("local")(req, res, () => {
				res.redirect('/secret');
			});
		}
	});
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.post('/login', passport.authenticate("local", {
	successRedirect: "/secret",
	failureRedirect: "/login"
}), (req, res) => {
});

app.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

// SERVER
app.listen(PORT, (req, res, PORT) => {
	console.log("Server is listening on port ${PORT}");
});


