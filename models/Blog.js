const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    blogName: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: false,
        default: "none"
    }
})

module.exports = mongoose.model('Blog', blogSchema)