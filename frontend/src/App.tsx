import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Products from './pages/Products';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import ShippingAddress from './pages/ShippingAddress';
import Payment from './pages/Payment';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import { useAuth } from './hooks/useAuth';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full blur-lg opacity-50 animate-pulse" />
          <div className="relative w-12 h-12 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Only show regular navbar if not on admin routes */}
      {!isAdminRoute && <Navbar />}
      
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={isAuthenticated ? <Products /> : <Navigate to="/" />} />
          <Route path="/product/:id" element={isAuthenticated ? <ProductDetails /> : <Navigate to="/" />} />

          {/* Auth Routes - Hidden if authenticated */}
          {!isAuthenticated && (
            <>
              <Route path="/signup" element={<Signup />} />
            </>
          )}

          {/* Protected Routes */}
          {isAuthenticated && (
            <>
              <Route path="/cart" element={<Cart />} />
              <Route path="/shipping-address" element={<ShippingAddress />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-failed" element={<PaymentFailed />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/add-product" element={<AddProduct />} />
              <Route path="/admin/edit-product/:id" element={<EditProduct />} />
            </>
          )}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      {/* Only show footer if not on admin routes */}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
};

export default App;

