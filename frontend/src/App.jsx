import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import DiscoverIssuesPage from './pages/DiscoverIssuesPage';
import IssueDetailPage from './pages/IssueDetailPage';
import ReportIssuePage from './pages/ReportIssuePage';
import SolutionHubPage from './pages/SolutionHubPage';
import ProposalDetailPage from './pages/ProposalDetailPage';
import ImpactAnalyticsPage from './pages/ImpactAnalyticsPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Dashboards
import CitizenDashboard from './dashboards/CitizenDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import OfficerDashboard from './dashboards/OfficerDashboard';
import GovernmentDashboard from './dashboards/GovernmentDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import FacultyDashboard from './dashboards/FacultyDashboard';
import IndustryDashboard from './dashboards/IndustryDashboard';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/issues" element={<DiscoverIssuesPage />} />
          <Route path="/issues/:id" element={<IssueDetailPage />} />
          <Route 
            path="/report" 
            element={
              <ProtectedRoute>
                <ReportIssuePage />
              </ProtectedRoute>
            } 
          />
          <Route path="/solutions" element={<SolutionHubPage />} />
          <Route path="/solutions/proposals/:id" element={<ProposalDetailPage />} />
          <Route path="/impact" element={<ImpactAnalyticsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Role Dashboards - Protected */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <CitizenDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/officer-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['AUTHORITY_OFFICER', 'SYSTEM_ADMIN']}>
                <OfficerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/government-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['GOVERNMENT_OFFICIAL', 'SYSTEM_ADMIN']}>
                <GovernmentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT_TEAM', 'SYSTEM_ADMIN']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/faculty-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['FACULTY_MENTOR', 'SYSTEM_ADMIN']}>
                <FacultyDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/industry-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['INDUSTRY_PARTNER', 'SYSTEM_ADMIN']}>
                <IndustryDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

