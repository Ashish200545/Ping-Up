import express from "express";
import { protect } from "../middleware/auth.js";
import { addComment, getCommentsForPost, deleteComment, likeComment, replyToComment } from "../controllers/commentController.js";

const router = express.Router();

// Add comment
router.post("/:postId/comment", protect, addComment);

// Get comments for a post
router.get("/:postId/comments", protect, getCommentsForPost);

// Delete comment
router.delete("/comment/:commentId", protect, deleteComment);

// Like/unlike comment
router.post("/comment/:commentId/like", protect, likeComment);

// Reply to comment
router.post("/comment/:commentId/reply", protect, replyToComment);

export default router;