import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import CareerRegistration from './pages/CareerRegistration';
import CareerSearch from './pages/CareerSearch';
import CertificateIssue from './pages/CertificateIssue';
import EnterpriseService from './pages/EnterpriseService';
import Guide from './pages/Guide';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';
import ExpertApplication from './pages/ExpertApplication';
import ExpertDashboard from './pages/ExpertDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/career-registration" 
              element={
                <ProtectedRoute>
                  <CareerRegistration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/career-search" 
              element={
                <ProtectedRoute>
                  <CareerSearch />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/certificate-issue" 
              element={
                <ProtectedRoute>
                  <CertificateIssue />
                </ProtectedRoute>
              } 
            />
            <Route path="/enterprise" element={<EnterpriseService />} />
            <Route path="/guide" element={<Guide />} />
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Register />
                </ProtectedRoute>
              } 
            />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/fail" element={<PaymentFail />} />
            <Route 
              path="/expert-application" 
              element={
                <ProtectedRoute>
                  <ExpertApplication />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/expert-dashboard" 
              element={
                <ProtectedRoute>
                  <ExpertDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;