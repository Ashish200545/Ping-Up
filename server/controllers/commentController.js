import User from "../models/User.js"; // Your local user profile model if you have one
import Comment from "../models/Comments.js";
import Post from "../models/Post.js";

export const addComment = async (req, res) => {
  try {
    // Get Clerk auth data
    const { userId } = await req.auth();
    const { postId } = req.params;
    const { content, parentComment } = req.body;

    console.log("USER ID:", userId);
    console.log("POST ID:", postId);

    
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }

    // Ensure post exists
    const post = await Post.findById(postId);
    console.log("POST FOUND:", !!post);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Fetch user using Clerk ID
    const userProfile = await User.findById(userId).select(
      "full_name username profile_picture"
    );
    console.log("USER FOUND:", !!userProfile);

    if(!userProfile){
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate parent comment (for replies)
    if(parentComment) {
      const parent = await Comment.findById(parentComment);
      console.log("PARENT FOUND:", !!parent)
      if(!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        });
      }
    }

    // Create the comment
    const newComment = await Comment.create({
      post: postId,
      user: userId,
      username: userProfile.username,
      profileImage: userProfile.profile_picture || "",
      content: content.trim(),
      parentComment: parentComment || null,
    });


    // Push comment ID to post
    // await Post.findByIdAndUpdate(postId, {
    //   $push: { comments: newComment._id }
    // });

    // Fetch user info manually instead of populate
    //let userProfile = await User.findOne({ clerkId: userId }).select("full_name username profile_picture");

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
      // comment: {
      //   ...newComment.toObject(),
      //   user: userProfile ? userProfile.toObject() : { full_name: "Unknown", username: "unknown" },
      // },
    });

  } catch (error) {
    console.error("Add Comment Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// export const getCommentsForPost = async (req, res) => {
//     try {
//         const { postId } = req.params;

//         const comments = (await Comment.find({ post: postId })).toSorted({ creadtedAt: 1 });

//         return res.status(200).json({ sucess: true, comments });
//     } catch (error) {
//         console.log("Get Comments Error: ", error);
//         return res.status(500).json({ success: false, message: "Server error", error: error.message})      
//     }
// };

// export const getCommentsForPost = async (req, res) => {
//   try {
//     const { postId } = req.params;

//     const comments = await Comment.find({ post: postId })
//       .sort({ createdAt: 1 }) // assuming your schema has timestamps
//       .populate("user", "full_name username profile_picture");

//     return res.status(200).json({ success: true, comments });
//   } catch (error) {
//     console.log("Get Comments Error: ", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };

export const getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: 1 })
      .lean();

    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await User.findById(comment.user)
          .select("full_name username profile_picture");

        return {
          ...comment,
          user
        };
      })
    );

    return res.status(200).json({
      success: true,
      comments: commentsWithUsers
    });
  } catch (error) {
    console.log("Get Comments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// export const deleteComment = async (req, res) => {
//     try {
//         const userId = req.auth();
//         const { commentId } = req.params;

//         const comment = await Comment.findById(commentId);

//         if(!comment) { 
//           return res.status(404).json({ success: false, message: "Comment not found"});
//         }

//         // Only comment owner or the post owner can delete it
//         if (String(comment.user) !== String(userId)) {
//           // Get the post to check the owner
//           const post = await Post.findById(comment.post);

//           if(!post){
//             return res.status(404).json({ success: false, message: "Parent post not found" });
//           }

//           if(String(post.user) !== String(userId)){
//             return res.status(403).json({ success: false, message: "Unauthorized- only the comment author or post owner can delete this comment"});
//           }
//         }

//         // Remove comment reference from post
//         await Post.findByIdAndUpdate(comment.post, {
//           $pull: { comments: commentId }
//         })

//         // Delete comment
//         await Comment.findByIdAndDelete(commentId);

//         return res.status(200).json({ success: true, message: "Comment deleted successfully" })

//     } catch (error) {
//         console.log("Delete Comment Error: ", error);
//         return res.status(500).json({ success: false, message: "Server error", error: error.message})
//     }
// };

export const deleteComment = async (req, res) => {
  try {
    // 1. Get authenticated Clerk user
    const authData = await req.auth();

    if (!authData?.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 2. Convert Clerk ID -> MongoDB user document
    const currentUser = await User.findById(authData.userId);

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "User not found in database" });
    }

    const { commentId } = req.params;

    // 3. Find comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // 4. Find post related to comment
    const post = await Post.findById(comment.post);

    if (!post) {
      return res.status(404).json({ success: false, message: "Parent post not found" });
    }

    // 5. Permission checks
    const isCommentOwner =
      String(comment.user) === String(currentUser._id);

    const isPostOwner =
      String(post.user) === String(currentUser._id);

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({
        success: false,
        message:
          "Unauthorized — only the comment author or post owner can delete this comment",
      });
    }

    // 6. Remove from post comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    });

    // 7. Delete comment
    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.log("Delete Comment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// Like / Unlike a Comment
// export const likeComment = async (req, res) => {
//     try {
//         const {userId} = await req.auth();
//         const { commentId } = req.params;

//         const comment = await Comment.findById(commentId);

//         if(!comment) { 
//             return res.status(404).json({ success: false, message: "Comment not found"})
//         }

//         let updated;

//         if(comment.likes.includes(userId)) {
//             // Unlike
//             updated = await Comment.findByIdAndUpdate(
//                 commentId,
//                 { $pull: { likes: userId } },
//                 { new: true }
//             )

//             return res.status(200).json({ success: true, message: "Comment unliked", comment: updated})
//         } else {
//             // Like
//             updated = await Comment.findByIdAndUpdate(
//                 commentId,
//                 { $pull: { likes: userId } },
//                 { new: true }
//             )

//             return res.status(200).json({ success: true, message: "Comment liked", comment: updated})
//         }
//     } catch (error) {
//         console.error("Like Comment Error: ", error);
//         return res.status(500).json({ success: false, message: "Server error", error: error.message})
//     }
// };

export const likeComment = async (req, res) => {
  try {
    // 1. Get authenticated Clerk user
    const { userId } = await req.auth();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { commentId } = req.params;

    // 2. Find comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    let liked;

    // 3. Toggle like
    if (comment.likes.includes(userId)) {
      // Unlike
      comment.likes.pull(userId);
      liked = false;
    } else {
      // Like
      comment.likes.push(userId);
      liked = true;
    }

    // 4. Save updated comment
    await comment.save();

    // 5. Respond with state (frontend uses this)
    return res.status(200).json({
      success: true,
      liked,
      likesCount: comment.likes.length
    });

  } catch (error) {
    console.error("Like Comment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Reply to a Comment
// export const replyToComment = async (req, res) => {
//   try {
//     const { userId } = await req.auth();
//     const { commentId } = req.params;
//     const { content } = req.body;

//     const parent = await Comment.findById(commentId);

//     if (!parent) {
//       return res.status(404).json({
//         success: false,
//         message: "Parent comment not found",
//       });
//     }

//     const reply = await Comment.create({
//       post: parent.post,
//       user: userId,
//       content: content.trim(),
//       parentComment: commentId,
//     });

//     // Attach reply to post
//     await Post.findByIdAndUpdate(parent.post, {
//       $push: { comments: reply._id },
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Reply added successfully",
//       comment: reply,
//     });

//   } catch (error) {
//     console.error("Reply Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// export const replyToComment = async (req, res) => {
//   try {
//     const { userId } = await req.auth();
//     const { commentId } = req.params;
//     const { content } = req.body;

//     if (!content || !content.trim()) {
//       return res.status(400).json({ success: false, message: "Reply content is required" });
//     }

//     const parent = await Comment.findById(commentId);

//     if (!parent) {
//       return res.status(404).json({
//         success: false,
//         message: "Parent comment not found",
//       });
//     }

//     // Create the reply
//     const reply = await Comment.create({
//       post: parent.post,
//       user: userId,
//       content: content.trim(),
//       parentComment: commentId,
//     });

//     // Attach reply to post
//     await Post.findByIdAndUpdate(parent.post, {
//       $push: { comments: reply._id },
//     });

//     // 🔥 Re-fetch reply WITH full user info
//     const populatedReply = await Comment.findById(reply._id)
//       .populate("user", "full_name username profile_picture")
//       .populate({
//         path: "parentComment",
//         populate: {
//           path: "user",
//           select: "full_name username profile_picture",
//         },
//       });

//     return res.status(201).json({
//       success: true,
//       message: "Reply added successfully",
//       comment: populatedReply,
//     });
//   } catch (error) {
//     console.error("Reply Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };


export const replyToComment = async (req, res) => {
  try {
    // 1. Get Clerk userId
    const { userId } = await req.auth();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { commentId } = req.params;
    const { content } = req.body;

    // 2. Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply content is required"
      });
    }

    // 3. Find parent comment
    const parentComment = await Comment.findById(commentId);

    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: "Parent comment not found"
      });
    }

    // 4. Create reply
    const reply = await Comment.create({
      post: parentComment.post,
      user: userId,                 // Clerk ID stored
      content: content.trim(),
      parentComment: commentId
    });

    // 5. Fetch replying user's profile
    const replyUser = await User.findById(userId)
      .select("full_name username profile_picture");

    // 6. Send response with attached user
    return res.status(201).json({
      success: true,
      message: "Reply added successfully",
      comment: {
        ...reply.toObject(),
        user: replyUser
      }
    });

  } catch (error) {
    console.error("Reply Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};