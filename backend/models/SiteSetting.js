const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SiteSetting = sequelize.define('SiteSetting', {
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        value: {
            type: DataTypes.TEXT, // Store JSON or simple string
            allowNull: false
        }
    });

    return SiteSetting;
};
