import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './assets/css/load-styles.css';
import './assets/css/metisMenu.css';
import './assets/css/themify-icons.css';
import './assets/css/style.css';
import Login from "./Login";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import CreateUser from "./components/CreateUser";
import Contacts from "./components/Contacts";
import ContactSettings from "./components/ContactSettings";
import LeadReport from "./components/LeadReport";
import ManageInvoice from "./components/ManageInvoice";
import CreateInvoice from "./components/CreateInvoice";

// Route wrapper component - no authentication check
const ProtectedRoute = ({ children }) => {
  // Always render the children components without authentication check
  return children;
};

const App = () => {
  return (
    <Router>
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

        <Route path="/contacts" element={
          <ProtectedRoute>
            <Layout>
              <Contacts />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/contact-settings" element={
          <ProtectedRoute>
            <Layout>
              <ContactSettings />
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
              <Dashboard />
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

      </Routes>
    </Router>
  );
};

export default App;