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
     validate: {
      notNull: {
        msg: 'Please provide an email',
      },
      notEmpty: {
        msg: 'Please provide an email',
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
