import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    FaBox,
    FaImage,
    FaTag,
    FaVideo,
    FaTachometerAlt,
    FaDollarSign,
    FaUserCircle,
    FaSignOutAlt,
    FaClipboardList
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { MyContext } from '../../context/themeContext/themeContext';
import './Sidebar.css';
import { getPageTitle } from '../../../utils/pageTitle/getPageTitle';
import RoleBasedSection from '../common/RoleBasedSection';
import MenuItem from '../common/MenuItem';
import { useUserProfile } from '../../hooks/profile/useUserProfile';
import { useAuth } from '../../context/auth/authContext';
import { debounce } from 'lodash';

const menuItems = [
    {
        title: 'Dashboard',
        icon: <FaTachometerAlt className="section-icon" />,
        path: '/admin/dashboard',
    },
    {
        title: 'Orders',
        icon: <FaClipboardList  className="section-icon" />,
        submenu: [
            { title: 'Today Orders', path: '/admin/order/today' },
            { title: 'Order Status', path: '/admin/order/status' },
        ],
    },
    {
        title: 'Product',
        icon: <FaBox className="section-icon" />,
        submenu: [
            { title: 'Add Product', path: '/admin/product/add' },
            { title: 'Manage Products', path: '/admin/product/manage' },
            { title: 'Manage ALLProducts', path: '/admin/product/itemManage' },
        ],
    },
    {
        title: 'Banner',
        icon: <FaImage className="section-icon" />,
        submenu: [
            { title: 'Add Banner', path: '/admin/banner/add' },
            { title: 'Manage Banners', path: '/admin/banner/manage' },
        ],
    },
    {
        title: 'Category',
        icon: <FaTag className="section-icon" />,
        submenu: [
            { title: 'Add Category', path: '/admin/category/add' },
            { title: 'Manage Categories', path: '/admin/category/manage' },
        ],
    },
    {
        title: 'Video',
        icon: <FaVideo className="section-icon" />,
        submenu: [
            { title: 'Add Video', path: '/admin/video/add' },
            { title: 'Manage Videos', path: '/admin/video/manage' },
        ],
    },
    {
        title: 'Rates',
        icon: <FaDollarSign className="section-icon" />,
        submenu: [
            { title: 'Add Rates', path: '/admin/rates/add' },
            { title: 'Manage Rates', path: '/admin/rates/manage' },
        ],
    },
];

const employeeMenu = {
    title: 'Employee',
    icon: <FaBox className="section-icon" />,
    submenu: [
        { title: 'Add Employee', path: '/admin/employee/add' },
        { title: 'Manage Employees', path: '/admin/employee/manage' },
    ],
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { themeMode } = useContext(MyContext);
    const { data: user, isLoading } = useUserProfile();
    const { logout } = useAuth();
    const [expanded, setExpanded] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [currentPageTitle, setCurrentPageTitle] = useState('Admin Dashboard');

    useEffect(() => {
        const handleResize = debounce(() => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
        }, 100);

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            handleResize.cancel();
        };
    }, []);

    useEffect(() => {
        const initialExpanded = {};
        menuItems.forEach((item) => {
            if (item.submenu) {
                initialExpanded[item.title.toLowerCase()] = item.submenu.some(
                    (subItem) => subItem.path === location.pathname
                );
            }
        });
        setExpanded(initialExpanded);
    }, [location.pathname]);

    useEffect(() => {
        const title = getPageTitle(location.pathname, menuItems);
        setCurrentPageTitle(title);
    }, [location.pathname]);

    const toggleSection = (section) => {
        setExpanded((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleLinkClick = () => {
        if (isMobile) {
            toggleSidebar();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const sidebarVariants = {
        open: {
            x: 0,
            width: isMobile ? 'var(--sidebar-width-mobile)' : 'var(--sidebar-width)',
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 300,
            },
        },
        closed: {
            x: isMobile ? '-100%' : 0,
            width: isMobile ? 0 : 'var(--sidebar-collapsed-width)',
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 300,
            },
        },
    };

    const itemVariants = {
        open: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.2 },
        },
        closed: {
            opacity: 0,
            x: -20,
            transition: { duration: 0.1 },
        },
    };

    if (isLoading) {
        return <div className="sidebar-loading">Loading...</div>;
    }

    return (
        <>
            <motion.aside
                className={`sidebar ${isOpen ? 'open' : 'closed'} ${themeMode}`}
                initial="closed"
                animate={isOpen ? 'open' : 'closed'}
                variants={sidebarVariants}
                role="navigation"
                aria-label="Admin Navigation"
            >
                <div className="sidebar-content">
                    <div className="sidebar-header">
                        <div className="sidebar-brand">
                            <NavLink to="/admin" className="sidebar-title">
                                {currentPageTitle && (
                                    <div className="current-page-indicator">{currentPageTitle}</div>
                                )}
                            </NavLink>
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        <div className="menu-scroll-container">
                            {menuItems.map((item) => (
                                <MenuItem
                                    key={item.title}
                                    item={item}
                                    isExpanded={expanded[item.title.toLowerCase()]}
                                    onToggle={toggleSection}
                                    onClick={handleLinkClick}
                                    variants={itemVariants}
                                    isOpen={isOpen}
                                />
                            ))}
                            <RoleBasedSection allowedRoles={['ROLE_ADMIN']}>
                                <MenuItem
                                    item={employeeMenu}
                                    isExpanded={expanded['employee']}
                                    onToggle={toggleSection}
                                    onClick={handleLinkClick}
                                    variants={itemVariants}
                                    isOpen={isOpen}
                                />
                            </RoleBasedSection>
                        </div>
                    </nav>

                    <div className="sidebar-footer">
                        <RoleBasedSection allowedRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']}>
                            <div className="user-profile">
                                <div className="user-avatar">
                                    <FaUserCircle size={26} />
                                </div>
                                <div className="user-info">
                                    <div className="user-name">{user?.username || 'User'}</div>
                                    <div className="user-role">{user?.role || 'Administrator'}</div>
                                </div>
                            </div>
                            <button
                                className="logout-button"
                                onClick={handleLogout}
                                aria-label="Logout"
                            >
                                <FaSignOutAlt />
                                {isOpen && <span>Logout</span>}
                            </button>
                        </RoleBasedSection>
                    </div>
                </div>
            </motion.aside>

            <AnimatePresence>
                {isOpen && isMobile && (
                    <motion.div
                        className="sidebar-overlay"
                        onClick={toggleSidebar}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;