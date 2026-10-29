import fs from "fs";
import imageKit from "../configs/imageKit.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comments.js"
import cloudinary from "../configs/cloudinary.js";

// Add Post
// export const addPost = async (req, res) => {
//     try{
//         const { userId } = req.auth();
//         const { content, post_type } = req.body;
//         const images = req.files || []

//         let image_urls = []

//         if(images.length){
//             image_urls = await Promise.all(
//                 images.map(async (image) => {
//                     const fileBuffer = fs.readFileSync(image.path)
//                     const response = await imageKit.upload({
//                         file: fileBuffer,
//                         fileName: image.originalname,
//                         folder: "posts",
//                     })

//                     const url = imageKit.url({
//                         path: response.filePath,
//                         transformation: [
//                             {quality: 'auto'},
//                             { format: 'webp' },
//                             { width: '1280' }
//                         ]
//                     })
//                     return url
//                 })
//             )
//         }

//         await Post.create({
//             user: userId,
//             content,
//             image_urls,
//             post_type
//         })
//         res.json({ success: true, message: "Post created successfully"});
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// }

// Add Post (Cloudinary version)
export const addPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, post_type } = req.body;
    const files = req.files || [];

    if (!files.length && !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide text content or at least one media file"
      });
    }

    let media = [];

    if (files.length) {
      // Upload ALL media files to Cloudinary
      media = await Promise.all(
        files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "posts",
            resource_type: "auto"
          });

          return {
            url: result.secure_url,
            type: result.resource_type, // image | video
            public_id: result.public_id
          };
        })
      );
    }

    // Create post
    await Post.create({
      user: userId,
      content,
      post_type,
      media // replace image_urls
    });

    return res.json({
      success: true,
      message: "Post created successfully"
    });

  } catch (error) {
    console.error("Add Post Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Get Posts
export const getFeedPosts = async (req, res) => {
    try{
        const { userId } = req.auth()
        const user = await User.findById(userId)

        // user connections and followings
        const userIds = [userId, ...user.connections, ...user.following]
        let posts = await Post.find({user: {$in: userIds}}).populate('user').sort({createdAt: -1}).lean();

        // For each post, fetch comments & attach user profile
        for(let post of posts) {
            const comments = await Comment.find({ post: post._id }).sort({ createdAt: 1 }).lean()

            // attach user details to each comment
            for (let c of comments) {
                const userProfile = await User.findOne({ clerkId: c.user }).select("full_name username profile_picture").lean()

                c.user = userProfile || {
                    full_name: "Unknown User",
                    username: "unknown",
                    profile_picture: null
                };
            }

            post.comments = comments;
        }

        res.json({success: true, posts})
    } catch (error) { 
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Like Post
export const likePost = async (req, res) => {
    try{
        const { userId } = req.auth()
        const { postId } = req.body

        const post = await Post.findById(postId)

        if(post.likes_count.includes(userId)){
            post.likes_count = post.likes_count.filter(user => user !== userId)
            await post.save()
            res.json({ success: true, message: 'Post unliked' });
        } else {
            post.likes_count.push(userId)
            await post.save()
            res.json({ success: true, message: 'Post liked' });
        }

    } catch (error) { 
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Delete Post
export const deletePost = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { postId } = req.params;

        if(!postId) { 
            return res.status(400).json({ success: false, message: 'Post id is required' });
        }

        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Only the owner can delete
        if(post.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
        }

        // remove post document
        await Post.findByIdAndDelete(postId);

        return res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Edit / Update Post
export const editPost = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { postId } = await req.params;
        const { content } = req.body;

        if(!postId) {
            return res.status(400).json({ success: false, message: 'Post id is requried '});
        }

        const post = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Only owner may edit
        if(post.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
        }

        // update fields
        if(typeof content === 'string') post.content = content;
        post.updatedAt = Date.now();

        await post.save();

        return res.json({ success: true, message: 'Post updated successfully', post });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Add comment
// export const addComment = async (req, res) => {
//     try {
//         const { userId } = await req.auth()
//         const { postId } = req.params
//         const { content, parentComment } = req.body

//         if(!postId) { 
//             return res.status(400).json({ success: false, message: 'Post id is required' })
//         }

//         if(!content || !content.trim()) {
//             return res.status(400).json({ success: false, message: 'Comment content is required' })
//         }

//         const post = await Post.findById(postId);
//         if(!post) { 
//             return res.status(404).json({ success: false, message: 'Post not found' })
//         }

//         // create standalone Comment document
//         const commentDoc = await Comment.create({
//             post: postId,
//             user: userId,
//             content: content.trim(),
//             parentComment: parentComment || null
//         })

//         console.log('Comment created: ', commentDoc) // Debug log

//         // attach comment id to post.comments array (if Post comment ids)
//         if (Array.isArray(post.comments)) { 
//             post.comments.push(commentDoc._id)
//             await post.save()
//         }

//         // Create a new comment object
//         const comment = {
//             user: userId,
//             content,
//             createdAt: new Date(),
//         };

//         // populate user field for response
//         await commentDoc.populate('user', 'full_name username profile_picture')

//         return res.status(201).json({ success: true, message: 'Comment added successfully', comment: commentDoc })
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ success: false, message: error.message })
//     }
// }