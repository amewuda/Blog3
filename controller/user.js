const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/user");

passport.use(new LocalStrategy(User.authenticate()));
router.get("/new", function(req,res){
    res.render("auth/new");
});


//Auth routes
router.get("/register", function(req,res){
    res.render("auth/register");
});

router.post("/register", function(req,res){
    User.register(new User({username: req.body.username}), req.body.password, function(err,user){
        if (err){
            console.log(err)
            return res.redirect("auth/register")
        }
        passport.authenticate("local")(req,res, function(){
            res.redirect("/blogs");
        });

    });
});

router.get("/login", function(req,res){
    res.render("auth/login");
});

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/blogs",
        failureRedirect: "/auth/login"
    }), function(req,res){

});

router.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "You have successfully logged out");
    res.redirect("/");
});

function isLoggedIn (req,res,next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect("/auth/login");
};


module.exports = router