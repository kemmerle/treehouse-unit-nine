'use strict';

// load modules
const express = require('express');
const router = express.Router();
const morgan = require('morgan');

// Imports the authenticateUser validation function from the validations folder.
const authenticateUser = require('../validations/authenticate-user.js');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// Imports the sequelize Course model, so it can be manipulated in my routes.
const db = require('../models');
const User = db.User;
const Course = db.Course;


//Here I use an async function, so that I can retrieve all courses from my database
//using the Sequelize operator findAll. In my '/api/courses', I need to display
//all courses and also include information on the user who owns the course (to
//get this information, I've used the Sequelize include query method). I also need
//to filter out the 'createdAt' and 'updatedAt' properties (for which I've used the
//exclude Sequelize query method on the attributes object)
router.get('/courses', async (req, res, next) => {
  const courses = await Course.findAll( {
    //I learned how to include information from another join table in a Sequelize
    //query in following GitHub gist:
    //https://gist.github.com/zcaceres/83b554ee08726a734088d90d455bc566
    include : [{
        model : User,
        as: 'User',
        attributes: ['id', 'firstName', 'lastName']
      }
    ],
    //I learned how to exclude certain properties from a Sequelize model in a query
    //through the following Sequelize documents:
    //https://sequelize.readthedocs.io/en/latest/docs/querying/
    attributes: { exclude: ['createdAt', 'updatedAt'] }
  });
  res.json(courses)
     .status(200).end();
});


//Here I use an async function, so that I can retrieve a single from my database
//using the Sequelize operator findByPk. In my '/api/courses/:id', I need to display
//a course and also include information on the user who owns the course (to
//get this information, I've used the Sequelize include query method). I also need
//to filter out the 'createdAt' and 'updatedAt' properties (for which I've used the
//exclude Sequelize query method on the attributes object)
router.get('/courses/:id', async (req, res, next) => {
  const course = await Course.findByPk(req.params.id, {
    //I learned how to include information from another join table in a Sequelize
    //query in following GitHub gist:
    //https://gist.github.com/zcaceres/83b554ee08726a734088d90d455bc566
    include : [{
        model : User,
        as: 'User',
        attributes: ['id', 'firstName', 'lastName']
      }
    ],
    //I learned how to exclude certain properties from a Sequelize model in a query
    //through the following Sequelize documents:
    //https://sequelize.readthedocs.io/en/latest/docs/querying/
    attributes: { exclude: ['createdAt', 'updatedAt'] }
  });
  //If the course doesn't exist, I send a 404 status code back to the client
  //and tell them the course doesn't exist.
  if (course === null) {
    res.status(404).json({message: "This course does not exist"});
  } else {
    //If the course does exist, I display the course, send back a 200 status
    //code, and then end the request.
    res.json(course)
       .status(200).end();
  }
});

//In my POST '/courses' route, I allow an authenticated user to create a course.
//I've adapted my POST '/courses' route directly from my POST routes for my
//Project 8 (Sequelize Library Manager).
router.post('/courses', authenticateUser, async (req, res, next) => {
   try {
     //I create the course and set it to the variable 'course'
     const course = await Course.create(req.body);
     //I set the Location header to the URI for the course
     res.location(`/api/courses/${course.id}`);
     //I return a 201 Created status code to the client and end the request.
     res.status(201).end();
   } catch(err) {
     //If there is a Sequelize Validation Error (a required field is missing), I
     //send the client a 400 status code and a Sequelize error message.
     if (err.name === "SequelizeValidationError") {
       res.status(400).json({ error: err.message });
     } else {
       //For any other error, I send it on to my global error handler.
       return next(err);
     }
   }
});

//In my PUT '/courses/:id' route, I allow an authenticated user who owns the course
//to update the course.
router.put('/courses/:id', authenticateUser, async (req, res, next) => {
  try {
    //Here I retrieve the specific course to be updated.
    const course = await Course.findByPk(req.params.id)
    //Then I check whether the authenticated user is the user who owns the course
    //(user associated with the userId on the course)...
    if (req.body.userId === course.userId) {
      //Then I check whether the user has included a title and description in their
      //request body to update the course.
      //If they have included the correct information in the req.body object...
      if (req.body.title && req.body.description) {
        //If the course doesn't exist, I send a 404 status code back to the client
        //and tell them the course doesn't exist.
        if (course === null) {
          res.status(404).json({ message: "This course does not exist" });
        } else {
          //If the course does exist, I update the course, send back a 204 status
          //code, and then end the request.
          await course.update(req.body);
          res.status(204).end();
        }
      } else if (!req.body.title || !req.body.description) {
        //If the user hasn't included a title or description in the body of their
        //request, I send back a 400 status code and tell them they sent a bad
        //request.
        res.status(400).json({ message: "Bad Request" })
      }
    } else {
      //If the user does not own the course, then I send back a 403 status code
      //and tell them this action is forbidden.
      res.status(403).json({ message: "Forbidden" });
    }
  } catch(err) {
    //For any other error, I send it on to my global error handler.
    return next(err);
  }
});

router.delete('/courses/:id', authenticateUser, async (req, res, next) => {
  try {
      //Here I retrieve the specific course to be deleted.
    const course = await Course.findByPk(req.params.id);
    //Then I check whether the authenticated user is the user who owns the course
    //(user associated with the userId on the course)...
    if (req.body.userId === course.userId) {
      //If the course doesn't exist, I send a 404 status code back to the client
      //and tell them the course doesn't exist.
      if (course === null) {
        res.status(404).json({ message: "This course does not exist" });
      } else {
        //If the course does exist, I update the course, send back a 204 status
        //code, and then end the request.
        await course.destroy();
        res.status(204).end();
      }
    } else {
      //If the user does not own the course, then I send back a 403 status code
      //and tell them this action is forbidden.
      res.status(403).json({ message: "Forbidden" });
    }
  } catch(err) {
    //For any other error, I send it on to my global error handler.
    return next(err);
  }
})

module.exports = router;
