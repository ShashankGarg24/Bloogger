const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    blogTitle: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    blogContent: {
        type: String,
        required: true
    },
    likes: [{
        type: String
    }],
    publishedDateTime: {
        type: String,
        required: false,
    },
    readingTime: {
        type: String,
        required: false,
        default: "0 min"
    },
    tags: [{
        type: String
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogCategory'
    },
    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
})

module.exports = mongoose.model('Blog', blogSchema)