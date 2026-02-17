import { Clock, PoundSterling } from 'lucide-react';

const ServiceCard = ({ service, onBook }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="h-48 bg-gray-200">
                {service.imageURL ? (
                    <img
                        src={service.imageURL.startsWith('http') ? service.imageURL : `${API_URL}${service.imageURL}`}
                        alt={service.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        <span>{service.duration} mins</span>
                    </div>
                    <div className="flex items-center font-semibold text-primary">
                        <PoundSterling size={16} className="mr-1" />
                        <span>{service.price}</span>
                    </div>
                </div>

                <button
                    onClick={() => onBook(service)}
                    className="w-full bg-primary text-white py-2 rounded hover:bg-gray-800 transition"
                >
                    Book Now
                </button>
            </div>
        </div>
    );
};

export default ServiceCard;
