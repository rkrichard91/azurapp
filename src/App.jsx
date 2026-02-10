import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewSale from './pages/NewSale';
import PlanChange from './pages/PlanChange';
import IntegrationsCalculator from './pages/Integrations';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/new-sale" element={<NewSale />} />
                  <Route path="/plan-change" element={<PlanChange />} />
                  <Route path="/integrations" element={<IntegrationsCalculator />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
