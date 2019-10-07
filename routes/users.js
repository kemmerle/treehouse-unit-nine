'use strict';

// load modules
const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

// Imports the authenticateUser validation function from the validations folder.
const authenticateUser = require('../validations/authenticate-user.js');

const authenticateNewUser = [
  check('firstName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "firstName"'),
  check('lastName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "lastName"'),
  check('emailAddress')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "emailAddress"'),
  check('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "password"'),
];

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

//Imports the sequelize model User, so it can be manipulated in my routes.
const db = require('../models');
const User = db.User;

router.get('/users', authenticateUser, async (req, res) => {
   const user = await User.findByPk(req.body.id, {
     attributes: ['id', 'firstName', 'lastName', 'emailAddress']
   });
   res.json(user);
});

router.post('/users', authenticateNewUser, async(req, res, next) => {
  // Attempt to get the validation result from the Request object.
    const errors = validationResult(req);
    // If there are validation errors...
    if (!errors.isEmpty()) {
      // Use the Array `map()` method to get a list of error messages.
      const errorMessages = errors.array().map(error => error.msg);

      // Return the validation errors to the client.
      return res.status(400).json({ errors: errorMessages });
    }
    // Get the user from the request body.
    const user = req.body;
    // Hash the new user's password.
    user.password = bcryptjs.hashSync(user.password);
    // Add the user to the `users` array.
    await User.create(user);
    // Set the status to 201 Created and end the response.
    return res.status(201).end();
});

module.exports = router;
