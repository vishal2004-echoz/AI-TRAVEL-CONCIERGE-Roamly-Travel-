import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import Agent from './pages/Agent';
import About from './pages/About';
import Battle from './pages/Battle';
import BudgetTruth from './pages/BudgetTruth';
import Concierge from './pages/Concierge';
import Contact from './pages/Contact';
import Explore from './pages/Explore';
import Features from './pages/Features';
import Home from './pages/Home';
import Itinerary from './pages/Itinerary';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import TravelDNA from './pages/TravelDNA';
import TripRoast from './pages/TripRoast';
import WhatIf from './pages/WhatIf';
// ── NEW ───────────────────────────────────────────────────────────
import UserAnalytics from './pages/UserAnalytics';
import AdminAnalytics from './pages/AdminAnalytics';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dusk-900">
        <div className="text-center">
          <div className="mb-4 text-4xl animate-spin">🧭</div>
          <p className="font-body text-sand-300">Loading Roamly...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="texture-overlay min-h-screen bg-dusk-900">
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/explore" /> : <Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={user ? <Navigate to="/explore" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/explore" /> : <Signup />} />
        <Route path="/features" element={<Features />} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/concierge" element={<ProtectedRoute><Concierge /></ProtectedRoute>} />
        <Route path="/roast" element={<ProtectedRoute><TripRoast /></ProtectedRoute>} />
        <Route path="/battle" element={<ProtectedRoute><Battle /></ProtectedRoute>} />
        <Route path="/what-if" element={<ProtectedRoute><WhatIf /></ProtectedRoute>} />
        <Route path="/budget" element={<ProtectedRoute><BudgetTruth /></ProtectedRoute>} />
        <Route path="/dna" element={<ProtectedRoute><TravelDNA /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/agent" element={<ProtectedRoute><Agent /></ProtectedRoute>} />
        <Route path="/itinerary" element={<ProtectedRoute><Itinerary /></ProtectedRoute>} />
        {/* ── Analytics ─────────────────────────────────────────── */}
        <Route path="/analytics" element={<ProtectedRoute><UserAnalytics /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
      </Routes>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}