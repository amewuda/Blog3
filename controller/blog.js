const mongoose = require("mongoose");
const Blog = require("../models/blog");
const express = require("express");
const methodOverride = require("method-override");


const router = express.Router();

// Blog.create({
//     title: "Test Blog",
//     image: "https://jhdflifisdllufs",
//     body: "Hello this is our blog post"
// });

//get all blogs on database
router.get("/blogs", function(req,res){
    Blog.find({}, function(err,blogs){
        if (err){
            console.log(err);
        } else{
            res.render("blog/index", {blogs:blogs});
        }
    }); 
});

// router.get("/blogs", function(req,res){
//     res.redirect("/hi");
// });
// form for new blog
router.get("/blogs/new", isLoggedIn, function(req,res){
    res.render("blog/new");
});
//create the post blog
router.post("/blogs", function(req,res){
    //this is for the user id and username
    const author = {
        id: req.user._id,
        username: req.user.username
    };
    const title = req.body.title;
    const image = req.body.image;
    const body = req.body.body;
    const room = {title:title, image:image, body:body, author:author};
    Blog.create(room, function(err, postBlog){
        if (err){
            console.log(err);
        } else{
            res.redirect("/blogs");
        }
    })
});

//show each blog
router.get("/blogs/:id", isLoggedIn, function(req,res){
    Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlog){
        if (err){
            console.log(err)
        } else{
            res.render("blog/show", {blog:foundBlog});
        }
    })
});
//edit blog
router.get("/blogs/:id/edit", checkBlogOwnership,function(req,res){
    Blog.findById(req.params.id, function(err, editedBlog){
        if (err){
            console.log(err);
            res.redirect("/blogs");
        } else{
            res.render("blog/edit", {blog:editedBlog});
        }
    })
});

//update blog
router.put("/blogs/:id", checkBlogOwnership, function(req,res){
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err,updatedBlog){
        if (err){
            res.redirect("/blogs");
        } else{
            res.render("/blogs/" + req.params.id);
        }
    })
});

//delete blog
router.delete("/blogs/:id",checkBlogOwnership, function(req,res){
    Blog.findByIdAndRemove(req.params.id, function(err, deletedBlog){
        if (err){
            console.log(err)
            res.redirect("/blogs");
        } else{
            res.redirect("/blogs");
        }
    })
});

//middleware to check blog ownership and authorization
function checkBlogOwnership (req,res,next){
   if (req.isAuthenticated()){
       Blog.findById(req.params.id, function(err, foundBlog){
           if (err){
               res.redirect("back");
           } else{
               if (foundBlog.author.id.equals(req.user._id)){
                   next();
               } else{
                   res.redirect("back");
               }
           }
       });
   } else{
       res.redirect("back");
   }
};

//middleware
function isLoggedIn (req,res,next){
    if (req.isAuthenticated()){
        return next();
    }
    //Now we will show the user to login
    req.flash("error", "You have to login");
    res.redirect("/login");
};

module.exports = router;