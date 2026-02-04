import { Prisma, ContactStatus } from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IPaginationOptions } from '../../interface/pagination.type';
import { calculatePagination } from '../../utils/calculatePagination';
import { prisma } from '../../utils/prisma';
import { IContactUs, IContactUsFilters, IContactUsResponse } from './contactUs.interface';

const createContactUs = async (payload: IContactUs) => {
  const result = await prisma.contactUs.create({
    data: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      subject: payload.subject,
      message: payload.message,
      status: ContactStatus.PENDING,
      isRead: false,
    },
  });

  return result;
};

const getAllContactUs = async (
  filters: IContactUsFilters,
  paginationOptions: IPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    calculatePagination(paginationOptions);
  const { searchTerm, status, isRead, email } = filters;

  const andConditions: Prisma.ContactUsWhereInput[] = [];

  // Search term
  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { subject: { contains: searchTerm, mode: 'insensitive' } },
        { message: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  // Status filter
if (status && Object.values(ContactStatus).includes(status as ContactStatus)) {
  andConditions.push({
    status: status as ContactStatus,
  });
}

  // Email filter
  if (email) {
    andConditions.push({ email: { equals: email, mode: 'insensitive' } });
  }

  // Read status filter
  if (isRead !== undefined) {
    andConditions.push({ isRead: isRead === 'true' });
  }

  const whereConditions: Prisma.ContactUsWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.contactUs.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.contactUs.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getContactUsById = async (id: string) => {
  const result = await prisma.contactUs.findUnique({
    where: { id },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Contact message not found');
  }

  return result;
};

const markAsRead = async (id: string) => {
  const contact = await prisma.contactUs.findUnique({
    where: { id },
  });

  if (!contact) {
    throw new AppError(httpStatus.NOT_FOUND, 'Contact message not found');
  }

  const result = await prisma.contactUs.update({
    where: { id },
    data: { isRead: true },
  });

  return result;
};

const respondToContact = async (
  id: string,
  responseData: IContactUsResponse,
  status?: ContactStatus,
) => {
  const contact = await prisma.contactUs.findUnique({
    where: { id },
  });

  if (!contact) {
    throw new AppError(httpStatus.NOT_FOUND, 'Contact message not found');
  }

  const result = await prisma.contactUs.update({
    where: { id },
    data: {
      response: responseData.response,
      respondedBy: responseData.respondedBy,
      respondedAt: new Date(),
      status: status || ContactStatus.RESOLVED,
      isRead: true,
    },
  });

  // TODO: Send email to the user with the response
  // await sendMail(contact.email, 'Response to your inquiry', responseData.response);

  return result;
};

const updateContactUs = async (id: string, payload: Partial<IContactUs>) => {
  const contact = await prisma.contactUs.findUnique({
    where: { id },
  });

  if (!contact) {
    throw new AppError(httpStatus.NOT_FOUND, 'Contact message not found');
  }

  const result = await prisma.contactUs.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteContactUs = async (id: string) => {
  const contact = await prisma.contactUs.findUnique({
    where: { id },
  });

  if (!contact) {
    throw new AppError(httpStatus.NOT_FOUND, 'Contact message not found');
  }

  const result = await prisma.contactUs.delete({
    where: { id },
  });

  return result;
};

const getStatistics = async () => {
  const total = await prisma.contactUs.count();
  const pending = await prisma.contactUs.count({
    where: { status: ContactStatus.PENDING },
  });
  const inProgress = await prisma.contactUs.count({
    where: { status: ContactStatus.IN_PROGRESS },
  });
  const resolved = await prisma.contactUs.count({
    where: { status: ContactStatus.RESOLVED },
  });
  const closed = await prisma.contactUs.count({
    where: { status: ContactStatus.CLOSED },
  });
  const unread = await prisma.contactUs.count({
    where: { isRead: false },
  });

  return {
    total,
    pending,
    inProgress,
    resolved,
    closed,
    unread,
  };
};

export const ContactUsService = {
  createContactUs,
  getAllContactUs,
  getContactUsById,
  markAsRead,
  respondToContact,
  updateContactUs,
  deleteContactUs,
  getStatistics,
};
