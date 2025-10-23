// server.js - Week 2 Express API implementation

const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- In-memory data store (for assignment/demo purposes) ---
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// --- Middleware ---
app.use(bodyParser.json()); // parse JSON bodies

// Logger middleware
function logger(req, res, next) {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  next();
}
app.use(logger);

// Simple auth middleware: checks for header 'x-api-key'
function auth(req, res, next) {
  const apiKey = req.header('x-api-key') || req.header('authorization');
  const expected = process.env.API_KEY || 'secret-key';
  if (!apiKey || apiKey !== expected) {
    const err = new AuthError('Invalid or missing API key');
    return next(err);
  }
  next();
}

// Async wrapper to catch errors from async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// --- Custom error classes ---
class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}
class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}
class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

// Validation middleware for products (used for POST and PUT)
function validateProduct(requireAllFields = true) {
  return (req, res, next) => {
    const { name, description, price, category, inStock } = req.body;
    const errors = [];

    if (requireAllFields || 'name' in req.body) {
      if (!name || typeof name !== 'string') errors.push('name is required and must be a string');
    }
    if (requireAllFields || 'description' in req.body) {
      if (!description || typeof description !== 'string') errors.push('description is required and must be a string');
    }
    if (requireAllFields || 'price' in req.body) {
      if (price === undefined || typeof price !== 'number' || Number.isNaN(price)) errors.push('price is required and must be a number');
    }
    if (requireAllFields || 'category' in req.body) {
      if (!category || typeof category !== 'string') errors.push('category is required and must be a string');
    }
    if (requireAllFields || 'inStock' in req.body) {
      if (inStock === undefined || typeof inStock !== 'boolean') errors.push('inStock is required and must be a boolean');
    }

    if (errors.length) return next(new ValidationError(errors.join('; ')));
    next();
  };
}

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Visit /api/products');
});

// Use auth middleware for all /api routes
app.use('/api', auth);

// GET /api/products - list with filtering, pagination, and optional search
app.get('/api/products', asyncHandler((req, res) => {
  let result = [...products];

  // filtering by category
  if (req.query.category) {
    result = result.filter(p => p.category === req.query.category);
  }

  // search by name (partial, case-insensitive)
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q));
  }

  // pagination
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const start = (page - 1) * limit;
  const end = start + limit;

  const paged = result.slice(start, end);

  res.json({
    total: result.length,
    page,
    limit,
    results: paged
  });
}));

// GET /api/products/search?name= - explicit search endpoint (by name)
app.get('/api/products/search', asyncHandler((req, res, next) => {
  const name = req.query.name;
  if (!name) return next(new ValidationError('Query parameter "name" is required'));
  const q = name.toLowerCase();
  const found = products.filter(p => p.name.toLowerCase().includes(q));
  res.json(found);
}));

// GET /api/products/:id
app.get('/api/products/:id', asyncHandler((req, res, next) => {
  const p = products.find(prod => prod.id === req.params.id);
  if (!p) return next(new NotFoundError('Product not found'));
  res.json(p);
}));

// POST /api/products
app.post('/api/products', validateProduct(true), asyncHandler((req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const newProduct = { id: uuidv4(), name, description, price, category, inStock };
  products.push(newProduct);
  res.status(201).json(newProduct);
}));

// PUT /api/products/:id - full update
app.put('/api/products/:id', validateProduct(true), asyncHandler((req, res, next) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return next(new NotFoundError('Product not found'));
  const { name, description, price, category, inStock } = req.body;
  products[idx] = { id: products[idx].id, name, description, price, category, inStock };
  res.json(products[idx]);
}));

// DELETE /api/products/:id
app.delete('/api/products/:id', asyncHandler((req, res, next) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return next(new NotFoundError('Product not found'));
  const removed = products.splice(idx, 1)[0];
  res.json(removed);
}));

// GET /api/products/stats - basic statistics
app.get('/api/products/stats', asyncHandler((req, res) => {
  const countByCategory = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  const total = products.length;
  const avgPrice = total ? products.reduce((s, p) => s + p.price, 0) / total : 0;
  res.json({ total, avgPrice, countByCategory });
}));

// --- Global error handler ---
app.use((err, req, res, next) => {
  // If it's an AppError, use its status; otherwise 500
  const status = err.status || 500;
  const payload = {
    error: err.message || 'Internal Server Error'
  };
  // include stack in development
  if (process.env.NODE_ENV !== 'production') payload.stack = err.stack;
  res.status(status).json(payload);
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;