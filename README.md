MediConnect Backend
Smart Healthcare Management Backend built with NestJS, MongoDB, and Redis


Overview
MediConnect Backend is a role-based hospital management system that connects patients and doctors under different hospitals (tenants).
It provides secure OTP-based login, JWT authentication, slot booking, appointment management, and Razorpay payment integration.

This backend ensures data isolation across hospitals, access control, and secure operations for doctors and patients.


Features

User Management
- Create and manage patients and doctors.
- Assign roles automatically on creation (patient or doctor).
- Multi-tenant support — each user is tied to a hospital ID

Authentication & Authorization
- Login using email/password or OTP via Gmail.
- JWT-based access token for secure communication.
- Role-based access control:
  - Doctors can view patient lists and appointments.
  - Patients trying to access doctor-only endpoints get 403 Forbidden.

CSV Upload
- Upload CSV files to bulk insert patients into MongoDB.
- Each record includes name, email, mobile number, and identifier.

OTP Verification (Upstash Redis)
- OTP is sent via email using Redis (Upstash) for fast temporary storage.
- Accounts are activated only after OTP verification.
- Auto block users after multiple wrong password attempts.

 Slot Booking System
- Doctors can set availability and manage slots (e.g., 10:00–10:15).
- Slots can be booked or cancelled by patients.
- View today’s and upcoming appointments easily.

Payment Integration (Razorpay)
- Integrated Razorpay payment gateway for appointment booking.
- Payment verification updates booking status in MongoDB.
- Mock testing supported for demo purposes.


Tech Stack

| Layer | Technology |
|-------|-------------|
| Backend Framework | NestJS |
| Database | MongoDB (Mongoose) |
| Cache & OTP Store | Redis (Upstash) |
| Authentication | JWT, OTP via Gmail |
| Payments | Razorpay |
| File Handling | CSV Upload (Multer) |
| Language | TypeScript |



Installation & Setup


1. Install dependencies
   
   npm install
   

2. Create a `.env` file in the root folder:
   
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/caresync
   JWT_SECRET=your_jwt_secret
   REDIS_URL=your_upstash_redis_url
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   GMAIL_USER=your_email@gmail.com
   GMAIL_PASS=your_app_password
   

3. Run the app
   
   npm run start:dev
   

API Endpoints Summary

| Method | Endpoint | Description | Access |
|--------|-----------|--------------|---------|
| POST | `/create/patient` | Create patient user | Admin / Hospital |
| POST | `/create/doctor` | Create doctor user | Admin / Hospital |
| POST | `/login` | Login using email & password | Public |
| POST | `/otp-login` | Login using email OTP | Public |
| GET | `/doctor/patient-list` | View patients | Doctor only |
| GET | `/appointments/today` | View today’s appointments | Doctor/Patient |
| GET | `/appointments/upcoming` | View upcoming appointments | Doctor/Patient |
| POST | `/slots/set` | Set availability | Doctor |
| POST | `/slots/book` | Book a slot | Patient |
| POST | `/slots/cancel` | Cancel a slot | Patient |
| POST | `/payment/create-order` | Create Razorpay order | Authenticated |
| POST | `/payment/verify` | Verify payment signature | Authenticated |



Example CSV Format

name,email,identifier,mobile
John Vincent,john@gmail.com,1234,9876543210
Krishnan,krishnan@gmail.com,5678,9123456780


Future Improvements
- Add email templates for OTP and payment confirmation
- Implement role-based dashboards
- Add analytics and hospital-level reports
- Integrate caching for appointment queries



Developer
Raphael A.
M.Sc. Computer Science, Loyola College, Madras University
Skills: NestJS, MongoDB, Redis, Razorpay, Node.js, JWT, TypeScript



License
This project is licensed under the MIT License
