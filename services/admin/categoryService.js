const express = require('express')
const blogCategory = require('../../models/BlogCategory')
const Blog = require('../../models/Blog')
const { extractImagesFromContent } = require('../../utilities/blogUtilities')
const User = require('../../models/User')
const { removeImgTagsFromBlogContent } = require('../../utilities/blogUtilities')
const router = express.Router()

router.get('/all', async (req, res)=>{
    try{
        const categories = await blogCategory.find().sort({categoryName:1})
        res.status(200).json(categories)
    }catch(err){
        res.status(400).send('Unable to fetch categories..')
        console.log(err)
    }
})

router.get('/:id', async (req, res)=>{
    try{
        const category = await blogCategory.findById(req.params.id)
        if(category == null){
            return res.status(404).json("Category not available")
        }

        var blogs = []
        await Promise.all(category.blogs.map(async (blogId) => {
            const blog = await Blog.findById(blogId)
            if(blog != null){
                const titleImage = await extractImagesFromContent(blog.blogContent)
                const author = await User.findById(blog.author)
                const categoryBlog = {
                    authorId: author._id,
                    authorName: author.firstName + " " + author.lastName,
                    blogId: blog._id,
                    likes: blog.likes.length,
                    readTime: blog.readingTime,
                    titleImage: titleImage,
                    title: blog.title,
                    content: await removeImgTagsFromBlogContent(blog.blogContent),
                    // content: blog.blogContent,
                    publishedDate: blog.publishedDateTime
                }
                blogs.push(categoryBlog)
            }
          }));

        blogs.sort((a, b) => {
          const getNumber = (title) => {
            const match = title.match(/<h1>\s*(\d+)\./i);
            return match ? parseInt(match[1], 10) : Infinity;
          };
        
          return getNumber(a.title) - getNumber(b.title);
        });
        return res.status(200).send(blogs)
    }catch(err){
        console.log(err)
        return res.status(400).send('Unable to fetch ' + req.params.id + ' category')
    }
})


router.post('/', async(req, res)=>{
    const category = new blogCategory({
        categoryName: req.body.name
    })
    try{
        const categoryObj = await category.save();
        res.status(201)
        // .json(categoryObj)
        .send("Category successfully uploaded")
    }catch(err){
        res.status(400).send("Error in uploading category")
        console.log(err)
    }
})

router.delete('/:id', async(req,res) =>{
    const categoryId = req.params.id
    const deletedCategory = await blogCategory.findByIdAndDelete(categoryId)
    res.send("Category deleted")
})

module.exports = router
