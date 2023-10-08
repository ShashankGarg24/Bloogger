const express = require('express')
const Blog = require('../models/Blog')
const Comment = require('../models/Comment')
const { jwtAuth } = require('../middlewares/jwtAuth')
const User = require('../models/User')
const sendNotificationToUser  = require('../config/socket')
const router = express.Router()


router.get('/:blogId', async(req, res)=>{

    try{
        const blogId = req.params.blogId;
        const blog = await Blog.findById(blogId);

        const blogCommentIds = blog.comments;
        const blogComments = [];
        await Promise.all(blogCommentIds.map( async (commentId) => {
            const comment = await Comment.findById(commentId)
            if(comment){
                blogComments.push(comment);
            }
        }));

        return res.status(200).send(blogComments);
    }catch(err){
        return res.status(400).send("Unable to post comment");
    }
})


router.post('/:blogId', jwtAuth, async(req, res)=>{

    try{
        const blogId = req.params.blogId
        const user = req.user
        const comment = Comment({
            author: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName
            },
            text: req.body.content,
            dateTime: new Date(),
            parentCommentId: req.body.parentCommentId
        })

        const postedComment = await comment.save();
        console.log(postedComment)
        const blog = await Blog.findById(blogId);
        var blogComments = blog.comments
        blogComments.push(postedComment);
        await Blog.findByIdAndUpdate(blog._id, {comments: blogComments});
        sendNotificationToUser(user.firstName + " " + user.lastName, blog.author, blog._id, 2)
        return res.status(200).send(postedComment);
    }catch(err){
        return res.status(400).send("Unable to post comment");
    }
})

router.patch('/:blogId', jwtAuth, async(req, res)=>{

    try{
        const commentId = req.body.commentId;
        const updatedText = req.body.updatedText;
        const comment = await Comment.findById(commentId);
        console.log(comment)

        const user = req.user;
        if(user._id != comment.author.id){
            return res.status(403).send("Forbidden access");
        }
        await Comment.findByIdAndUpdate(comment._id, {text: updatedText});

        return res.status(200).send("Comment Updated");
    }catch(err){
        return res.status(400).send("Unable to update comment");
    }
})

router.delete('/:blogId/:commentId', jwtAuth, async(req, res)=>{

    try{
        const commentId = req.params.commentId;
        const comment = await Comment.findById(commentId);
        console.log(comment)

        const user = req.user;
        if(user._id != comment.author.id){
            return res.status(403).send("Forbidden access");
        }
        await Comment.findByIdAndDelete(comment._id);

        const blogId = req.params.blogId;
        await Blog.updateOne({_id: blogId},{
            $pull:{
                comments:comment._id
            }
        })
        return res.status(200).send("Comment Deleted");
    }catch(err){
        return res.status(400).send("Unable to delete comment");
    }
})

module.exports = router