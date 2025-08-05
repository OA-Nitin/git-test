import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// CSS imports
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./assets/css/load-styles.css";
import "./assets/css/metisMenu.css";
import "./assets/css/themify-icons.css";
import "./assets/css/style.css";
import "./assets/css/header-dropdown.css";

// JS imports
//adding temporary comment
import "./assets/js/metisMenu.js";

// Core components
import Login from "./Login";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import MyProfile from "./components/MyProfile";
import CreateUser from "./components/CreateUser";

// Lead components
import LeadReport from "./components/LeadReport";
import LeadDetail from "./components/LeadDetail";

// Project components
import AllProjectsReport from "./components/AllProjectsReport";
import ProjectDetail from "./components/ProjectDetail";

// Finance components
//import ManageInvoice from "./components/ManageInvoice";
import CreateInvoice from "./components/CreateInvoice";
import ManageFinanceReport from "./components/ManageFinanceReport";

// Opportunities components
import OpportunityReport from "./components/OpportunityReport";
// Temporarily commented out unused imports
// import ERCOpportunities from "./components/ERCOpportunities";
// import AuditAdvisoryOpportunities from "./components/AuditAdvisoryOpportunities";

// Example components
import NotesExample from "./components/common/NotesExample";
import ButtonsExample from "./components/common/ButtonsExample";
import PageContainerExample from "./components/common/PageContainerExample";

import CreateContact from "./components/CreateContact";

/****** Code by Sanjay ********/
import InvoiceReport from "./components/invoice/InvoiceReport";
import InvoiceCreate from "./components/invoice/InvoiceCreate";
import InvoiceView from "./components/invoice/view";
import InvoiceEdit from "./components/invoice/EditInvoice.jsx";

/****** Code By Ashish ******/
import PastDueInvoiceReport from "./components/past-due-invoice/PastDueInvoiceReport";
import InvoiceSettings from "./components/invoice-settings/InvoiceSettings";

// Route wrapper component with authentication check
const ProtectedRoute = ({ children }) => {
  // Check if user is logged in by looking for user data in localStorage
  const isAuthenticated = localStorage.getItem("user") !== null;

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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-user"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateUser />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Generic Lead Report Route */}
        <Route
          path="/reports/leads/:product"
          element={
            <ProtectedRoute>
              <Layout>
                <LeadReport />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Specific Lead Report Routes */}
        <Route
          path="/reports/erc-lead-report"
          element={
            <ProtectedRoute>
              <Layout>
                <LeadReport product="erc" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/stc-lead-report"
          element={
            <ProtectedRoute>
              <Layout>
                <LeadReport product="stc" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/tax-amendment-lead-report"
          element={
            <ProtectedRoute>
              <Layout>
                <LeadReport product="tax-amendment" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/audit-advisory-lead-report"
          element={
            <ProtectedRoute>
              <Layout>
                <LeadReport product="audit-advisory" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/rdc-lead-report"
          element={
            <ProtectedRoute>
              <Layout>
                <LeadReport product="rdc" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/partnership-lead-report"
          element={
            <ProtectedRoute>
              <Layout>
                <LeadReport product="partnership" />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/advanced-reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/projects/:product"
          element={
            <ProtectedRoute>
              <Layout>
                <AllProjectsReport />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Projects Routes - Legacy format */}
        <Route
          path="/projects/all"
          element={
            <ProtectedRoute>
              <Layout>
                <AllProjectsReport />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:product"
          element={
            <ProtectedRoute>
              <Layout>
                <AllProjectsReport />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/send-lead"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-sales-user"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/affiliate-form"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <Layout>
                <MyProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* <Route path="/finance/invoices" element={
          <ProtectedRoute>
            <Layout>
              <ManageInvoice />
            </Layout>
          </ProtectedRoute>
        } /> */}
        <Route
          path="/finance/invoices"
          element={
            <ProtectedRoute>
              <Layout>
                <ManageFinanceReport />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/finance/create-invoice"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateInvoice />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Lead Detail Page */}
        <Route
          path="/lead-detail/:leadId"
          element={
            <ProtectedRoute>
              <Layout>
                <LeadDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Project Detail Page */}
        <Route
          path="/project-detail/:projectId"
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Project Settings Route */}

        <Route
          path="/projects/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Notes Example Page */}
        <Route
          path="/examples/notes"
          element={
            <ProtectedRoute>
              <Layout>
                <NotesExample />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Buttons Example Page */}
        <Route
          path="/examples/buttons"
          element={
            <ProtectedRoute>
              <Layout>
                <ButtonsExample />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/create-contact" element={
          <ProtectedRoute>
            <Layout>
              <CreateContact />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Page Container Example */}
        <Route
          path="/examples/page-container"
          element={
            <ProtectedRoute>
              <Layout>
                <PageContainerExample />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Opportunities Routes */}
        {/* Generic Opportunity Report Route with product parameter */}
        <Route path="/reports/opportunities/:product" element={
          <ProtectedRoute>
            <Layout>
              <OpportunityReport />
            </Layout>
          </ProtectedRoute>
        } />

        {/* All Opportunities Report */}
        <Route path="/reports/opportunities/all" element={
          <ProtectedRoute>
            <Layout>
              <OpportunityReport />
            </Layout>
          </ProtectedRoute>
        } />
         {/* Invoice Report */}
        <Route path="/invoice/report/" element={
          <ProtectedRoute>
            <Layout>
              <InvoiceReport />
            </Layout>
          </ProtectedRoute>
        } />
         <Route path="/invoice/create-invoice/" element={
          <ProtectedRoute>
            <Layout>
              <InvoiceCreate />
            </Layout>
          </ProtectedRoute>
        } />
        <Route
          path="/invoices/view/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <InvoiceView />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/edit-invoice/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <InvoiceEdit />
              </Layout>
            </ProtectedRoute>
          }
        />
      <Route
          path="/past-due-invoice/report"
          element={
            <ProtectedRoute>
              <Layout>
                <PastDueInvoiceReport />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/invoice/settings" element={
          <ProtectedRoute>
            <Layout>
              <InvoiceSettings />
            </Layout>
          </ProtectedRoute>
          } />
      </Routes>
    </Router>
  );
};

export default App;
