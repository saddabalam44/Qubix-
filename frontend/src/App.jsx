import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import SalesHistory from './pages/SalesHistory';
import Login from './pages/Login';
import Shopkeepers from './pages/Shopkeepers';
import Suppliers from './pages/Suppliers';
import SupplierDashboard from './pages/SupplierDashboard';
import SupplierRegistration from './pages/SupplierRegistration';
import SupplierApprovals from './pages/SupplierApprovals';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Login role="admin" />} />
          <Route path="/supplier" element={<Login role="supplier" />} />
          <Route path="/shopkeepar" element={<Login role="shopkeeper" />} />
          <Route path="/signup" element={<SupplierRegistration />} />
          <Route path="/supplier-register" element={<SupplierRegistration />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/inventory" element={
                          <ProtectedRoute requireAdmin={true}><Inventory /></ProtectedRoute>
                      } />
                      <Route path="/billing" element={<Billing />} />
                      <Route path="/history" element={
                          <ProtectedRoute requireAdmin={true}><SalesHistory /></ProtectedRoute>
                      } />
                      <Route path="shopkeepers" element={
                          <ProtectedRoute requireAdmin={true}><Shopkeepers /></ProtectedRoute>
                      } />
                      <Route path="suppliers" element={
                          <ProtectedRoute requireAdmin={true}><Suppliers /></ProtectedRoute>
                      } />
                      <Route path="/supplier-approvals" element={
                          <ProtectedRoute requireAdmin={true}><SupplierApprovals /></ProtectedRoute>
                      } />
                      <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
                    </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
