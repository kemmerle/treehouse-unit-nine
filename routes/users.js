'use strict';

// load modules
const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

// Imports the authenticateUser validation function from the validations folder.
const authenticateUser = require('../validations/authenticate-user.js');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

//Imports the sequelize model User, so it can be manipulated in my routes.
const db = require('../models');
const User = db.User;

router.get('/users', authenticateUser, async (req, res) => {
   //Here I retrieve the authenticated user (in my authenticateUser validator,
   //I set the user.id as req.body.id for routes matching '/api/users'), and I
   //use the Sequelize attributes object to select only the id, first name, last
   //name, and email address to display. Then I send a 200 status code to the client
   //and display the user.
   const user = await User.findByPk(req.body.id, {
     attributes: ['id', 'firstName', 'lastName', 'emailAddress']
   });
   res.status(200).json(user);
});

router.post('/users', async(req, res, next) => {
  try{
   //Before I create a user, I use the bcryptjs module to hash the user's password.
   req.body.password = bcryptjs.hashSync(req.body.password)
   //I create the user.
   await User.create(req.body)
   //I set the Location header to '/'
   res.location('/');
   //I send the client a 201 Created status code and end the request.
   res.status(201).end();
  } catch(err) {
    //If there is a Sequelize Validation Error (a required field is missing) or
    //if the user's email is not unique, I send them a 400 status code and a
    //Sequelize error message.
    if (err.name === "SequelizeValidationError" || "SequelizeUniqueConstraintError") {
      res.status(400).json({error: err.message})
    } else {
      //For any other error, I send it on to my global error handler.
      return next(err);
    }
  }
})

module.exports = router;
