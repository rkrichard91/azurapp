import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import IntegrationsCalculator from './pages/Integrations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/integrations" element={<IntegrationsCalculator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
