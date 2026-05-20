import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Config
import connectDB from './config/db.js';

// Utils
import { startCronJobs } from './utils/cronJobs.js';

// Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Models
import Admin from './models/Admin.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dropRoutes from './routes/dropRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import subscriberRoutes from './routes/subscriberRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Security
app.use(helmet());

// CORS
let rawFrontendUrl = process.env.FRONTEND_URL || 'https://octunevintage.in';
if (rawFrontendUrl.endsWith('/')) {
  rawFrontendUrl = rawFrontendUrl.slice(0, -1);
}

const allowedOrigins = [
  rawFrontendUrl,
  'https://octunevintage.in',
  'https://www.octunevintage.in',
  'https://admin.octunevintage.in',
  'https://www.admin.octunevintage.in',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173'
];

if (!rawFrontendUrl.includes('www.')) {
  const wwwUrl = rawFrontendUrl.replace('://', '://www.');
  if (!allowedOrigins.includes(wwwUrl)) allowedOrigins.push(wwwUrl);
} else {
  const nonWwwUrl = rawFrontendUrl.replace('://www.', '://');
  if (!allowedOrigins.includes(nonWwwUrl)) allowedOrigins.push(nonWwwUrl);
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS Policy: Origin not allowed'));
    },
    credentials: true,
  })
);

// Body parser
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later.',
});

app.use('/api/', apiLimiter);

// ROOT ROUTE
app.get('/', (req, res) => {
  res.send('Octune Vintage Backend Running Successfully 🚀');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/drops', dropRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server
const server = app.listen(PORT, async () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );

  // Auto Seed Admin
  try {
    const adminCount = await Admin.countDocuments();

    if (adminCount === 0) {
      console.log('No admin found. Creating superadmin...');

      await Admin.create({
        name: 'Super Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'superadmin',
      });

      console.log('Superadmin created successfully!');
    }
  } catch (error) {
    console.error('Admin seed error:', error);
  }

  startCronJobs();
});

// Graceful Shutdown
const gracefulShutdown = (signal) => {
  console.log(`${signal} received. Closing server...`);

  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 5000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));