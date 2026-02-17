import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, Clock, Scissors, User, ArrowLeft, ArrowRight } from 'lucide-react';

const Book = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Steps: 1. Service/Date, 2. Time Slot, 3. Details, 4. Success
    const [step, setStep] = useState(1);

    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(location.state?.service || null);

    // Logic for Date Selection (Simple Next 7 Days)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);

    // Staff Logic
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('any');

    const [userDetails, setUserDetails] = useState({
        customerName: '',
        phoneNumber: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Fetch Services & Staff
    useEffect(() => {
        api.get('/services').then(res => setServices(res.data)).catch(console.error);
        api.get('/auth/staff').then(res => setStaffList(res.data)).catch(console.error);
    }, []);

    // Fetch Slots when Date or Staff Changes
    useEffect(() => {
        if (selectedDate) {
            setAvailableSlots([]); // Clear old slots
            setSelectedTime(null);

            let query = `?date=${selectedDate}`;
            if (selectedStaff && selectedStaff !== 'any') query += `&staffId=${selectedStaff}`;
            if (selectedService) query += `&serviceId=${selectedService.id}`;

            api.get(`/bookings/slots${query}`)
                .then(res => setAvailableSlots(res.data))
                .catch(console.error);
        }
    }, [selectedDate, selectedStaff]);

    // Helpers
    const generateNextDays = (days = 14) => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < days; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            dates.push({
                full: d.toISOString().split('T')[0],
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNum: d.getDate()
            });
        }
        return dates;
    };
    const nextDates = generateNextDays();

    const handleServiceSelect = (s) => {
        setSelectedService(s);
        // If service selected, we can stay on Step 1 (Date) but it's "ready"
    };

    const handleNext = () => {
        if (step === 1 && selectedService && selectedDate) setStep(2);
        else if (step === 2 && selectedTime) setStep(3);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const confirmBooking = async () => {
        setIsSubmitting(true);
        setSubmitError('');

        const bookingPayload = {
            ServiceId: selectedService.id,
            customerName: userDetails.customerName,
            phoneNumber: userDetails.phoneNumber,
            date: `${selectedDate}T${selectedTime}:00`, // Combine Date + Time
            StaffId: selectedStaff
        };

        try {
            await api.post('/bookings', bookingPayload);
            setStep(4); // Success
            setTimeout(() => navigate('/'), 4000);
        } catch (err) {
            setSubmitError(err.response?.data?.error || 'Booking failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">

            {/* Header / Progress */}
            <div className="w-full max-w-lg mb-6">
                {step < 4 && (
                    <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                        <button onClick={handleBack} disabled={step === 1} className="flex items-center gap-1 disabled:opacity-0 text-gray-800">
                            <ArrowLeft size={16} /> Back
                        </button>
                        <span>Step {step} of 3</span>
                        <div className="w-8"></div> {/* Spacer */}
                    </div>
                )}
            </div>

            <div className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden pb-safe">

                {/* Step 1: Service & Date */}
                {step === 1 && (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Scissors className="text-primary" /> Select Service
                        </h2>

                        {/* Service List (Horizontal Scroll or Grid) */}
                        <div className="grid gap-3 mb-8">
                            {services.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => handleServiceSelect(s)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex justify-between items-center
                                        ${selectedService?.id === s.id ? 'border-primary bg-blue-50' : 'border-gray-100 hover:border-gray-300'}
                                    `}
                                >
                                    <div>
                                        <h3 className="font-bold text-gray-800">{s.title}</h3>
                                        <p className="text-sm text-gray-500">{s.duration} mins</p>
                                    </div>
                                    <span className="font-bold text-primary">£{s.price}</span>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <User className="text-primary" /> Select Specialist
                        </h2>

                        {/* Staff Selection */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            <button
                                onClick={() => setSelectedStaff('any')}
                                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all
                                    ${selectedStaff === 'any' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}
                                `}
                            >
                                Any Staff
                            </button>
                            {staffList.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedStaff(s.id)}
                                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all
                                        ${selectedStaff === s.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}
                                    `}
                                >
                                    {s.username}
                                </button>
                            ))}
                        </div>

                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Calendar className="text-primary" /> Select Date
                        </h2>
                        {/* Date Scroller */}
                        <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
                            {nextDates.map(d => (
                                <button
                                    key={d.full}
                                    onClick={() => setSelectedDate(d.full)}
                                    className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border-2 transition-all
                                        ${selectedDate === d.full ? 'border-primary bg-primary text-white shadow-md' : 'border-gray-100 text-gray-600'}
                                    `}
                                >
                                    <span className="text-xs uppercase font-bold">{d.dayName}</span>
                                    <span className="text-2xl font-bold">{d.dayNum}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Time Selection */}
                {step === 2 && (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Clock className="text-primary" /> Pick a Time
                        </h2>
                        <div className="mb-4 text-gray-600">
                            For <strong>{new Date(selectedDate).toDateString()}</strong>
                        </div>

                        {availableSlots.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">Loading slots...</div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {availableSlots.map(slot => (
                                    <button
                                        key={slot.time}
                                        disabled={!slot.available}
                                        onClick={() => setSelectedTime(slot.time)}
                                        className={`py-2 px-3 rounded-lg text-sm font-bold border transition-all
                                            ${!slot.available
                                                ? 'bg-gray-100 text-gray-300 border-transparent cursor-not-allowed decoration-slice'
                                                : selectedTime === slot.time
                                                    ? 'bg-primary text-white border-primary shadow-md scale-105'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary'}
                                        `}
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Details & Confirm */}
                {step === 3 && (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <User className="text-primary" /> Your Details
                        </h2>

                        <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-500">Service</span>
                                <span className="font-bold">{selectedService?.title}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-500">Date</span>
                                <span className="font-bold">{selectedDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Time</span>
                                <span className="font-bold">{selectedTime}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Jane Doe"
                                    value={userDetails.customerName}
                                    onChange={e => setUserDetails({ ...userDetails, customerName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="+1 234 567 8900"
                                    value={userDetails.phoneNumber}
                                    onChange={e => setUserDetails({ ...userDetails, phoneNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        {submitError && (
                            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                                {submitError}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                    <div className="p-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                            <Scissors size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-500">We'll see you on {selectedDate} at {selectedTime}.</p>
                    </div>
                )}

                {/* Footer Action Bar (Sticky on Mobile) */}
                {step < 4 && (
                    <div className="p-4 border-t bg-white sticky bottom-0">
                        <button
                            onClick={step === 3 ? confirmBooking : handleNext}
                            disabled={
                                (step === 1 && !selectedService) ||
                                (step === 2 && !selectedTime) ||
                                (step === 3 && (!userDetails.customerName || !userDetails.phoneNumber || isSubmitting))
                            }
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {step === 3
                                ? (isSubmitting ? 'Confirming...' : 'Confirm Appointment')
                                : <>Next <ArrowRight size={20} /></>
                            }
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Book;
