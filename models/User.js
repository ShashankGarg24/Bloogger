const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },
    userEmail: {
        type: String,
        required: true
    },
    userPassword: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: false 
    },
    createdOn: {
        type: String,
        default: new Date().toISOString(),
    },
    otp: {
        type: String,
    },
    bookmarks: [{
        type: String,
    }],
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }]

})

module.exports = mongoose.model('User', userSchema)