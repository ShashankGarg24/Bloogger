const mongoose = require('mongoose')

const blogCategorySchema = new mongoose.Schema({
    categoryName:{
        type: String,
        required: true,
    },
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }]
})

module.exports = mongoose.model('BlogCategory', blogCategorySchema)