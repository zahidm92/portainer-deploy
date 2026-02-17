const sequelize = require('./config/database');
const { Service, User } = require('./models');
const bcrypt = require('bcryptjs');

const seedData = [
    {
        title: "Classic Haircut",
        description: "A timeless cut tailored to your style preferences. Includes shampoo and styling.",
        price: 35.00,
        duration: 45,
        imageURL: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Beard Trim & Shape",
        description: "Expert grooming for your beard with hot towel treatment.",
        price: 25.00,
        duration: 30,
        imageURL: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Full Service Spa Treatment",
        description: "Haircut, beard trim, facial, and relaxing massage.",
        price: 120.00,
        duration: 90,
        imageURL: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Hair Coloring",
        description: "Professional hair coloring services using premium dyes.",
        price: 80.00,
        duration: 120,
        imageURL: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?q=80&w=1000&auto=format&fit=crop"
    }
];

const seedDatabase = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0'); // Disable FK
        await sequelize.sync({ force: true }); // WARNING: This clears the DB
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1'); // Enable FK

        // Seed Services
        await Service.bulkCreate(seedData);
        console.log("Services seeded successfully!");

        // Seed Root User
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            username: 'admin',
            password: hashedPassword,
            role: 'root'
        });
        console.log("Root user seeded successfully!");

        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();
