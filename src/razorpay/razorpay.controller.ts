import { Controller, Post, Get, Body, BadRequestException } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import * as crypto from 'crypto';

@Controller('razorpay')
export class RazorpayController {
  constructor(private readonly razorpayService: RazorpayService) {}

  @Post('order')
  async createOrder(@Body() body: { amount: number }) {
    const { amount } = body;

    if (!amount || isNaN(amount)) {
      throw new BadRequestException('Amount must be a valid number');
    }

    try {
      const order = await this.razorpayService.createOrder(amount);
      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    } catch (err) {
      throw new BadRequestException(err.message || 'Failed to create Razorpay order');
    }
  }
   @Post('verify')
  verifyPayment(@Body() body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const isValid = this.razorpayService.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    return { success: true, message: 'Payment verified successfully' };
  }

  @Post('simulate-signature')
  simulateSignature(@Body() body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
  }) {
    const { razorpay_order_id, razorpay_payment_id } = body;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new BadRequestException('Missing Razorpay secret key in .env');
    }

    const bodyString = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(bodyString)
      .digest('hex');

    return { signature };
  }
  @Get('verify-credentials')
  async verifyRazorpayCredentials() {
    const isValid = await this.razorpayService.verifyRazorpayCredentials();

    if (isValid) {
      return { success: true, message: 'Razorpay credentials are valid.' };
    } else {
      return { success: false, message: 'Invalid Razorpay credentials.', };
    }
  }
}



