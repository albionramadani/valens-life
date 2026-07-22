import "@/valens-admin/admin.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/valens-admin/hooks/useAuth";
import AdminGuard from "@/valens-admin/components/AdminGuard";
import AdminLayout from "@/valens-admin/components/AdminLayout";

import AdminLogin from "@/valens-admin/pages/Login";
import ResetPassword from "@/valens-admin/pages/ResetPassword";
import MfaSetup from "@/valens-admin/pages/MfaSetup";
import MfaChallenge from "@/valens-admin/pages/MfaChallenge";
import Dashboard from "@/valens-admin/pages/Dashboard";
import Products from "@/valens-admin/pages/Products";
import Orders from "@/valens-admin/pages/Orders";
import Customers from "@/valens-admin/pages/Customers";
import Categories from "@/valens-admin/pages/Categories";
import Collections from "@/valens-admin/pages/Collections";
import Inventory from "@/valens-admin/pages/Inventory";
import Offers from "@/valens-admin/pages/Offers";
import Coupons from "@/valens-admin/pages/Coupons";
import Payments from "@/valens-admin/pages/Payments";
import BankSettings from "@/valens-admin/pages/BankSettings";
import Shipping from "@/valens-admin/pages/Shipping";
import Reviews from "@/valens-admin/pages/Reviews";
import Analytics from "@/valens-admin/pages/Analytics";
import CmsBlocks from "@/valens-admin/pages/CmsBlocks";
import Notifications from "@/valens-admin/pages/Notifications";
import UsersRoles from "@/valens-admin/pages/UsersRoles";
import OdooIntegration from "@/valens-admin/pages/OdooIntegration";
import FeedSettings from "@/valens-admin/pages/FeedSettings";
import Settings from "@/valens-admin/pages/Settings";
import HomepageManager from "@/valens-admin/pages/HomepageManager";
import Sessions from "@/valens-admin/pages/Sessions";
import Account from "@/valens-admin/pages/Account";

export default function AdminApp() {
  return (
    <AuthProvider>
      <div className="admin-scope">
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
          <Route path="/admin/mfa-setup" element={<MfaSetup />} />
          <Route path="/admin/mfa-challenge" element={<MfaChallenge />} />
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="categories" element={<Categories />} />
            <Route path="collections" element={<Collections />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="offers" element={<Offers />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="payments" element={<Payments />} />
            <Route path="bank-settings" element={<BankSettings />} />
            <Route path="shipping" element={<Shipping />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="cms" element={<CmsBlocks />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="users" element={<UsersRoles />} />
            <Route path="odoo" element={<OdooIntegration />} />
            <Route path="feed" element={<FeedSettings />} />
            <Route path="settings" element={<Settings />} />
            <Route path="homepage" element={<HomepageManager />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="account" element={<Account />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </div>
    </AuthProvider>
  );
}
