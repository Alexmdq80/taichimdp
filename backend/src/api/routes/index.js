/**
 * Base API routes structure
 * Individual route modules will be imported and registered here
 */

import express from 'express';

const router = express.Router();

// Health check route
router.get('/', (req, res) => {
  res.json({
    message: 'Tai Chi Management API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      practicantes: '/api/practicantes',
      abonos: '/api/abonos',
      pagos: '/api/pagos',
      asistencia: '/api/asistencia'
    }
  });
});

export default router;
