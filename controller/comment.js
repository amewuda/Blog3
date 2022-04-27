const express = require("express");
const router = express.Router({MergeParams:true});
const Blog = require("../models/blog");
const Comment = require("../models/comment");


//comment new form
router.get("/blogs/:id/comments/new", function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
    if (err){
        console.log(err);
    } else{
        res.render("comments/new", {blog:foundBlog});
    };
});
});

//post comment
router.post("/blogs/:id/comments", function(req,res){
    Blog.findById(req.params.id, function(err, handledBlog){
        if (err){
            console.log(err);
            res.redirect("/blogs");
        } else{
            //console.log(req.body.comment);
            Comment.create(req.body.comment, function(err, comment){
                if (err){
                    console.log(err);
                } else{
                    //add User id and username
                    //console.log(req.user._id, req.user.username );
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment related to user
                    comment.save();
                    //add comment to blog by pushing it
                    handledBlog.comments.push(comment);
                    handledBlog.save();
                    res.redirect("/blogs/" + req.params.id);
                }
            });
        }
    })
});

//Edit comment blogs/:id/comments/:id
router.get("/blogs/:id/comments/:comment_id/edit", checkCommentOwnership ,function(req,res){
    Comment.findById(req.params.comment_id, function(err,foundBlog){
        if (err){
            res.redirect("back");
        } else{
            res.render("comments/edit", {blog_id:req.params.id, comment:foundBlog});
        }
    });
});

//Update comment route blogs/:id/comments/:id
router.put("/blogs/:id/comments/:comment_id", checkCommentOwnership ,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedBlog){
        if (err){
            res.redirect("back");
        } else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//Delete comment route blogs/:id/comments/:comment_id
router.delete("/blogs/:id/comments/:comment_id", checkCommentOwnership, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err,deleteBlog){
        if (err){
            res.redirect("back");
        } else{
            res.redirect("/blogs/" + req.params.id);
        }
    })
});

// isLoggedIn middleware
function isLoggedIn (req,res,next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

// checkCommentOwnership middleware
function checkCommentOwnership (req,res,next){
    if (req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if (err){
                res.redirect("back");
            } else{
                // does user own the blog?
                if (foundComment.author.id.equals(req.user._id)){
                    next();
                } else{
                    res.redirect("back");
                }
            }
        });
    }
};

module.exports = router;