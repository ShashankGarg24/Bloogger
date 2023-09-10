const express = require('express')
const Blog = require('../models/Blog')
const router = express.Router()

router.get('/', async(req, res)=>{
    try{
        const blogs = await Blog.find()
        res.status(200)
        .json(blogs)
    }catch(err){
        res.status(400)
        .send("Error in fetching blogs")
        console.log(err)
    }
})

router.get('/:id', async(req, res)=>{
    const blogId = req.params.id
    try{
        const blogs = await Blog.findById(blogId)
        res.status(200)
        .json(blogs)
    }catch(err){
        res.status(400)
        .send("Error in fetching blog with id " + blogId)
        console.log(err)
    }
})

router.post('/', async(req, res)=>{
    const blog = new Blog({
        blogName: req.body.blogName,
        author: req.body.author
    })
    try{
        const blogObj = await blog.save()
        res.status(201)
        // .json(blogObj)
        .send("Blog successfully uploaded")

    }catch(err){
        res.status(400)
        .send("Error in uploading blog")
        console.log(err)
    }

})

module.exports = router