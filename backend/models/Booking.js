const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Booking = sequelize.define('Booking', {
        customerName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Suggested', 'Completed', 'Seen'),
            defaultValue: 'Pending',
        },
        adminNotes: {
            type: DataTypes.TEXT,
        },
        suggestedDate: {
            type: DataTypes.DATE, // For "Suggested" status
        },
        // StaffId will be added by association

    });
    return Booking;
};
