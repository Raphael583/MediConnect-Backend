import { Injectable, InternalServerErrorException } from '@nestjs/common';
const Razorpay = require('razorpay');
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class RazorpayService {
  private razorpay: any;

  constructor() {
    // 🔐 SECURITY 1: Keys are taken from environment variables (never hardcoded)
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      throw new Error('Razorpay credentials missing in environment variables');
    }

    console.log('Using Razorpay Credentials:', { id: key_id });

    // Razorpay SDK initialization with secure credentials
    this.razorpay = new Razorpay({
      key_id,
      key_secret,
    });
  }

  // 🔐 SECURITY 2: Order creation always happens on the backend
  async createOrder(amount: number, currency = 'INR') {
    const options = {
      amount: amount * 100, // converting to paise — prevents tampering
      currency,
      receipt: `receipt_order_${Date.now()}`,
    };

    try {
      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Razorpay error:', {
        statusCode: error?.statusCode,
        error: error?.error,
        message: error?.message,
      });
      throw new Error(`Razorpay order creation failed: ${error.message}`);
    }
  }

  // 🔐 SECURITY 3: HMAC SHA256 signature verification
  // Prevents fake / spoofed payments from client
  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error('RAZORPAY_KEY_SECRET is not defined in environment variables');
    }

    const body = orderId + '|' + paymentId;

    // Razorpay recommended HMAC SHA-256 hash comparison
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }

  // 🔐 SECURITY 4: Validates Razorpay credentials directly with Razorpay API
  async verifyRazorpayCredentials(): Promise<boolean> {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      throw new Error('Razorpay credentials are missing in environment variables');
    }

    try {
      const response = await axios.get('https://api.razorpay.com/v1/payments', {
        auth: { username: key_id, password: key_secret },
        params: { count: 1 },
      });

      return response.status === 200;
    } catch (error) {
      if (error.response?.status === 401) {
        // Invalid or expired credentials
        return false;
      }
      throw new InternalServerErrorException('Failed to verify Razorpay credentials');
    }
  }

  // Mock method (Used for testing without Razorpay)
  async mockcreateOrder(amount: number, currency = 'INR') {
    return {
      id: `order_${Date.now()}`,
      amount: amount * 100,
      currency,
      receipt: `receipt_order_${Date.now()}`,
      status: 'created',
    };
  }
}
