import express from 'express';
import PracticanteService from '../../services/practicanteService.js';
import { asyncHandler } from '../../utils/errors.js';
import { sanitizeObject } from '../../utils/validators.js';

const router = express.Router();

/**
 * GET /api/practicantes
 * List all practicantes with optional search and pagination
 */
router.get('/', asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 50 } = req.query;
  
  // Validate pagination parameters
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: 'page must be a positive integer'
    });
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: 'limit must be a positive integer between 1 and 100'
    });
  }

  const result = await PracticanteService.findAll({
    search: String(search),
    page: pageNum,
    limit: limitNum
  });

  res.json(result);
}));

/**
 * GET /api/practicantes/:id
 * Get practicante by ID
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    return res.status(400).json({
      error: 'Invalid ID',
      details: 'ID must be a valid integer'
    });
  }

  const practicante = await PracticanteService.findById(id);
  res.json({ data: practicante });
}));

/**
 * POST /api/practicantes
 * Create a new practicante
 */
router.post('/', asyncHandler(async (req, res) => {
  // Sanitize input
  const data = sanitizeObject(req.body);
  
  const practicante = await PracticanteService.create(data);
  res.status(201).json({ data: practicante });
}));

/**
 * PUT /api/practicantes/:id
 * Update practicante
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    return res.status(400).json({
      error: 'Invalid ID',
      details: 'ID must be a valid integer'
    });
  }

  // Sanitize input
  const data = sanitizeObject(req.body);
  
  const practicante = await PracticanteService.update(id, data);
  res.json({ data: practicante });
}));

/**
 * DELETE /api/practicantes/:id
 * Delete practicante
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    return res.status(400).json({
      error: 'Invalid ID',
      details: 'ID must be a valid integer'
    });
  }

  await PracticanteService.delete(id);
  res.json({
    message: 'Practicante deleted successfully',
    data: { id }
  });
}));

export default router;
