# Mobilify - E-commerce Platform

Full-stack e-commerce application with admin and user dashboards.

## Tech Stack

### Frontend
- React 18
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- Razorpay Integration
- Google OAuth

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Razorpay Payment Gateway
- Cloudinary (Image Storage)
- Nodemailer (Email Service)

## Project Structure

```
├── client/          # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   └── routes/
│   ├── package.json
│   └── vercel.json  # Vercel deployment config
│
└── server/          # Backend Node.js application
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middlewares/
    ├── utils/
    ├── package.json
    └── .eslintrc.json
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account
- Razorpay account
- Vercel account (for frontend deployment)
- Render account (for backend deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Mobilify
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Set up Environment Variables**

   Frontend (`client/.env`):
   ```env
   VITE_API_URL=http://localhost:4001
   VITE_RAZORPAY_KEY_ID=your_razorpay_key
   ```

   Backend (`server/.env`):
   ```env
   PORT=4001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

5. **Run Development Servers**

   Frontend:
   ```bash
   cd client
   npm run dev
   ```

   Backend:
   ```bash
   cd server
   npm run dev
   ```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production (includes lint check)
- `npm run lint` - Check for lint errors
- `npm run lint:check` - Check with zero warnings
- `npm run lint:fix` - Auto-fix lint errors
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run lint` - Check for lint errors
- `npm run lint:check` - Check with zero warnings
- `npm run lint:fix` - Auto-fix lint errors

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

**Frontend (Vercel):**
1. Connect GitHub repo to Vercel
2. Set root directory to `client`
3. Deploy (vercel.json handles the rest)

**Backend (Render):**
1. Create new Web Service on Render
2. Connect GitHub repo
3. Set root directory to `server`
4. Add environment variables
5. Deploy

## Features

- ✅ User Authentication (Email/Password, Google OAuth)
- ✅ Product Management (Admin)
- ✅ Category & Brand Management
- ✅ Shopping Cart
- ✅ Order Management
- ✅ Payment Integration (Razorpay, Wallet, COD)
- ✅ Coupon System
- ✅ Referral Program
- ✅ Product Reviews
- ✅ Wishlist
- ✅ Address Management
- ✅ Wallet System
- ✅ Admin Dashboard with Analytics

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes (Admin/User)
- CORS configuration
- Input validation
- SQL injection prevention (MongoDB)
- XSS protection

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run lint checks: `npm run lint:check`
5. Fix any errors: `npm run lint:fix`
6. Commit and push
7. Create a Pull Request
