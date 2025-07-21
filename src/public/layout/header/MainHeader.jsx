import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaHeart, FaUserCircle, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import Logo from '../../assets/logo/weblogo.png';
import Search from '../../components/search/Search';
import RatesCard from '../../components/rateCard/RatesCard';
import './Header.css';

const MainHeader = ({
    isMobile,
    isAuthenticated,
    username,
    wishlistCount,
    cartCount,
    handleProfileClick,
    isProfileMenuOpen,
    setIsProfileMenuOpen, // Add this
    handleLogout,
    toggleMobileMenu,
    isMobileMenuOpen
}) => {
    return (
        <div className="public-main-header">
            <div className="public-main-header-content">
                <div className="public-header-left">
                    <motion.div
                        className="public-logo-container"
                        whileHover={{ scale: isMobile ? 1 : 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <Link to="/" aria-label="Home">
                            <motion.img
                                src={Logo}
                                alt="BMG Jewellers Logo"
                                loading="lazy"
                                className="public-logo-img"
                                whileHover={{ rotate: isMobile ? 0 : 5 }}
                                transition={{ type: 'spring', damping: 15 }}
                            />
                        </Link>
                        <span className="public-logo-text">
                            <pre>BMG Jewellers{'\n'}<span className="public-sub-logotext">Private Limited</span></pre>
                        </span>
                    </motion.div>
                    {!isMobile && (
                        <motion.div className="public-header-rates-container">
                            <RatesCard isMobile={isMobile} />
                        </motion.div>
                    )}
                </div>

                {!isMobile && (
                    <div className="public-header-middle">
                        <div className="public-search-bar-wrapper">
                            <Search />
                        </div>
                    </div>
                )}

                <div className="public-header-right">
                    {isAuthenticated && (
                        <>
                            <motion.div
                                className="public-wishlist-container"
                                whileHover={{ scale: isMobile ? 1 : 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <NavLink
                                    to="/wishlist"
                                    className="public-wishlist-button"
                                    aria-label="Wishlist"
                                >
                                    <motion.div
                                        animate={isMobile ? {} : { scale: [1, 1.1, 1] }}
                                        transition={{ repeat: isMobile ? 0 : Infinity, duration: 2 }}
                                    >
                                        <FaHeart className="public-wishlist-icon" />
                                    </motion.div>
                                    {wishlistCount > 0 && (
                                        <motion.span
                                            className="public-wishlist-badge"
                                            animate={isMobile ? {} : { scale: [1, 1.2, 1] }}
                                            transition={{ repeat: isMobile ? 0 : Infinity, duration: 2 }}
                                        >
                                            {wishlistCount}
                                        </motion.span>
                                    )}
                                </NavLink>
                            </motion.div>

                            <motion.div
                                className="public-cart-container"
                                whileHover={{ scale: isMobile ? 1 : 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <NavLink
                                    to="/cart"
                                    className="public-cart-button"
                                    aria-label="Shopping Cart"
                                >
                                    <motion.div
                                        animate={isMobile ? {} : { rotate: [0, 10, -10, 0] }}
                                        transition={{ repeat: isMobile ? 0 : Infinity, repeatDelay: 5, duration: 2 }}
                                    >
                                        <FaShoppingCart className="public-cart-icon" />
                                    </motion.div>
                                    {cartCount > 0 && (
                                        <motion.span
                                            className="public-cart-badge"
                                            animate={isMobile ? {} : { scale: [1, 1.2, 1] }}
                                            transition={{ repeat: isMobile ? 0 : Infinity, duration: 2 }}
                                        >
                                            {cartCount}
                                        </motion.span>
                                    )}
                                </NavLink>
                            </motion.div>
                        </>
                    )}

                    <motion.div
                        className="public-profile-icon-wrapper"
                        whileHover={{ scale: isMobile ? 1 : 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <button
                            className="public-profile-icon-button"
                            onClick={handleProfileClick}
                            aria-label="User profile menu"
                            aria-expanded={isProfileMenuOpen}
                            aria-haspopup="true"
                        >
                            <FaUserCircle className="public-profile-icon" />
                            <span>{username || 'Guest'}</span>
                        </button>
                        {isAuthenticated && (
                            <AnimatePresence>
                                {isProfileMenuOpen && (
                                    <motion.ul
                                        className="public-profile-menu"
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                        aria-label="Profile options"
                                        role="menu"
                                    >
                                        <motion.li
                                            whileHover={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
                                            role="none"
                                        >
                                            <NavLink
                                                to="/user/profile"
                                                className="public-dropdown-link"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                role="menuitem"
                                            >
                                                <FaUserCircle /> Profile
                                            </NavLink>
                                        </motion.li>
                                        <motion.li
                                            whileHover={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
                                            role="none"
                                        >
                                            <button
                                                className="public-dropdown-link"
                                                onClick={handleLogout}
                                                role="menuitem"
                                            >
                                                <FaSignOutAlt className="public-inline-icon" /> Logout
                                            </button>
                                        </motion.li>
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                        )}
                    </motion.div>
                    <button
                        className="public-mobile-menu-toggle"
                        onClick={toggleMobileMenu}
                        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="public-main-navigation"
                    >
                        {isMobileMenuOpen ? <FaTimes className="public-menu-icon" /> : <FaBars className="public-menu-icon" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainHeader;