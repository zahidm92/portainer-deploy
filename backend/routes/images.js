const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Image } = require('../models');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// GET All Images
router.get('/', async (req, res) => {
    try {
        const images = await Image.findAll({ order: [['createdAt', 'DESC']] });
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPLOAD Image
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const newImage = await Image.create({
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            url: imageUrl,
            size: req.file.size
        });

        res.status(201).json(newImage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE Image
router.delete('/:id', async (req, res) => {
    try {
        const image = await Image.findByPk(req.params.id);
        if (!image) return res.status(404).json({ error: "Image not found" });

        // Delete from filesystem
        const filePath = path.join(__dirname, '../public/uploads', image.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from DB
        await image.destroy();
        res.json({ message: "Image deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
