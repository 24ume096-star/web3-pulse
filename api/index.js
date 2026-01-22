/**
 * Vercel Serverless Function Entry Point
 * 
 * This file exports the Express app as a Vercel serverless function
 */

const { app } = require('../backend/api/server.cjs');

// Export the Express app for Vercel
module.exports = app;
