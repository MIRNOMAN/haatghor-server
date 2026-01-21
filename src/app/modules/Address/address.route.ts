import express from 'express';
import { AddressController } from './address.controller';
import { AddressValidation } from './address.validation';

import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.post(
  '/',
  auth('USER', 'SUPERADMIN'),
  validateRequest.body(AddressValidation.createAddressValidation),
  AddressController.createAddress,
);

router.get(
  '/',
  auth('USER', 'SUPERADMIN'),
  AddressController.getAllAddresses,
);

router.get(
  '/:id',
  auth('USER', 'SUPERADMIN'),
  AddressController.getAddressById,
);

router.put(
  '/:id',
  auth('USER', 'SUPERADMIN'),
  validateRequest.body(AddressValidation.updateAddressValidation),
  AddressController.updateAddress,
);

router.delete(
  '/:id',
  auth('USER', 'SUPERADMIN'),
  AddressController.deleteAddress,
);

export const AddressRoutes = router;
