const { DataTypes } = require('sequelize');

// Model definition


module.exports = (sequelize) => {
    const Service = sequelize.define('Service', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        duration: {
            type: DataTypes.INTEGER, // in minutes
            allowNull: false,
        },
        imageURL: {
            type: DataTypes.STRING,
        }
    });
    return Service;
};
