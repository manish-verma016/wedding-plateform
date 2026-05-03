import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Menu, X, LayoutDashboard, UserPlus, Shield, LogOut, Calendar, Star, Mail } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownTimeoutRef = useRef(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    await auth.signOut();
    setShowDropdown(false);
    navigate('/');
  };

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 1500);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'AI Planner', href: '/ai-planner' },
    { name: 'Astro Tools', href: '/astro-tools' },
    { name: 'Invitations', href: '/invitations' },
    { name: 'Become Vendor', href: '/become-vendor' },
  ];

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
    src="glogo.png" 
    alt="Gathbandhan Logo" 
                className="w-36 h-20 
              object-contain
               rounded-lg 
               transition-all duration-300 ease-in-out 
               group-hover:rounded-[50%] 
               group-hover:scale-225"
                
  />
            <Heart className="w-8 h-8 text-pink-600 fill-pink-600 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-black tracking-tight text-gray-900 font-serif">Gathbandhan</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "relative text-sm font-bold uppercase tracking-widest transition-all",
                    isActive ? "text-pink-600" : "text-gray-400 hover:text-gray-900"
                  )}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-pink-600 rounded-full"
                    />
                  )}
                </Link>
              );
            })}

            {user ? (
              <div 
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-pink-100 p-0.5"
                    referrerPolicy="no-referrer"
                  />
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-72 bg-white rounded-[2rem] shadow-2xl shadow-gray-200 border border-gray-50 py-6 overflow-hidden z-[100]"
                    >
                      <div className="px-8 pb-6 border-b border-gray-50 flex items-center space-x-4">
                        <img
                          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                          alt="Profile"
                          className="w-14 h-14 rounded-2xl object-cover ring-4 ring-pink-50"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-black text-gray-900 truncate leading-tight">{user.displayName}</p>
                          <p className="text-[10px] text-gray-400 font-bold truncate tracking-tight mb-2">{user.email}</p>
                          <span className="inline-block px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-black bg-pink-50 text-pink-600 rounded-lg">
                            {role || 'Guest'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="px-4 pt-4 space-y-1">
                        <Link to="/bookings" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all group">
                          <LayoutDashboard className="w-4 h-4 mr-4 text-pink-400 group-hover:scale-110 transition-transform" /> My Dashboard
                        </Link>

                        <Link to="/guest-list" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all group">
                          <UserPlus className="w-4 h-4 mr-4 text-pink-400 group-hover:scale-110 transition-transform" /> Guest List
                        </Link>

                        <Link to="/invitations" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all group">
                          <Mail className="w-4 h-4 mr-4 text-pink-400 group-hover:scale-110 transition-transform" /> Invitations
                        </Link>

                        <Link to="/astro-tools" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all group">
                          <Star className="w-4 h-4 mr-4 text-pink-400 group-hover:scale-110 transition-transform" /> Astro Tools
                        </Link>
                        
                        <Link to="/become-vendor" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all group">
                          <Calendar className="w-4 h-4 mr-4 text-pink-400 group-hover:scale-110 transition-transform" /> Become a Vendor
                        </Link>

                        {role === 'admin' && (
                          <Link to="/admin" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all group">
                            <Shield className="w-4 h-4 mr-4 text-pink-400 group-hover:scale-110 transition-transform" /> Admin Panel
                          </Link>
                        )}
                        
                        {(role === 'vendor' || role === 'admin') && (
                          <Link to="/vendor" onClick={() => setShowDropdown(false)} className="flex items-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all group">
                            <LayoutDashboard className="w-4 h-4 mr-4 text-pink-400 group-hover:scale-110 transition-transform" /> Vendor Dashboard
                          </Link>
                        )}

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center px-4 py-3 text-xs font-bold text-red-500 uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all group"
                        >
                          <LogOut className="w-4 h-4 mr-4 text-red-300 group-hover:translate-x-1 transition-transform" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-pink-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-50"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl"
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <Link
                  to="/bookings"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl"
                >
                  My Dashboard
                </Link>
              )}
              {!user && (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full text-left px-4 py-3 text-base font-medium text-pink-600 hover:bg-pink-50 rounded-xl"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

    <AuthModal 
      isOpen={isAuthModalOpen} 
      onClose={() => setIsAuthModalOpen(false)} 
    />
    </>
  );
}
