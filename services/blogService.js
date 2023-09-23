const express = require('express')
const Blog = require('../models/Blog')
const blogUtils = require('../utilities/blogUtilities')
const BlogCategory = require('../models/BlogCategory')
const { getUserFromAuth, jwtAuth } = require('../middlewares/jwtAuth')


const router = express.Router()

router.get('/', async(req, res)=>{
    try{
        // const blogs = await Blog.find({ createdOn: { $lte: req.createdOnBefore } } )
        // .limit( 1 )
        // .sort( '-createdOn' )
        const blogs = await Blog.find()
        res.status(200).json(blogs)
    }catch(err){
        res.status(400).send("Error in fetching blogs")
        console.log(err)
    }
})

router.get('/:id', async(req, res)=>{
    const isHeaderPresent = req.get("isHeaderPresent")
    const bearerToken = req.get("header")
    const blogId = req.params.id
    try{
        var blog = await Blog.findById(blogId).lean()
        if(blog == null){
            return res.status(404).json("Blog not available")
        }
        var isLikedByCurrentUser = false;
        if(isHeaderPresent){
            const _user = getUserFromAuth(bearerToken)
            const userId = _user?._id
            if(userId && blog.likes.includes(userId)){
                isLikedByCurrentUser = true;
            }
        }
        blog = {...blog, isLikedByCurrentUser: isLikedByCurrentUser}
        console.log(blog)
        res.status(200).json(blog)
    }catch(err){
        res.status(400).send("Error in fetching blog with id " + blogId)
        console.log(err)
    }
})

router.post('/', jwtAuth, async(req, res)=>{
    
    try{    
        const _category = await BlogCategory.findOne({categoryName: req.body.category})
        console.log(_category)

        if(_category == null){
            _category = await BlogCategory.findOne({categoryName: 'Other'})
        }

        var dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const dateTime = new Date().toLocaleDateString([],dateOptions);

        const blog = new Blog({
            // blogTitle: req.body.title,
            author: req.user,
            blogContent: req.body.content,
            readingTime: blogUtils.calculateReadingTimeForBlog(req.body.title, req.body.content) + " min",
            tags: req.body.tags,
            category: _category._id,
            publishedDateTime: dateTime
        })

        const updatedCategoryBlogs = _category.blogs.push(blog)
        const updatedCategory = {..._category, blog: updatedCategoryBlogs}
        await BlogCategory.findByIdAndUpdate(_category._id, updatedCategory)
        const _blog = await blog.save()
            
        res.status(201)
        .send(_blog._id)

    }catch(err){
        res.status(400).send("Error in uploading blog")
        console.log(err)
    }

})

router.post('/like-unlike', jwtAuth, async(req, res)=>{
    const blog = await Blog.findById(req.body.blogId)
    var message = null
    if(blog){
        const userId = req.user._id
        const userLikes = blog.likes
        if(userLikes.includes(userId)){
            const index = userLikes.indexOf(userId)
            userLikes.splice(index, 1)
            message = "Blog Unliked"
        }else{
            userLikes.push(userId)
            message = "Blog liked"
        }
        await Blog.findByIdAndUpdate(blog._id, {likes: userLikes})
    }

    console.log("End")
    return res.status(200).send(message)
})

router.delete('/:id', async(req,res) =>{
    const blogId = req.params.id
    const deletedBlog = await Blog.findByIdAndDelete(blogId)
    res.send("Blog deleted")
})

module.exports = router