import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import JobListings from './components/JobListings';
import Companies from './components/Companies';
import Features from './components/Features';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <JobListings />
      <Companies />
      <Features />
      <Footer />
    </div>
  );
}

export default App;