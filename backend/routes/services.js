const express = require('express');
const router = express.Router();
const { Service, Image } = require('../models');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

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
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// GET all services
router.get('/', async (req, res) => {
    try {
        const services = await Service.findAll();
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST new service (Admin)
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, price, duration, description, imageURL } = req.body;

        let finalImageURL = imageURL;
        if (req.file) {
            finalImageURL = `/uploads/${req.file.filename}`;
            // Register in Image Library
            await Image.create({
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                url: finalImageURL,
                size: req.file.size
            });
        }

        const service = await Service.create({
            title,
            price,
            duration,
            description,
            imageURL: finalImageURL
        });
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// UPDATE Service
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, price, duration, description, imageURL } = req.body;
        const service = await Service.findByPk(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        let finalImageURL = imageURL || service.imageURL;
        if (req.file) {
            finalImageURL = `/uploads/${req.file.filename}`;
            // Register in Image Library
            await Image.create({
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                url: finalImageURL,
                size: req.file.size
            });
        }

        service.title = title || service.title;
        service.price = price || service.price;
        service.duration = duration || service.duration;
        service.description = description || service.description;
        service.imageURL = finalImageURL;

        await service.save();
        res.json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE service
router.delete('/:id', async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Note: We do NOT delete the image file anymore, as it might be used by other services or in the library.

        await service.destroy();
        res.json({ message: 'Service deleted' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
