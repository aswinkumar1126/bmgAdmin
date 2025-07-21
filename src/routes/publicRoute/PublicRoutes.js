// src/publicRoute/PublicRoutes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout & Pages
import LayoutWrapper from '../../public/layout/layoutWrapper/LayoutWrapper';
import Home from '../../public/pages/home/Home';
import ProductDetails from '../../public/pages/product/productDetails';
import AllProducts from '../../public/pages/allProducts/AllProducts';
import About from '../../public/pages/about/About';
import WhyUs from '../../public/pages/whyUs/WhyUs';
import Gallery from '../../public/pages/gallery/Gallery';
import AllVideos from '../../public/pages/allVideos/AllVideos';
import Contact from '../../public/pages/contact/Contact';
import Login from '../../public/pages/login/Login';
import CartPage from '../../public/pages/cart/CartPage';
import UserProfile from '../../public/pages/profile/userProfile/UserProfile';
import WishlistItem from '../../public/pages/WishlistPage/WishlistPage';
import ForgotPasswordPage from '../../public/pages/forget-reset/ForgotPasswordPage';
import ResetPasswordPage from '../../public/pages/forget-reset/ResetPasswordPage';
import OrderPage from '../../public/pages/order/OrderPage';
import PaymentPage from '../../public/pages/payment/PaymentPage';
import VerifyPaymentResult from '../../public/pages/payment/VerifyPaymentResult';
import PaymentCallback from '../../public/pages/payment/PaymentCallback';

// Route guard for authenticated users
import UserPrivateRoute from '../protecteRoute/UserProtecteRoute';
import PrivacyPolicy from '../../public/PrivacyPolicy/PrivacyPolicy';
import TermsConditions from '../../public/pages/TermsConditions/TermsConditions';
import RefundPolicy from '../../public/pages/RefundPolicy/RefundPolicy';
import CancellationReturnPolicy from '../../public/pages/CancellationReturnPolicy/CancellationReturnPolicy';
import DeliveryShippingPolicy from '../../public/pages/DeliveryShippingPolicy/DeliveryShippingPolicy';
import NotFound from '../../public/pages/notFound/NotFound';
import EnhancedProductDisplay from '../../public/pages/search/SearchResultsPage';
import ProductsPage from '../../public/pages/categoryProducts.js/ProductsPage';

const PublicRoutes = () => {
    return (
        // Wraps all public routes with common layout (e.g., header, footer)
       
            <Routes>
                {/* Publicly accessible routes */}
                <Route path="/" element={<LayoutWrapper />}>
                    <Route index element={<Home />} />
                    <Route path="home" element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="products" element={<AllProducts />} />
                    <Route path="about" element={<About />} />
                    <Route path="why-us" element={<WhyUs />} />
                    <Route path="gallery" element={<Gallery />} />
                    <Route path="videos" element={<AllVideos />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="reset-password" element={<ResetPasswordPage />} />
                    <Route path="search" element={<EnhancedProductDisplay />} />

                    {/* Protected */}
                    <Route path="product/:sno" element={<UserPrivateRoute><ProductDetails /></UserPrivateRoute>} />
                    <Route path="/:category/:itemName" element={<ProductsPage />} />
                    <Route path="cart" element={<UserPrivateRoute><CartPage /></UserPrivateRoute>} />
                    <Route path="wishlist" element={<UserPrivateRoute><WishlistItem /></UserPrivateRoute>} />
                    <Route path="user/profile" element={<UserPrivateRoute><UserProfile /></UserPrivateRoute>} />
                    <Route path="order" element={<UserPrivateRoute><OrderPage /></UserPrivateRoute>} />
                    <Route path="payment/:orderId" element={<UserPrivateRoute><PaymentPage /></UserPrivateRoute>} />
                    <Route path="payment/callback/:orderId" element={<PaymentCallback />} />

                    {/* Policies */}
                    <Route path="privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="delivery-shipping" element={<DeliveryShippingPolicy />} />
                    <Route path="cancel-return" element={<CancellationReturnPolicy />} />
                    <Route path="refund" element={<RefundPolicy />} />
                    <Route path="terms-condition" element={<TermsConditions />} />
                    {/* 404 Not Found */}
                    <Route path="*" element={<NotFound />} />
                </Route>

            </Routes>
      
    );
};

export default PublicRoutes;
