import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// CSS imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './assets/css/load-styles.css';
import './assets/css/metisMenu.css';
import './assets/css/themify-icons.css';
import './assets/css/style.css';
import './assets/css/header-dropdown.css';

// JS imports
import './assets/js/metisMenu.js';

// Core components
import Login from "./Login";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import MyProfile from "./components/MyProfile";
import CreateUser from "./components/CreateUser";

// Lead components
import LeadReport from "./components/LeadReport";
import LeadDetail from "./components/LeadDetail";
import ERCLeadReport from "./components/ERCLeadReport";
import STCLeadReport from "./components/STCLeadReport";
import TaxAmendmentLeadReport from "./components/TaxAmendmentLeadReport";
import AuditAdvisoryLeadReport from "./components/AuditAdvisoryLeadReport";
import RDCLeadReport from "./components/RDCLeadReport";
import PartnershipLeadReport from "./components/PartnershipLeadReport";

// Project components
import ProjectReport from "./components/ProjectReport";
import AllProjectsReport from "./components/AllProjectsReport";
import ERCProjectsReport from "./components/ERCProjectsReport";
import STCProjectsReport from "./components/STCProjectsReport";
import TaxAmendmentProjectsReport from "./components/TaxAmendmentProjectsReport";
import AuditAdvisoryProjectsReport from "./components/AuditAdvisoryProjectsReport";
import RDCProjectsReport from "./components/RDCProjectsReport";

// Finance components
//import ManageInvoice from "./components/ManageInvoice";
import CreateInvoice from "./components/CreateInvoice";
import ManageFinanceReport from "./components/ManageFinanceReport";

// Example components
import NotesExample from "./components/common/NotesExample";
import ButtonsExample from "./components/common/ButtonsExample";
import PageContainerExample from "./components/common/PageContainerExample";

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

        {/* <Route path="/finance/invoices" element={
          <ProtectedRoute>
            <Layout>
              <ManageInvoice />
            </Layout>
          </ProtectedRoute>
        } /> */}
        <Route path="/finance/invoices" element={
          <ProtectedRoute>
            <Layout>
              <ManageFinanceReport />
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
              <TaxAmendmentProjectsReport />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/projects/audit-advisory" element={
          <ProtectedRoute>
            <Layout>
              <AuditAdvisoryProjectsReport />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/projects/rdc" element={
          <ProtectedRoute>
            <Layout>
              <RDCProjectsReport />
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

        {/* Report Routes */}
        <Route path="/reports/erc-lead-report" element={
          <ProtectedRoute>
            <Layout>
              <ERCLeadReport />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Notes Example Page */}
        <Route path="/examples/notes" element={
          <ProtectedRoute>
            <Layout>
              <NotesExample />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/reports/stc-lead-report" element={
          <ProtectedRoute>
            <Layout>
              <STCLeadReport />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Buttons Example Page */}
        <Route path="/examples/buttons" element={
          <ProtectedRoute>
            <Layout>
              <ButtonsExample />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Page Container Example */}
        <Route path="/examples/page-container" element={
          <ProtectedRoute>
            <Layout>
              <PageContainerExample />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/reports/tax-amendment-lead-report" element={
          <ProtectedRoute>
            <Layout>
              <TaxAmendmentLeadReport />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/reports/audit-advisory-lead-report" element={
          <ProtectedRoute>
            <Layout>
              <AuditAdvisoryLeadReport />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/reports/rdc-lead-report" element={
          <ProtectedRoute>
            <Layout>
              <RDCLeadReport />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/reports/partnership-lead-report" element={
          <ProtectedRoute>
            <Layout>
              <PartnershipLeadReport />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/reports/advanced-reports" element={
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