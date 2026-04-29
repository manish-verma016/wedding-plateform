import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

import { AuthProvider } from './lib/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import AIPlanner from './pages/AIPlanner';
import Services from './pages/Services';
import Inspiration from './pages/Inspiration';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminPanel from './pages/AdminPanel';
import BecomeVendor from './pages/BecomeVendor';
import VendorDashboard from './pages/VendorDashboard';
import MyBookings from './pages/MyBookings';
import GuestList from './pages/GuestList';
import VendorProfile from './pages/VendorProfile';
import AstroTools from './pages/AstroTools';
import Invitations from './pages/Invitations';
import GuestInvitation from './pages/GuestInvitation';

function PageLayout({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<PageLayout><Home /></PageLayout>} />
              <Route path="/ai-planner" element={<PageLayout><AIPlanner /></PageLayout>} />
              <Route path="/services" element={<PageLayout><Services /></PageLayout>} />
              <Route path="/inspiration" element={<PageLayout><Inspiration /></PageLayout>} />
              <Route path="/invitations" element={<PageLayout><Invitations /></PageLayout>} />
              <Route path="/about" element={<PageLayout><About /></PageLayout>} />
              <Route path="/contact" element={<PageLayout><Contact /></PageLayout>} />
              <Route path="/bookings" element={<PageLayout><MyBookings /></PageLayout>} />
              <Route path="/guest-list" element={<PageLayout><GuestList /></PageLayout>} />
              <Route path="/admin" element={<PageLayout><AdminPanel /></PageLayout>} />
              <Route path="/vendor" element={<PageLayout><VendorDashboard /></PageLayout>} />
              <Route path="/become-vendor" element={<PageLayout><BecomeVendor /></PageLayout>} />
              <Route path="/vendor-profile/:vendorId" element={<PageLayout><VendorProfile /></PageLayout>} />
              <Route path="/astro-tools" element={<PageLayout><AstroTools /></PageLayout>} />
              <Route path="/invite/:id" element={<GuestInvitation />} />
            </Routes>
          </main>

          <Footer />
          <Toaster position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}
