const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const home = require("./controller/home");
const secret = require("./controller/secret");
const user = require("./controller/user");
const User = require("./models/user");
const Blog = require("./models/blog");
const blog = require("./controller/blog")
const Comment = require("./models/comment");
const comment = require("./controller/comment");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const app = express();

mongoose.connect("mongodb://localhost/adb");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());
app.use(require("express-session")({
    secret: "Secret code",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(user);
app.use(blog);
app.use(comment);

app.get("/", home);
app.get("/secret", secret);





app.listen(3000, function(){
    console.log("SERVER HAS STARTED");
});