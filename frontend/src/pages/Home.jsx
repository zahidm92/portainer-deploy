import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [services, setServices] = useState([]);
    const navigate = useNavigate();
    const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        api.get('/services').then(res => setServices(res.data)).catch(console.error);
        api.get('/settings/hero').then(res => {
            if (res.data.url) {
                const url = res.data.url.startsWith('http') ? res.data.url : `${API_URL}${res.data.url}`;
                setHeroImage(url);
            }
        }).catch(err => console.log('No hero image found, using default'));
    }, []);

    const handleBook = (service) => {
        navigate('/book', { state: { service } });
    };

    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section
                className="w-full bg-cover bg-center h-auto min-h-[400px] md:h-[500px] py-20 md:py-0 flex items-center justify-center relative"
                style={{ backgroundImage: `url(${heroImage})` }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                <div className="relative text-center text-white px-4">
                    <h1 className="text-5xl font-bold mb-4 drop-shadow-md">Style & Elegance Reformulated</h1>
                    <p className="text-xl mb-8 drop-shadow-sm">Experience the best haircut and spa services in town.</p>
                    <a href="#services" className="bg-secondary text-primary px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-500 transition shadow-lg">
                        Our Services
                    </a>
                </div>
            </section>

            {/* Services Section (Moved from separate page) */}
            <section id="services" className="container mx-auto py-16 px-4">
                <h2 className="text-3xl font-bold mb-8 text-center">Our Services</h2>
                {services.length === 0 ? (
                    <div className="text-center text-gray-500">Loading services...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map(service => (
                            <ServiceCard key={service.id} service={service} onBook={handleBook} />
                        ))}
                    </div>
                )}
            </section>

            {/* Features Section */}
            <section className="container mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center bg-gray-50 bg-opacity-50">
                <div className="p-6 bg-white rounded-lg shadow-sm">
                    <div className="text-secondary text-4xl mb-4">✂️</div>
                    <h3 className="text-xl font-bold mb-2">Expert Stylists</h3>
                    <p className="text-gray-600">Our team of professionals is dedicated to making you look your best.</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm">
                    <div className="text-secondary text-4xl mb-4">📅</div>
                    <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
                    <p className="text-gray-600">Book your appointment online in just a few clicks.</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm">
                    <div className="text-secondary text-4xl mb-4">✨</div>
                    <h3 className="text-xl font-bold mb-2">Premium Products</h3>
                    <p className="text-gray-600">We use only high-quality products for your hair and skin.</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
