import { z } from 'zod';

const createRoomSchema = z.object({
  receiverId: z.string({ required_error: 'Receiver ID is required' }),
});

export const ChatValidation = {
  createRoomSchema,
};
