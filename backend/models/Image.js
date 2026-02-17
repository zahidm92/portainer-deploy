const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Image = sequelize.define('Image', {
        filename: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        originalName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        mimeType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        size: {
            type: DataTypes.INTEGER, // in bytes
        }
    });

    return Image;
};
