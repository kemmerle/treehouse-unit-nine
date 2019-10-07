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
const User = db.User;
const Course = db.Course;

router.get('/courses', async (req, res, next) => {
  const courses = await Course.findAll( {
    include : [{
        model : User,
        as: 'User',
        attributes: ['id', 'firstName', 'lastName']
      }
    ]
  });
  res.json(courses)
     .status(200).end();
});

router.get('/courses/:id', async (req, res, next) => {
  const course = await Course.findByPk(req.params.id, {
    include : [{
        model : User,
        as: 'User',
        attributes: ['id', 'firstName', 'lastName']
      }
    ]
  });

  if (course === null) {
    res.status(404).json({message: "This course does not exist"});
  } else {
    res.json(course)
       .status(200).end();
  }
});

module.exports = router;
