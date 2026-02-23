import express from 'express';
import cors from 'cors';
import { testConnection } from '../config/database.js';
import { errorHandler } from '../utils/errors.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'error',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API routes
import apiRoutes from './routes/index.js';
import practicantesRoutes from './routes/practicantes.js';
import authRoutes from './routes/auth.js'; // Import auth routes
import tiposAbonoRoutes from './routes/tiposAbono.js'; // Import tiposAbono routes
import pagosRoutes from './routes/pagos.js'; // Import pagos routes

app.use('/api', apiRoutes);
app.use('/api/practicantes', practicantesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tipos-abono', tiposAbonoRoutes); // Mount tiposAbono routes
app.use('/api/pagos', pagosRoutes); // Mount pagos routes

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    details: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  // Test database connection
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log('Database connection: OK');
  } else {
    console.warn('Database connection: FAILED - Please check your database configuration');
  }
});

export default app;
