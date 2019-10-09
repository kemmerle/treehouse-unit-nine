'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
     allowNull: false,
     autoIncrement: true,
     primaryKey: true,
     type: DataTypes.INTEGER
   },
    firstName: {
     type: DataTypes.STRING,
     allowNull: false,
     validate: {
       notNull: {
         msg: 'Please provide a first name',
       },
       notEmpty: {
         msg: 'Please provide a first name',
       },
     },
   },
    lastName: {
     type: DataTypes.STRING,
     allowNull: false,
     validate: {
      notNull: {
        msg: 'Please provide a last name',
      },
      notEmpty: {
        msg: 'Please provide a last name',
      },
     },
   },
    emailAddress: {
     type: DataTypes.STRING,
     allowNull: false,
     //This Sequelize GitHub thread was very helpful in creating an error message
     //for the unique constraint: https://github.com/sequelize/sequelize/issues/5033
     unique: {args: true, msg: 'This email address is claimed'},
     validate: {
      notNull: {
        msg: 'Please provide an email',
      },
      notEmpty: {
        msg: 'Please provide an email',
      },
      isEmail: {
        msg: 'Please enter a valid email',
      },
     },
   },
    password: {
     type: DataTypes.STRING,
     allowNull: false,
     validate: {
      notNull: {
        msg: 'Please provide a password',
      },
      notEmpty: {
        msg: 'Please provide a password',
      },
     },
   }
  }, {});
  User.associate = function(models) {
    User.hasMany(models.Course, {
   foreignKey: {
     fieldName: 'userId',
     allowNull: false,
   },
 });
  };
  return User;
};
