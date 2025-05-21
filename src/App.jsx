import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './assets/css/load-styles.css';
import './assets/css/metisMenu.css';
import './assets/css/themify-icons.css';
import './assets/css/style.css';
import './assets/css/header-dropdown.css';
import './assets/css/custom-menu.css';
import './assets/js/metisMenu.js';
import Login from "./Login";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import CreateUser from "./components/CreateUser";
import LeadReport from "./components/LeadReport";
import LeadDetail from "./components/LeadDetail";
import ProjectReport from "./components/ProjectReport";
import AllProjectsReport from "./components/AllProjectsReport";
import ERCProjectsReport from "./components/ERCProjectsReport";
import STCProjectsReport from "./components/STCProjectsReport";
import ManageInvoice from "./components/ManageInvoice";
import CreateInvoice from "./components/CreateInvoice";
import MyProfile from "./components/MyProfile";

// Route wrapper component with authentication check
const ProtectedRoute = ({ children }) => {
  // Check if user is logged in by looking for user data in localStorage
  const isAuthenticated = localStorage.getItem('user') !== null;

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the protected content
  return children;
};

const App = () => {
  return (
    <Router basename="/reporting">
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Protected routes with Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/create-user" element={
          <ProtectedRoute>
            <Layout>
              <CreateUser />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/reports/sales" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/reports/leads" element={
          <ProtectedRoute>
            <Layout>
              <LeadReport />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/projects/all" element={
          <ProtectedRoute>
            <Layout>
              <AllProjectsReport />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/reports/analytics" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/send-lead" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/create-sales-user" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/affiliate-form" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/my-profile" element={
          <ProtectedRoute>
            <Layout>
              <MyProfile />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/invoices" element={
          <ProtectedRoute>
            <Layout>
              <ManageInvoice />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/finance/create-invoice" element={
          <ProtectedRoute>
            <Layout>
              <CreateInvoice />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Lead Detail Page */}
        <Route path="/lead-detail/:leadId" element={
          <ProtectedRoute>
            <Layout>
              <LeadDetail />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Project Routes */}
        <Route path="/projects/all" element={
          <ProtectedRoute>
            <Layout>
              <ProjectReport projectType="all" />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/projects/erc" element={
          <ProtectedRoute>
            <Layout>
              <ERCProjectsReport />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/projects/stc" element={
          <ProtectedRoute>
            <Layout>
              <STCProjectsReport />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/projects/tax-amendment" element={
          <ProtectedRoute>
            <Layout>
              <ProjectReport projectType="tax-amendment" />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/projects/audit-advisory" element={
          <ProtectedRoute>
            <Layout>
              <ProjectReport projectType="audit-advisory" />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/projects/rdc" element={
          <ProtectedRoute>
            <Layout>
              <ProjectReport projectType="rdc" />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/projects/settings" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
};

export default App;