import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import { useNavigate } from 'react-router-dom';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get('/services');
                setServices(response.data);
            } catch (err) {
                console.error("Failed to fetch services", err);
                // Fallback or error
                setError('Failed to load services.');
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleBook = (service) => {
        navigate('/book', { state: { service } });
    };

    if (loading) return <div className="text-center py-10">Loading services...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-center">Our Services</h1>

            {services.length === 0 ? (
                <div className="text-center text-gray-500">No services available at the moment.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map(service => (
                        <ServiceCard key={service.id} service={service} onBook={handleBook} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Services;
