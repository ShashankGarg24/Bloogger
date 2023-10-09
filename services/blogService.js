const express = require('express')
const Blog = require('../models/Blog')
const blogUtils = require('../utilities/blogUtilities')
const BlogCategory = require('../models/BlogCategory')
const { getUserFromAuth, jwtAuth } = require('../middlewares/jwtAuth')
const User = require('../models/User')
const { extractTitleFromContent } = require('../utilities/blogUtilities')
const { getBlogsForCardsFrom } = require('../utilities/blogUtilities')
const Comment = require('../models/Comment')
const events = require('events');
const eventEmitter = new events.EventEmitter();


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
        const authorId = blog.author
        const author = await User.findById(authorId)
        const authorName = author.firstName + " " + author.lastName

        var isLikedByCurrentUser = false;
        var isBookmarkedByCurrentUser = false;
        if(isHeaderPresent){
            const _user = await getUserFromAuth(bearerToken)
            const userId = _user?._id.valueOf()
            if(userId && blog.likes.includes(userId)){
                isLikedByCurrentUser = true;
            }

            if(blogId && _user.bookmarks.includes(blogId)){
                isBookmarkedByCurrentUser = true;
            }
        }
        blog = {...blog, isLikedByCurrentUser: isLikedByCurrentUser, isBookmarkedByCurrentUser: isBookmarkedByCurrentUser, authorId: authorId, authorName: authorName}
        console.log(blog)
        res.status(200).json(blog)
    }catch(err){
        res.status(400).send("Error in fetching blog with id " + blogId)
        console.log(err)
    }
})

router.post('/', jwtAuth, async(req, res)=>{
    
    try{    
        var _category = await BlogCategory.findOne({categoryName: req.body.category})
        console.log(_category)

        if(_category == null){
            _category = await BlogCategory.findOne({categoryName: 'Other'})
        }

        var dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const dateTime = new Date().toLocaleDateString([],dateOptions);

        const blog = new Blog({
            blogTitle: await extractTitleFromContent(req.body.content),
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

        const _user = await User.findById(req.user._id)
        var userBlogs = _user.blogs
        userBlogs.push(_blog)
        await User.findByIdAndUpdate(_user._id, {blogs: userBlogs})
            
        res.status(201)
        .send(_blog._id)

    }catch(err){
        res.status(400).send("Error in uploading blog")
        console.log(err)
    }

})

router.post('/like-unlike', jwtAuth, async(req, res)=>{
    try{
        const blog = await Blog.findById(req.body.blogId)
        var message = null
        if(blog){
            const userId = req.user._id
            var userLikes = blog.likes
            if(userLikes.includes(userId)){
                const index = userLikes.indexOf(userId)
                userLikes.splice(index, 1)
                message = "Blog Unliked"
            }else{
                userLikes.push(userId)
                const _user = await User.findById(userId);
                eventEmitter.emit('sendLikeNotification', _user.firstName + " " + _user.lastName, blog.author, blog._id, 1);
                // sendNotificationToUser(_user.firstName + " " + _user.lastName, blog.author, blog._id, 1)
                message = "Blog liked"
            }
            await Blog.findByIdAndUpdate(blog._id, {likes: userLikes})
        }

        return res.status(200).send(message)
    }catch(err){
        res.status(400).send("Error in liking/unliking the blog")
        console.log(err)
    }
})

router.post('/bookmark-unbookmark', jwtAuth, async(req, res)=>{
    try{
        const blog = await Blog.findById(req.body.blogId)
        var message = null
        if(blog){
            var bookmarks = req.user.bookmarks
            if(bookmarks.includes(blog._id)){
                const index = bookmarks.indexOf(blog._id)
                bookmarks.splice(index, 1)
                message = "Blog Unbookmarked"
            }else{
                bookmarks.push(blog._id)
                message = "Blog Bookmarked"
            }
            const up = await User.findByIdAndUpdate(req.user._id, {bookmarks: bookmarks})
            console.log(up)
        }

        return res.status(200).send(message)
    }catch(err){
        res.status(400).send("Error in bookmarking/unbookmarking blog")
        console.log(err)
    }
})

router.get('/search/:key', async(req, res)=>{
    try{
        const searchKey = req.params.key
        var searchResults = await Blog.find({blogTitle: new RegExp(searchKey, 'i')})
        searchResults = await getBlogsForCardsFrom(searchResults)
        return res.status(200).send(searchResults)
    }catch(err){
        res.status(400).send("Error in searching blog")
        console.log(err)
    }
})

router.delete('/delete/:id', jwtAuth, async(req,res) =>{
    try{
        const blogId = req.params.id
        const blog = await Blog.findById(blogId)
        const user = await User.findById(req.user._id)
    
        if(JSON.stringify(blog.author) !== JSON.stringify(user._id)){
            console.log(blog.author, user._id)
            return res.status(403).send("Access Denied")
        }
        const userId = JSON.stringify(blog.author)
        const category = await BlogCategory.findById(blog.category)
        console.log(blog, category, user)
        await User.updateOne({_id: user._id},{
            $pull:{
                blogs:blogId
            }
        })
        await BlogCategory.updateOne({_id: category._id},{
            $pull:{
                blogs:blogId
            }
        })
        await Promise.all(blog.comments.map(async (commentId) => {
            console.log(commentId)
            await Comment.findByIdAndDelete(commentId)
        }));
        await Blog.findByIdAndDelete(blogId)
        res.status(200).send("Blog deleted")
    }catch(err){
        res.status(400).send("Error in deleting blog")
        console.log(err)
    }
    
})

module.exports = {router, eventEmitter}
