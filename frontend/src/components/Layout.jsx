import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

const Layout = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    // Toggle menu
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Close menu when clicking a link
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-primary text-white shadow-md relative z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-secondary" onClick={closeMenu}>
                        <Scissors size={28} />
                        <span>StyleCut Salon</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:block">
                        <ul className="flex space-x-6">
                            <li><Link to="/" className="hover:text-secondary transition">Home</Link></li>
                            <li><a href="/#services" className="hover:text-secondary transition">Services</a></li>
                            <li><Link to="/book" className="hover:text-secondary transition">Book Now</Link></li>
                            <li><Link to="/admin" className="text-gray-400 hover:text-white text-sm">Admin Portal</Link></li>
                        </ul>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-white focus:outline-none" onClick={toggleMenu}>
                        {isMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        )}
                    </button>
                </div>

                {/* Mobile Nav Overlay */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-primary shadow-lg py-4 px-4 flex flex-col space-y-4 border-t border-gray-700">
                        <Link to="/" className="hover:text-secondary transition py-2 border-b border-gray-700" onClick={closeMenu}>Home</Link>
                        <a href="/#services" className="hover:text-secondary transition py-2 border-b border-gray-700" onClick={closeMenu}>Services</a>
                        <Link to="/book" className="hover:text-secondary transition py-2 border-b border-gray-700" onClick={closeMenu}>Book Now</Link>
                        <Link to="/admin" className="text-gray-400 hover:text-white text-sm py-2" onClick={closeMenu}>Admin Portal</Link>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-primary text-gray-400 py-6">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; {new Date().getFullYear()} StyleCut Salon. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
