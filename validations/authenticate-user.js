//Imports modules
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

//Imports the sequelize User model, so I can find out whether the user making
//the request is in my data store.
const db = require('../models');
const User = db.User;

//The authenticateUser middleware function has been adapted from the 'REST API
//Authentication with Express' Treehouse course.
const authenticateUser = (req, res, next) => {
  //Parse the user's credentials from the Authorization header.
  const credentials = auth(req);

  //If the user's credentials are available...
  if (credentials) {
    //Attempt to retrieve the user from the data store by their email address
    //(their 'name' in their credentials)
    User.findOne({
        where : {
          emailAddress : credentials.name
        }
      }).then(user => {
        //If a user was successfully retrieved from the data store...
        if (user) {
          // Use the bcryptjs npm package to compare the user's password
          // (from the Authorization header) to the user's password
          // that was retrieved from the data store.
          const authenticated = bcryptjs
            .compareSync(credentials.pass, user.password);

          //If the passwords match...
          if (authenticated) {
            console.log(`Authentication successful for user with email Address: ${user.emailAddress}`);

           // Then store the retrieved user object on the request object
           // so any middleware functions that follow this middleware function
           // will have access to the user's information.
           //I learned about the req.originalUrl property from:
           //https://expressjs.com/en/api.html
           if (req.originalUrl === '/api/users') {
             req.body.id = user.id;
           } else if (req.originalUrl.substring(0, 12) === '/api/courses') {
             req.body.userId = user.id;
           }
          next();
          } else {
            //If the passwords do not match, return a response with a 401
            //Unauthorized HTTP status code.
            console.log(`Authentication failure for user: ${user.emailAddress}`);
            res.status(401).json({ message: 'Access Denied' });
          }
        } else {
          //If the user does not exist, return a response with a 401
          //Unauthorized HTTP status code.
          console.log( `User not found: ${credentials.name}`);
          res.status(401).json({ message: 'Access Denied' });
        }
      })
    } else {
      //If the header is missing, return a response with a 401
      //Unauthorized HTTP status code.
      console.log('Auth header not found');
      res.status(401).json({ message: 'Access Denied' });
    }
}

module.exports = authenticateUser;
