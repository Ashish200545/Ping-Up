import express from 'express';
import { upload } from '../configs/multer.js'
import { protect, syncUser } from '../middleware/auth.js';
import { addPost, deletePost, editPost, getFeedPosts, likePost } from '../controllers/postController.js';
import { addComment } from '../controllers/commentController.js';

const postRouter = express.Router()

postRouter.post('/add', upload.array('media', 5), protect, addPost)
postRouter.post('/feed', protect, getFeedPosts)
postRouter.post('/like', protect, likePost)
postRouter.delete('/:postId', protect, deletePost)
postRouter.put('/:postId', protect, editPost)
postRouter.post('/:postId/comment', protect, syncUser, addComment)

export default postRouter