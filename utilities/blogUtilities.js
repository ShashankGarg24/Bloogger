const Blog = require("../models/Blog");
const User = require("../models/User");

const readingSpeedInWPM = 265.0

function calculateReadingTimeForBlog(blogTitle, blogContent){
    const cumulativeText = blogTitle + blogContent;
    const wordCount = cumulativeText.split(" ").length
    const readingTimeForTextInMinutes = wordCount/readingSpeedInWPM;
    return Math.ceil(readingTimeForTextInMinutes);
}

async function getBlogsForCardsFrom(blogIdList){
    var blogs = []
    await Promise.all(blogIdList.map(async (blogId) => {
        console.log(blogId)
        const blog = await Blog.findById(blogId)
        console.log(blog)
        if(blog != null){
            const titleImage = await extractImagesFromContent(blog.blogContent)
            const author = await User.findById(blog.author)
            const _blog = {
                authorId: author._id,
                authorName: author.firstName + " " + author.lastName,
                blogId: blog._id,
                likes: blog.likes.length,
                readTime: blog.readingTime,
                titleImage: titleImage,
                content: await removeTagsFromBlogContent(blog.blogContent),
                publishedDate: blog.publishedDateTime
            }
            blogs.push(_blog)
        }
      }));

    return blogs
}

async function removeTagsFromBlogContent(content) {
    if ((content===null) || (content==='')){
        return false;
    }   
    else{
        content = content.toString();
    }    

    const contentWithoutTags = content.replace(/<[^>]*>/g, '')
    return contentWithoutTags;
}

async function extractImagesFromContent(content){
    let imageTagStr = content.match(/<img\s+[^>]*src="([^"]*)"[^>]*>/i);
    return imageTagStr;
}

async function extractTitleFromContent(content){
    let title = content.match(/(<h1.*?>.*?<\/h1>)/);
    return title[0];
}

module.exports = {calculateReadingTimeForBlog, removeImgTagsFromBlogContent: removeTagsFromBlogContent, extractImagesFromContent, getBlogsForCardsFrom, extractTitleFromContent}