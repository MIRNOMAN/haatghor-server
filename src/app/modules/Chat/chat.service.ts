import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { prisma } from '../../utils/prisma';
import { uploadToMinIO } from '../../utils/uploadToMinio';

const getAllUsersForChatFromDB = async (query: any, currentUserId: string) => {
  const { searchTerm = '', page = 1, limit = 20 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  // Build search condition
  const searchCondition = searchTerm
    ? {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' as const } },
          { lastName: { contains: searchTerm, mode: 'insensitive' as const } },
          { email: { contains: searchTerm, mode: 'insensitive' as const } },
        ],
      }
    : {};

  // Query users
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        AND: [
          searchCondition,
          { id: { not: currentUserId } },
          { status: { not: 'BLOCKED' } },
          { isDeleted: false },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePhoto: true,
        role: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.user.count({
      where: {
        AND: [
          searchCondition,
          { id: { not: currentUserId } },
          { status: { not: 'BLOCKED' } },
          { isDeleted: false },
        ],
      },
    }),
  ]);

  return {
    data: users,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getChatRoomsFromDB = async (userId: string) => {
  const rooms = await prisma.room.findMany({
    where: {
      participants: {
        has: userId,
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          content: true,
          fileUrl: true,
          createdAt: true,
          senderId: true,
          isRead: true,
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              isRead: false,
              NOT: {
                senderId: userId,
              },
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  // Format rooms with other user info for single chats
  const formattedRooms = await Promise.all(
    rooms.map(async (room) => {
      if (room.roomType === 'SINGLE') {
        const otherUserId = room.participants.find((id) => id !== userId);
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            status: true,
          },
        });

        return {
          id: room.id,
          roomType: room.roomType,
          name: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User',
          photo: otherUser?.profilePhoto || null,
          lastMessage: room.messages[0] || null,
          unreadCount: room._count.messages,
          participants: room.participants,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
          otherUser,
        };
      } else {
        return {
          id: room.id,
          roomType: room.roomType,
          name: room.name,
          photo: room.groupPhoto,
          lastMessage: room.messages[0] || null,
          unreadCount: room._count.messages,
          participants: room.participants,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
        };
      }
    })
  );

  return formattedRooms;
};

const getRoomMessagesFromDB = async (roomId: string, query: any) => {
  const messagesQuery = new QueryBuilder<typeof prisma.message>(
    prisma.message,
    query
  );

  const result = await messagesQuery
    .filter()
    .sort()
    .paginate()
    .executeRaw({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
    });

  return result;
};

const uploadChatFileIntoDB = async (file: Express.Multer.File | undefined) => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Please provide a file');
  }

  const location = await uploadToMinIO(file);
  return { url: location };
};

const createOrGetRoomFromDB = async (userId: string, receiverId: string) => {
  if (!receiverId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Receiver ID is required');
  }

  if (userId === receiverId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot create room with yourself');
  }

  // Check if receiver exists
  await prisma.user.findUniqueOrThrow({
    where: { id: receiverId },
  });

  // Check if room already exists
  const existingRoom = await prisma.room.findFirst({
    where: {
      AND: [
        { participants: { has: userId } },
        { participants: { has: receiverId } },
        { roomType: 'SINGLE' },
      ],
    },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (existingRoom) {
    const otherUser = await prisma.user.findUnique({
      where: { id: receiverId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePhoto: true,
      },
    });

    return {
      id: existingRoom.id,
      roomType: existingRoom.roomType,
      name: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User',
      photo: otherUser?.profilePhoto || null,
      lastMessage: existingRoom.messages[0] || null,
      participants: existingRoom.participants,
      createdAt: existingRoom.createdAt,
      updatedAt: existingRoom.updatedAt,
      otherUser,
    };
  }

  // Create new room
  const newRoom = await prisma.room.create({
    data: {
      participants: [userId, receiverId],
      roomType: 'SINGLE',
    },
  });

  const otherUser = await prisma.user.findUnique({
    where: { id: receiverId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profilePhoto: true,
    },
  });

  return {
    id: newRoom.id,
    roomType: newRoom.roomType,
    name: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User',
    photo: otherUser?.profilePhoto || null,
    lastMessage: null,
    participants: newRoom.participants,
    createdAt: newRoom.createdAt,
    updatedAt: newRoom.updatedAt,
    otherUser,
  };
};

export const ChatServices = {
  getAllUsersForChatFromDB,
  getChatRoomsFromDB,
  getRoomMessagesFromDB,
  uploadChatFileIntoDB,
  createOrGetRoomFromDB,
};
