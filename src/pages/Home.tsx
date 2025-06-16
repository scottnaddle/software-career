import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Benefits from '../components/Benefits';
import Process from '../components/Process';
import Statistics from '../components/Statistics';

const Home = () => {
  return (
    <div>
      <Hero />
      <Services />
      <Benefits />
      <Process />
      <Statistics />
    </div>
  );
};

export default Home;