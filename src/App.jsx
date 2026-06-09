import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerOrder from "./CustomerOrder";
import AdminDashboard from "./AdminDashboard";
import AdminOrders from "./AdminOrders";
import AdminReservations from "./AdminReservations";
import AdminMenus from "./AdminMenus";
import AdminKitchen from "./AdminKitchen";
import AdminAnalytics from "./AdminAnalytics";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import AdminTables from "./AdminTables";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerOrder />} />

        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedAdminRoute>
              <AdminOrders />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/reservations"
          element={
            <ProtectedAdminRoute>
              <AdminReservations />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/menus"
          element={
            <ProtectedAdminRoute>
              <AdminMenus />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/kitchen"
          element={
            <ProtectedAdminRoute>
              <AdminKitchen />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedAdminRoute>
              <AdminAnalytics />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/tables"
          element={
            <ProtectedAdminRoute>
              <AdminTables />
            </ProtectedAdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}