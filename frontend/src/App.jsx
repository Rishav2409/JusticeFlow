import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LanguageSelection from './pages/LanguageSelection';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import CaseList from './pages/CaseList';
import CaseEntry from './pages/CaseEntry';
import CaseResult from './pages/CaseResult';
import PriorityQueue from './pages/PriorityQueue';
import LegalAidRequests from './pages/LegalAidRequests';
import PoliceDashboard from './pages/PoliceDashboard';
import FamilyDashboard from './pages/FamilyDashboard';
import Profile from './pages/Profile';

import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* =====================================================
              PUBLIC ROUTES
              ===================================================== */}
          <Route path="/" element={<LanguageSelection />} />
          <Route path="/language" element={<LanguageSelection />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/login" element={<Login />} />

          {/* =====================================================
              LAWYER PROTECTED ROUTES (Review 1 preserved + Review 2 queue)
              ===================================================== */}
          <Route
            path="/cases"
            element={
              <ProtectedRoute allowedRoles={['LAWYER', 'POLICE']}>
                <Layout><CaseList /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/:id"
            element={
              <ProtectedRoute allowedRoles={['LAWYER', 'POLICE']}>
                <Layout><CaseResult /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/priority-queue"
            element={
              <ProtectedRoute allowedRoles={['LAWYER']}>
                <Layout><PriorityQueue /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/requests"
            element={
              <ProtectedRoute allowedRoles={['LAWYER']}>
                <Layout><LegalAidRequests /></Layout>
              </ProtectedRoute>
            }
          />

        {/* =====================================================
            POLICE PROTECTED ROUTES
            ===================================================== */}
        <Route
          path="/police/dashboard"
          element={
            <ProtectedRoute allowedRoles={['POLICE']}>
              <Layout><PoliceDashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/police/new-case"
          element={
            <ProtectedRoute allowedRoles={['POLICE']}>
              <Layout><CaseEntry /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-case"
          element={
            <ProtectedRoute allowedRoles={['POLICE']}>
              <Layout><CaseEntry /></Layout>
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            FAMILY MEMBER PROTECTED ROUTES
            ===================================================== */}
        <Route
          path="/family/dashboard"
          element={
            <ProtectedRoute allowedRoles={['FAMILY_MEMBER', 'FAMILY']}>
              <Layout><FamilyDashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/family/check-case"
          element={
            <ProtectedRoute allowedRoles={['FAMILY_MEMBER', 'FAMILY']}>
              <Layout><FamilyDashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/family/requests"
          element={
            <ProtectedRoute allowedRoles={['FAMILY_MEMBER', 'FAMILY']}>
              <Layout><FamilyDashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/family/info"
          element={
            <ProtectedRoute allowedRoles={['FAMILY_MEMBER', 'FAMILY']}>
              <Layout><FamilyDashboard /></Layout>
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            SHARED PROTECTED ROUTES (PROFILE)
            ===================================================== */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['LAWYER', 'POLICE', 'FAMILY_MEMBER', 'FAMILY']}>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
