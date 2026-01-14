import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import AdminRoute from './components/auth/AdminRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import ClientLayout from './layouts/ClientLayout'
import AccountLayout from './pages/client/account/AccountLayout'
import DashboardHome from './pages/DashboardHome'
import ProductsPage from './pages/ProductsPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import CustomersPage from './pages/CustomersPage'
import InvoicesPage from './pages/InvoicesPage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage from './pages/client/account/ProfilePage'
import MyOrdersPage from './pages/client/account/MyOrdersPage'
import ChangePasswordPage from './pages/client/account/ChangePasswordPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#fff',
                                color: '#374151',
                                borderRadius: '12px',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#10b981',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                    <Routes>
                        {/* 1. Public Auth Routes (No Layout) */}
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/register" element={<AuthPage />} />

                        {/* 2. Client Routes (Customer Shopping Interface) */}
                        <Route element={<ClientLayout />}>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/shop" element={<ShopPage />} />
                            <Route path="/product/:id" element={<ProductDetailPage />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/checkout" element={<CheckoutPage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/contact" element={<ContactPage />} />

                            {/* Account Routes - Nested under ClientLayout */}
                            <Route path="account" element={<AccountLayout />}>
                                {/* Redirect /account to /account/profile */}
                                <Route index element={<Navigate to="profile" replace />} />
                                <Route path="profile" element={<ProfilePage />} />
                                <Route path="orders" element={<MyOrdersPage />} />
                                <Route path="password" element={<ChangePasswordPage />} />
                            </Route>
                        </Route>

                        {/* 3. Admin Routes (Protected Management Interface) */}
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <DashboardLayout />
                                </AdminRoute>
                            }
                        >
                            {/* Auto redirect /admin to /admin/dashboard */}
                            <Route index element={<Navigate to="dashboard" replace />} />

                            <Route path="dashboard" element={<DashboardHome />} />
                            <Route path="products" element={<ProductsPage />} />
                            <Route path="orders" element={<OrdersPage />} />
                            <Route path="orders/:id" element={<OrderDetailPage />} />
                            <Route path="customers" element={<CustomersPage />} />
                            <Route path="invoices" element={<InvoicesPage />} />
                            <Route path="invoices/:id" element={<InvoiceDetailPage />} />
                            <Route path="reports" element={<ReportsPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                        </Route>

                        {/* 4. Catch All - 404 Redirect */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
