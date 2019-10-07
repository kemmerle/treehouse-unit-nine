'use strict';

// load modules
const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

// Imports the authenticateUser validation function from the validations folder.
const authenticateUser = require('../validations/authenticate-user.js')

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

//Imports the sequelize model User, so it can be manipulated in my routes.
const db = require('../models');
const User = db.User;

router.get('/users', authenticateUser, async (req, res) => {
   const user = await User.findByPk(req.body.id);
   res.json(user);
});

router.post('/users', async(req, res, next) => {
  try{
   req.body.password = bcryptjs.hashSync(req.body.password)
   await User.create(req.body)
   res.location('/');
   res.status(201).end();
  } catch(err) {
    if (err.name === "SequelizeValidationError" || "SequelizeUniqueConstraintError") {
      res.status(400).json({error: err.message})
    } else {
      return next(err);
    }
  }
})

module.exports = router;
