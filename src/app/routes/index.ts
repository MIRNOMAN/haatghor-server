import express from 'express';
import { UserRouters } from '../modules/User/user.routes';
// import { MessageRouters } from '../modules/Messages/message.route';
import { NotificationsRouters } from '../modules/Notification/notification.route';
import { AssetRouters } from '../modules/Asset/asset.route';
import { AuthByOtpRouters } from '../modules/AuthByOtp/auth.routes';
import { SubscriptionRoutes } from '../modules/Subscription/subscription.route';
import { PaymentRoutes } from '../modules/Payment/payment.route';
import { CategoryRoutes } from '../modules/Category/category.route';
import { ProductRoutes } from '../modules/Product/product.route';
import { CartRoutes } from '../modules/Cart/cart.route';
import { OrderRoutes } from '../modules/Order/order.route';
import { ReviewRoutes } from '../modules/Review/review.route';
import { WishlistRoutes } from '../modules/Wishlist/wishlist.route';
import { AddressRoutes } from '../modules/Address/address.route';
import { BannerRoutes } from '../modules/Banner/banner.route';
import { AdminRoutes } from '../modules/Admin/admin.route';
import { ImageRoutes } from '../modules/Image/image.route';
import { FAQRoutes } from '../modules/FAQ/faq.route';
import { PrivacyPolicyRoutes } from '../modules/PrivacyPolicy/privacyPolicy.route';
import { ContactUsRoutes } from '../modules/ContactUs/contactUs.route';
import { FlashSaleRoutes } from '../modules/FlashSale/flashSale.route';

const router = express.Router();

const moduleRoutes = [
  // {
  //   path: '/auth',
  //   route: AuthRouters,
  // },
  {
    path: '/auth',
    route: AuthByOtpRouters,
  },
  {
    path: '/users',
    route: UserRouters,
  },
  // {
  //   path: '/messages',
  //   route: MessageRouters,
  // },
  {
    path: '/notifications',
    route: NotificationsRouters,
  },
  {
    path: '/assets',
    route: AssetRouters,
  },
  {
    path: '/subscriptions',
    route: SubscriptionRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
  // eCommerce Routes
  {
    path: '/categories',
    route: CategoryRoutes,
  },
  {
    path: '/products',
    route: ProductRoutes,
  },
  {
    path: '/cart',
    route: CartRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/wishlist',
    route: WishlistRoutes,
  },
  {
    path: '/addresses',
    route: AddressRoutes,
  },
  {
    path: '/banners',
    route: BannerRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  // Static Content & Media Routes
  {
    path: '/images',
    route: ImageRoutes,
  },
  {
    path: '/faqs',
    route: FAQRoutes,
  },
  {
    path: '/privacy-policy',
    route: PrivacyPolicyRoutes,
  },
  {
    path: '/contact',
    route: ContactUsRoutes,
  },
  {
    path: '/flash-sales',
    route: FlashSaleRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
