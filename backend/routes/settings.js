const express = require('express');
const router = express.Router();
const { SiteSetting } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// GET Hero Image
router.get('/hero', async (req, res) => {
    try {
        const setting = await SiteSetting.findOne({ where: { key: 'hero_image_url' } });
        res.json({ url: setting ? setting.value : null });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPADTE Hero Image
router.post('/hero', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        // Construct URL based on where we serve static files.
        // Assuming /uploads is served statically
        const imageUrl = `/uploads/${req.file.filename}`;

        // Upsert setting
        const [setting, created] = await SiteSetting.findOrCreate({
            where: { key: 'hero_image_url' },
            defaults: { value: imageUrl }
        });

        if (!created) {
            setting.value = imageUrl;
            await setting.save();
        }

        res.json({ url: imageUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
