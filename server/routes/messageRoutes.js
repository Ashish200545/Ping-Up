import express from 'express';
import { getChatMessages, sendMessage, sseController } from '../controllers/messageController.js';
import { upload } from '../configs/multer.js';
import { protect } from '../middleware/auth.js';
import { getRecentChats } from '../controllers/messageController.js';


const messageRouter = express.Router();

messageRouter.get('/sse', protect, sseController)
messageRouter.post('/send', upload.single('image'), protect, sendMessage)
messageRouter.post('/get', protect, getChatMessages)
messageRouter.post('/recent', protect, getRecentChats);

export default messageRouter