const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({

    author:{
        id:{
            type: String,
            required: true
        },
        firstName:{
            type: String,
            required: true
        },
        lastName:{
            type: String,
        }
    },
    text:{
        type: String,
        default: ''
    },
    dateTime:{
        type: Date,
        required: false,
        default: new Date()
    },
    likes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    }
})

module.exports = mongoose.model('Comment', commentSchema)