import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Contexts for theme and auth
import { MyContext } from '../../admin/context/themeContext/themeContext';
import { useAuth } from '../../admin/context/auth/authContext';

// Components
import ProtectedRoute from '../adminProtectedRoute/ProtectedRoute';
import LoginPage from '../../admin/pages/login/loginPage';
import Sidebar from '../../admin/components/slide/Sidebar';
import MainContent from '../../admin/components/mainContent/mainContent';
import EmployeeProfile from '../../admin/pages/employeeprofile/EmployeeProfilePage';
import AddProduct from '../../admin/pages/product/add/addProduct';
import ManageProduct from '../../admin/pages/product/manage/manageProducts';
import AddBanner from '../../admin/pages/banner/add/addBanner';
import ManageBanner from '../../admin/pages/banner/manage/manageBanners';
import AddVideos from '../../admin/pages/video/add/addVideo';
import ManageVideos from '../../admin/pages/video/manage/ManageVideos';
import AddRates from '../../admin/pages/rate/add/addRates';
import ManageRates from '../../admin/pages/rate/manage/manageRates';
import AddEmployee from '../../admin/pages/employee/add/AddEmployee';
import ManageEmployees from '../../admin/pages/employee/manage/ManageEmployees';
import Unauthorized from '../../admin/pages/unauthorized/Unauthorized';
import UserDetails from '../../admin/pages/dashboard/userDetails';
import NewAdminHeader from '../../admin/components/head/header';
import OrderStatusManagement from '../../admin/pages/order/orderStatus';
import { PendingOrdersPage, ShippedOrdersPage, DeliveredOrdersPage, CancelledOrdersPage, TotalRevenuePage, TodayRevenuePage, MonthlySalesPage } from '../../admin/pages/order/OrderPages';
import EstimationProductsPage from '../../admin/pages/product/manage/EstimationProductsPage';
import './AdminRoutes.css';
import OrderHistoryPage from '../../admin/pages/order/todayOrders';
import AddCategoryPage from '../../admin/pages/category/add/AddCategoryPage';
import ManageCategoriesPage from '../../admin/pages/category/manage/ManageCategoriesPage';

const AdminRoutes = () => {
    const { isSidebarOpen, setIsSidebarOpen, themeMode } = useContext(MyContext);
    const { authToken } = useAuth();
    const allowedRoles = ['ROLE_ADMIN', 'ROLE_EMPLOYEE']; // Only these roles can access protected admin pages

    // Toggle sidebar based on screen size
    useEffect(() => {
        const handleResize = () => {
            const isLargeScreen = window.innerWidth > 1024;
            setIsSidebarOpen(isLargeScreen);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setIsSidebarOpen]);

    // Apply current theme to body
    useEffect(() => {
        document.body.classList.remove('dark', 'light');
        document.body.classList.add(themeMode);
    }, [themeMode]);

    // If not logged in, redirect all admin paths to login
    if (!authToken) {
        return (
            <Routes>
                <Route path="login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/admin/login" replace />} />
            </Routes>
        );
    }

    // If logged in, render admin layout and routes
    return (
        <div className="app-layout">
            {/* Top admin header */}
            <NewAdminHeader
                toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                isSidebarOpen={isSidebarOpen}
            />

            {/* Sidebar and page content layout */}
            <div className="layout-body">
                <Sidebar
                    className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}
                    isOpen={isSidebarOpen}
                    toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                />

                <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <Routes>
                        {/* Protected admin routes */}
                        <Route path="/" element={<ProtectedRoute allowedRoles={allowedRoles}><MainContent /></ProtectedRoute>} />
                        <Route path="product/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddProduct /></ProtectedRoute>} />
                        <Route path="product/manage/:sno?" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageProduct /></ProtectedRoute>} />
                        <Route path="product/itemManage" element={<ProtectedRoute allowedRoles={allowedRoles}><EstimationProductsPage /></ProtectedRoute>} />
                        <Route path="banner/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddBanner /></ProtectedRoute>} />
                        <Route path="banner/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageBanner /></ProtectedRoute>} />
                        <Route path="category/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddCategoryPage /></ProtectedRoute>} />
                        <Route path="category/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageCategoriesPage /></ProtectedRoute>} />
                        <Route path="video/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddVideos /></ProtectedRoute>} />
                        <Route path="video/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageVideos /></ProtectedRoute>} />
                        <Route path="rates/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddRates /></ProtectedRoute>} />
                        <Route path="rates/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageRates /></ProtectedRoute>} />
                        <Route path="employee/add" element={<ProtectedRoute allowedRoles={allowedRoles}><AddEmployee /></ProtectedRoute>} />
                        <Route path="employee/manage" element={<ProtectedRoute allowedRoles={allowedRoles}><ManageEmployees /></ProtectedRoute>} />
                        <Route path="profile" element={<ProtectedRoute allowedRoles={allowedRoles}><EmployeeProfile /></ProtectedRoute>} />

                        {/* Open admin routes */}
                        <Route path="userDetails" element={<UserDetails />} />
                        <Route path="order/today" element={<OrderHistoryPage />} />

                        <Route path="order/status" element={<OrderStatusManagement />} />
                        <Route path="AllOrderPage" element={<OrderStatusManagement />} />
                        <Route path="pendingOrders" element={<PendingOrdersPage />} />
                        <Route path="deliveredOrders" element={<DeliveredOrdersPage />} />
                        <Route path="shippedOrders" element={<ShippedOrdersPage />} />
                        <Route path="cancelledOrders" element={<CancelledOrdersPage />} />
                        <Route path="totalRevenue" element={<TotalRevenuePage />} />
                        <Route path="todayRevenue" element={<TodayRevenuePage />} />
                        <Route path="monthlySales" element={<MonthlySalesPage />} />
                        <Route path="unauthorized" element={<Unauthorized />} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminRoutes;