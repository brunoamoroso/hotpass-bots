import express from 'express';
import CheckoutController from '../../api/controllers/CheckoutController.mjs';
import identifyValidateDate from '../middlewares/validators/identifyValidator.mjs';

const router = express.Router();

// router.get("/", CheckoutController.identify);
router.get("/:id/:planId", CheckoutController.identify);

router.post('/address', identifyValidateDate, CheckoutController.identifyPost);

export default router;