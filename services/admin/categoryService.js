const express = require('express')
const blogCategory = require('../../models/BlogCategory')
const Blog = require('../../models/Blog')
const router = express.Router()

router.get('/', async (req, res)=>{
    try{
        const categories = await blogCategory.find()
        res.status(200).json(categories)
    }catch(err){
        res.status(400).send('Unable to fetch categories..')
        console.log(err)
    }
})

router.get('/:id', async (req, res)=>{
    try{
        console.log("Start")

        const category = await blogCategory.findById(req.params.id)
        if(category == null){
            return res.status(404).json("Category not available")
        }

        var blogs = []
        await Promise.all(category.blogs.map(async (blogId) => {
            const blog = await Blog.findById(blogId)
            console.log(">>>>"+blog)
            if(blog != null){
                const categoryBlog = {
                    author: blog.author,
                    likes: blog.likes.length,
                    readTime: blog.readingTime,
                    content: blog.blogContent.substring(50)+"....",
                    publishedDate: blog.publishedDateTime
                }
                blogs.push(categoryBlog)
            }
          }));

        // await category.blogs.forEach(async (blogId) => {
        //     const blog = await Blog.findById(blogId)
        //     console.log(">>>>"+blog)
        //     if(blog != null){
        //         const categoryBlog = {
        //             author: blog.author,
        //             likes: blog.likes.length,
        //             readTime: blog.readingTime,
        //             publishedDate: blog.publishedDateTime
        //         }
        //         blogs.push(categoryBlog)
        //     }
        // });
        console.log("Start")
        console.log(blogs)
        console.log("End")
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