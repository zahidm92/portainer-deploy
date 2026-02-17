import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Upload, Trash, Check, X } from 'lucide-react';

const ImageLibrary = ({ onSelect, onClose, mode = 'manage' }) => {
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const res = await api.get('/images');
            setImages(res.data);
        } catch (error) {
            console.error("Failed to fetch images", error);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            await api.post('/images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchImages();
        } catch (error) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this image?")) return;
        try {
            await api.delete(`/images/${id}`);
            fetchImages();
        } catch (error) {
            alert("Delete failed");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Media Library</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 bg-gray-50 flex items-center gap-4">
                    <label className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded cursor-pointer hover:bg-opacity-90">
                        <Upload size={18} />
                        <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                    </label>
                </div>

                {/* Grid */}
                <div className="flex-grow overflow-y-auto p-4">
                    {images.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">No images found. Upload one to get started.</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {images.map(img => (
                                <div
                                    key={img.id}
                                    className={`relative group border rounded-lg overflow-hidden cursor-pointer hover:shadow-md aspect-square bg-gray-100
                                        ${mode === 'select' ? 'hover:ring-2 hover:ring-primary' : ''}
                                    `}
                                    onClick={() => mode === 'select' && onSelect(img)}
                                >
                                    <img
                                        src={img.url.startsWith('http') ? img.url : `${API_URL}${img.url}`}
                                        alt={img.originalName}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        {mode === 'select' ? (
                                            <span className="bg-white text-primary px-3 py-1 rounded font-bold text-sm">Select</span>
                                        ) : (
                                            <button
                                                onClick={(e) => handleDelete(img.id, e)}
                                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                                title="Delete"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Info Strip */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate px-2">
                                        {img.originalName}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageLibrary;
