import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import DashboardLayout from "./components/DashboardLayout";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DonorDashboard from "./pages/donor/DonorDashboard";
import CreateListing from "./pages/donor/CreateListing";
import CharityDashboard from "./pages/charity/CharityDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

const Unauthorized = () => (
  <div className="p-8 text-2xl font-bold text-red-600">Unauthorized Access</div>
);

const Layout = ({ children }) => (
  <div>
    <Navbar />
    {children}
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Landing /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/unauthorized" element={<Layout><Unauthorized /></Layout>} />

          <Route path="/donor/dashboard" element={
            <ProtectedRoute roles={["donor"]}>
              <DashboardLayout><DonorDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/donor/create-listing" element={
            <ProtectedRoute roles={["donor"]}>
              <DashboardLayout><CreateListing /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/donor/edit-listing/:id" element={
            <ProtectedRoute roles={["donor"]}>
              <DashboardLayout><CreateListing /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/charity/dashboard" element={
            <ProtectedRoute roles={["charity"]}>
              <DashboardLayout><CharityDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout><AdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
