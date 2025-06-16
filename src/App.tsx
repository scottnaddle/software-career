import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/career-registration" element={<CareerRegistration />} />
          <Route path="/career-search" element={<CareerSearch />} />
          <Route path="/certificate-issue" element={<CertificateIssue />} />
          <Route path="/enterprise" element={<EnterpriseService />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;