import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ChatServices } from './chat.service';

const getAllUsersForChat = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await ChatServices.getAllUsersForChatFromDB(req.query, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const getChatRooms = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await ChatServices.getChatRoomsFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chat rooms retrieved successfully',
    data: result,
  });
});

const getRoomMessages = catchAsync(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const result = await ChatServices.getRoomMessagesFromDB(roomId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Messages retrieved successfully',
    data: result,
  });
});

const uploadChatFile = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  const result = await ChatServices.uploadChatFileIntoDB(file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'File uploaded successfully',
    data: result,
  });
});

const createOrGetRoom = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { receiverId } = req.body;
  const result = await ChatServices.createOrGetRoomFromDB(userId, receiverId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Room retrieved successfully',
    data: result,
  });
});

export const ChatControllers = {
  getAllUsersForChat,
  getChatRooms,
  getRoomMessages,
  uploadChatFile,
  createOrGetRoom,
};
