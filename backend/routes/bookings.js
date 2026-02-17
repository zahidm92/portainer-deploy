const express = require('express');
const router = express.Router();
const { Booking, Service } = require('../models');
const { Op } = require('sequelize');

// GET Available Slots for a Date
router.get('/slots', async (req, res) => {
    try {
        const { date, staffId, serviceId } = req.query; // Format: YYYY-MM-DD
        if (!date) return res.status(400).json({ error: 'Date is required' });

        // Get Service Duration
        let serviceDuration = 15; // default
        if (serviceId) {
            const service = await Service.findByPk(serviceId);
            if (service) serviceDuration = service.duration;
        }

        // Define Start and End of the day
        const startOfDay = new Date(`${date}T00:00:00`);
        const endOfDay = new Date(`${date}T23:59:59`);

        // Fetch all relevant bookings for that day, including Service data to know their duration
        const whereClause = {
            date: {
                [Op.between]: [startOfDay, endOfDay]
            },
            status: { [Op.ne]: 'Rejected' }
        };

        if (staffId && staffId !== 'any') {
            whereClause.StaffId = staffId;
        }

        const bookings = await Booking.findAll({
            where: whereClause,
            include: Service // Needed to get duration of existing bookings
        });

        // Get all potential staff
        let staffList = [];
        const { User } = require('../models');
        if (staffId && staffId !== 'any') {
            staffList = [{ id: parseInt(staffId) }];
        } else {
            staffList = await User.findAll({ where: { role: ['admin', 'staff', 'root'] }, attributes: ['id'] });
        }

        const slots = [];
        const startTime = 9; // 9 AM
        const endTime = 18;  // 6 PM

        // Loop through every 15-min slot
        for (let hour = startTime; hour < endTime; hour++) {
            for (let min = 0; min < 60; min += 15) {
                const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

                // Construct Date objects for Proposed Booking
                const slotStart = new Date(`${date}T${timeStr}:00`);
                const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);

                // Check if slotEnd exceeds closing time
                const closingTime = new Date(`${date}T18:00:00`);
                if (slotEnd > closingTime) {
                    slots.push({ time: timeStr, available: false });
                    continue;
                }

                // Check availability
                // Strategy: Find at least ONE staff member who is free during [slotStart, slotEnd]

                let isSlotAvailable = false;

                for (const staff of staffList) {
                    // Check strict overlap with this staff's existing bookings
                    const staffBookings = bookings.filter(b => b.StaffId === staff.id);

                    const isStaffBusy = staffBookings.some(b => {
                        const existingStart = new Date(b.date);
                        const existingDuration = b.Service ? b.Service.duration : 15; // default if missing
                        const existingEnd = new Date(existingStart.getTime() + existingDuration * 60000);

                        // Overlap condition: (StartA < EndB) && (EndA > StartB)
                        return (slotStart < existingEnd && slotEnd > existingStart);
                    });

                    if (!isStaffBusy) {
                        isSlotAvailable = true;
                        break; // Found one available staff
                    }
                }

                slots.push({
                    time: timeStr,
                    available: isSlotAvailable
                });
            }
        }

        res.json(slots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// CREATE Booking
router.post('/', async (req, res) => {
    try {
        const { ServiceId, customerName, phoneNumber, date, StaffId } = req.body;

        // Validate if service exists
        const service = await Service.findByPk(ServiceId);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const validDate = new Date(date);

        let assignedStaffId = StaffId;
        const { User } = require('../models');

        const serviceDuration = service.duration || 15;

        // Helper to check availability
        const isStaffAvailable = async (staffId, slotStart, duration) => {
            const slotEnd = new Date(slotStart.getTime() + duration * 60000);
            const startOfDay = new Date(slotStart); startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(slotStart); endOfDay.setHours(23, 59, 59, 999);

            const staffBookings = await Booking.findAll({
                where: {
                    StaffId: staffId,
                    status: { [Op.ne]: 'Rejected' },
                    date: { [Op.between]: [startOfDay, endOfDay] }
                },
                include: Service
            });

            const isBusy = staffBookings.some(b => {
                const existingStart = new Date(b.date);
                const existingDuration = b.Service ? b.Service.duration : 15; // default
                const existingEnd = new Date(existingStart.getTime() + existingDuration * 60000);

                // Overlap: (StartA < EndB) && (EndA > StartB)
                return (slotStart < existingEnd && slotEnd > existingStart);
            });
            return !isBusy;
        };

        // Logic to assign staff if "Any" (null or undefined or 'any') was selected
        if (!assignedStaffId || assignedStaffId === 'any') {
            // Find ALL staff
            const allStaff = await User.findAll({ where: { role: ['admin', 'staff', 'root'] }, attributes: ['id'] });

            let found = false;
            for (const staff of allStaff) {
                if (await isStaffAvailable(staff.id, validDate, serviceDuration)) {
                    assignedStaffId = staff.id;
                    found = true;
                    break;
                }
            }

            if (!found) {
                return res.status(400).json({ error: 'No staff available for the full duration of this service.' });
            }
        } else {
            // Verify specific staff availability
            if (!(await isStaffAvailable(assignedStaffId, validDate, serviceDuration))) {
                return res.status(400).json({ error: 'Selected staff is busy during the requested time.' });
            }
        }

        const booking = await Booking.create({
            ServiceId,
            customerName,
            phoneNumber,
            date: validDate,
            StaffId: assignedStaffId
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET All Bookings (Protected)
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

router.get('/', async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        let user;
        try {
            user = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const whereClause = {};

        // If staff, only show their bookings
        // If admin/root, show all
        if (user.role === 'staff') {
            whereClause.StaffId = user.id;
        }

        const bookings = await Booking.findAll({
            where: whereClause,
            include: [
                { model: Service },
                { model: require('../models').User, as: 'Staff', attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE Booking Status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, suggestedDate, adminNotes } = req.body;
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Update fields
        if (status) booking.status = status;
        if (suggestedDate) booking.suggestedDate = suggestedDate;
        if (adminNotes) booking.adminNotes = adminNotes;

        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
