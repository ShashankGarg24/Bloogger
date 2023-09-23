const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    // blogTitle: {
    //     type: String,
    //     required: true
    // },
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
        default: new Date().toISOString()
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
    }
})

module.exports = mongoose.model('Blog', blogSchema)