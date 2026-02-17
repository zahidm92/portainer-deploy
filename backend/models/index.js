const sequelize = require('../config/database');
const ServiceModel = require('./Service');
const BookingModel = require('./Booking');
const UserModel = require('./User');

const Service = ServiceModel(sequelize);
const Booking = BookingModel(sequelize);
const User = UserModel(sequelize);
const SiteSetting = require('./SiteSetting')(sequelize);
const Image = require('./Image')(sequelize);

// Define Associations
Booking.belongsTo(Service);
Service.hasMany(Booking);

Booking.belongsTo(User, { as: 'Staff', foreignKey: 'StaffId' });
User.hasMany(Booking, { foreignKey: 'StaffId' });

// Sync Databse
sequelize.sync({ alter: true })
    .then(() => console.log('Database synced'))
    .catch(err => console.log('Error syncing database:', err));

module.exports = {
    sequelize,
    User,
    Service,
    Booking,
    SiteSetting,
    Image
};
