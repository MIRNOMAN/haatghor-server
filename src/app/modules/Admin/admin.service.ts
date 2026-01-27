import { prisma } from '../../utils/prisma';

const getDashboardStats = async () => {
  // Get total users
  const totalUsers = await prisma.user.count({
    where: {
      role: 'USER',
      isDeleted: false,
    },
  });

  // Get total orders
  const totalOrders = await prisma.order.count();

  // Get total revenue
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: 'SUCCESS',
    },
    select: {
      finalAmount: true,
    },
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.finalAmount, 0);

  // Get monthly sales (last 12 months)
  const currentDate = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);

  const monthlySales = await prisma.order.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: twelveMonthsAgo,
      },
      paymentStatus: 'SUCCESS',
    },
    _sum: {
      finalAmount: true,
    },
    _count: {
      id: true,
    },
  });

  // Group by month
  const monthlyData: { [key: string]: { revenue: number; orders: number } } = {};

  monthlySales.forEach((sale) => {
    const date = new Date(sale.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, orders: 0 };
    }

    monthlyData[monthKey].revenue += sale._sum.finalAmount || 0;
    monthlyData[monthKey].orders += sale._count.id;
  });

  // Get order status breakdown
  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
  });

  const statusBreakdown = ordersByStatus.reduce(
    (acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    },
    {} as { [key: string]: number },
  );

  // Get top selling products
  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: {
      quantity: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take: 10,
  });

  const topProductDetails = await Promise.all(
    topProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          price: true,
        },
      });

      return {
        product,
        totalSold: item._sum.quantity || 0,
        orderCount: item._count.id,
      };
    }),
  );

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  // Low stock products
  const lowStockProducts = await prisma.product.findMany({
    where: {
      stock: {
        lte: 10,
      },
      status: 'ACTIVE',
    },
    orderBy: {
      stock: 'asc',
    },
    take: 10,
    select: {
      id: true,
      name: true,
      slug: true,
      stock: true,
      price: true,
      images: true,
    },
  });

  return {
    overview: {
      totalUsers,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
    },
    monthlySales: Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
      }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    ordersByStatus: statusBreakdown,
    topProducts: topProductDetails,
    recentOrders,
    lowStockProducts,
  };
};

const getAdminForSupport = async () => {
  // Get the first available SUPERADMIN for customer support
  const admin = await prisma.user.findFirst({
    where: {
      role: 'SUPERADMIN',
      isDeleted: false,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profilePhoto: true,
    },
  });

  return admin;
};

export const AdminServices = {
  getDashboardStats,
  getAdminForSupport,
};

// Keep backward compatibility
export const AdminService = AdminServices;
