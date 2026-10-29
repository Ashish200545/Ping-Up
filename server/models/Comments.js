// import mongoose, { Types } from 'mongoose';

// const commentSchema = new mongoose.Schema({
//     post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
//     user: { type: String, ref: 'User', required: true },
//     content: { type: String, required: true, trim: true },
//     likes: [{ type: String, ref: 'User' }],
//     parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }
// }, { timestamps: true })

// const Comment = mongoose.model('Comment', commentSchema)

// export default Comment


import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },

    // Clerk userId (string)
    user: {
        type: String,
        required: true,
        trim: true
    },

    // Username
    username: {
        type: String,
        required: true,
        trim: true,
    },

    // User Profile Image
    profileImage: {
        type: String,
        default: "",
    },

    content: {
        type: String,
        required: true,
        trim: true
    },

    likes: [
        {
            type: String,  // Clerk userId
        }
    ],

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    }
},
{ timestamps: true}
);

export default mongoose.model("Comment", commentSchema);