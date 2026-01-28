import express from 'express';
import auth from '../../middlewares/auth';
import { uploadMiddleware } from '../../middlewares/upload';
import { ChatControllers } from './chat.controller';

const router = express.Router();

router.get('/users', auth('ANY'), ChatControllers.getAllUsersForChat);
router.get('/rooms', auth('ANY'), ChatControllers.getChatRooms);
router.get('/rooms/:roomId/messages', auth('ANY'), ChatControllers.getRoomMessages);
router.post('/upload', auth('ANY'), uploadMiddleware.single('file'), ChatControllers.uploadChatFile);
router.post('/rooms', auth('ANY'), ChatControllers.createOrGetRoom);

export const ChatRoutes = router;
