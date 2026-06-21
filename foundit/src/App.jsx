import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import OfficerLayout from './layouts/OfficerLayout';

// User Pages
import Feed from './pages/Feed';
import ReportFound from './pages/ReportFound';
import ReportLost from './pages/ReportLost';
import Login from './pages/Login';
import MyPosts from './pages/MyPosts';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerInventory from './pages/officer/OfficerInventory';
import OfficerLostList from './pages/officer/OfficerLostList';
import MasterKategori from './pages/officer/settings/MasterKategori';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Auth ── */}
        <Route path="/login" element={<Login />} />

        {/* ── User Routes ── */}
        <Route element={<ProtectedRoute allowedRoles={['mahasiswa', 'student', 'user']} />}>
          <Route element={<MainLayout />}>
            <Route path="/"              element={<Feed />} />
            <Route path="/report-found"  element={<ReportFound />} />
            <Route path="/report-found/edit/:id" element={<ReportFound />} />
            <Route path="/report-lost"   element={<ReportLost />} />
            <Route path="/report-lost/edit/:id" element={<ReportLost />} />
            <Route path="/my-posts"      element={<MyPosts />} />
          </Route>
        </Route>

        {/* ── Officer Routes ── */}
        <Route element={<ProtectedRoute allowedRoles={['officer', 'admin', 'petugas']} />}>
          <Route path="/officer" element={<OfficerLayout />}>
            <Route index element={<Navigate to="/officer/dashboard" replace />} />
            <Route path="dashboard"      element={<OfficerDashboard />} />
            <Route path="inventory"      element={<OfficerInventory />} />
            <Route path="lost-list"      element={<OfficerLostList />} />
            <Route path="settings/categories" element={<MasterKategori />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
