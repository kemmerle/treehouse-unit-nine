'use strict';

// load modules
const express = require('express');
const router = express.Router();
const morgan = require('morgan');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// Imports the sequelize Course model, so it can be manipulated in my routes.
const db = require('../models');
const Course = db.Course;

router.get('/courses', async (req, res, next) => {
  const courses = await Course.findAll();
  res.json(courses)
     .status(200).end();
});

module.exports = router;
