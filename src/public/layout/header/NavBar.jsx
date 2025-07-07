import React, { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import { useCategories } from '../../hook/category/useCategoryQuery';
import { useCategoryProducts } from '../../hook/category/useCategoryProducts';
import Search from '../../components/search/Search';
import RatesCard from '../../components/rateCard/RatesCard';
import './Header.css';

const formatForURL = (str) => str.replace(/_/g, '-').replace(/\s+/g, '-').toLowerCase();
const formatForDisplay = (str) => str.replace(/_/g, ' ').toUpperCase();
const formatForCategoryDisplay = (str) => str.replace(/_/g, ' ').toLowerCase();

const NavBar = ({
    isMobile,
    isMobileMenuOpen,
    activeDropdown,
    toggleDropdown,
    closeMobileMenu,
    setActiveDropdown,
    navRef,
    dropdownRef,
    location,
    className,
}) => {
    const [activeSubmenu, setActiveSubmenu] = useState(null);

    // Static nav items - removed "ALL PRODUCTS" as requested
    const staticNavItems = [
        { name: 'HOME', path: '/home' },
        { name: 'VIDEOS', path: '/videos' },
    ];

    // Fetch categories
    const { data: categories, isLoading: isCategoriesLoading } = useCategories();

    // Format categories for display and URLs
    const formattedCategories = useMemo(() =>
        categories?.map(category => category.replace(/_/g, ' ')) || [],
        [categories]
    );

    // Fetch products for all categories
    const { data: categoryProducts, isLoading: isProductsLoading } = useCategoryProducts(formattedCategories);

    // Combine static and dynamic nav items - categories will appear between HOME and VIDEOS
    const navItems = [
        staticNavItems[0], // HOME
        ...(categories?.map((category) => ({
            name: formatForDisplay(category),
            path: `/products/?catname=${formatForCategoryDisplay(category)}`,
            submenu: true,
            categoryKey: category.replace(/_/g, ' ')
        })) || []),
        staticNavItems[1] // VIDEOS
    ];

    const handleItemClick = (e, item) => {
        if (item.submenu) {
            if (isMobile) {
                if (e.target.closest('.public-dropdown-arrow') || activeDropdown === item.name) {
                    e.preventDefault();
                    toggleDropdown(item.name);
                } else {
                    closeMobileMenu();
                }
            } else {
                e.preventDefault();
                toggleDropdown(item.name);
            }
        } else {
            closeMobileMenu();
        }
    };

    const toggleSubmenu = (categoryName) => {
        setActiveSubmenu((prev) => (prev === categoryName ? null : categoryName));
    };

    const isNavItemActive = (navItem) => {
        if (navItem.submenu) {
            return location.pathname.startsWith(navItem.path);
        }
        return location.pathname === navItem.path;
    };

    // Function to count product variants and get unique items
    const getUniqueItemsWithCounts = (items) => {
        const countMap = {};
        const uniqueItems = [];

        items?.forEach(item => {
            if (!countMap[item.ITEMNAME]) {
                countMap[item.ITEMNAME] = {
                    count: 1,
                    firstItem: item
                };
                uniqueItems.push(item);
            } else {
                countMap[item.ITEMNAME].count++;
            }
        });

        return { uniqueItems, countMap };
    };

    return (
        <motion.nav
            id="public-main-navigation"
            className={`public-nav-links ${isMobileMenuOpen ? 'public-active' : ''} ${className}`}
            aria-label="Main navigation"
            ref={navRef}
            initial={{ x: isMobile ? '-100%' : 0 }}
            animate={{ x: isMobile && isMobileMenuOpen ? 0 : isMobile ? '-100%' : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
            {isMobile && (
                <>
                    <div className="public-mobile-search-container">
                        <Search onSearchComplete={closeMobileMenu} />
                    </div>
                    <div className="public-mobile-rates-container">
                        <RatesCard isMobile={isMobile} />
                    </div>
                </>
            )}
            <ul className="public-nav-list">
                {navItems.map((navItem) => {
                    const items = navItem.submenu
                        ? categoryProducts?.[navItem.categoryKey] || []
                        : null;

                    const { uniqueItems, countMap } = getUniqueItemsWithCounts(items);

                    return (
                        <li
                            key={navItem.name}
                            className={`public-nav-item ${activeDropdown === navItem.name ? 'public-active-dropdown' : ''}`}
                            onMouseEnter={() => !isMobile && navItem.submenu && setActiveDropdown(navItem.name)}
                            onMouseLeave={() => !isMobile && setActiveDropdown(null)}
                        >
                            <NavLink
                                to={navItem.path}
                                end={!navItem.submenu}
                                onClick={(e) => handleItemClick(e, navItem)}
                                className={isNavItemActive(navItem) ? 'public-active-nav-link' : ''}
                                aria-haspopup={navItem.submenu ? 'true' : 'false'}
                                aria-expanded={activeDropdown === navItem.name}
                            >
                                {navItem.name}
                                {navItem.submenu && <FaChevronDown className="public-dropdown-arrow" />}
                                <span className="public-nav-hover-indicator"></span>
                            </NavLink>

                            {navItem.submenu && (
                                <div
                                    className="public-dropdown-container"
                                    ref={dropdownRef}
                                    onMouseEnter={() => !isMobile && setActiveDropdown(navItem.name)}
                                    onMouseLeave={() => !isMobile && setActiveDropdown(null)}
                                >
                                    <AnimatePresence>
                                        {activeDropdown === navItem.name && (
                                            <motion.div
                                                className="public-dropdown-modal"
                                                initial={{ opacity: 0, y: isMobile ? 0 : -20, scale: isMobile ? 1 : 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: isMobile ? 0 : -20, scale: isMobile ? 1 : 0.95 }}
                                                transition={{
                                                    duration: 0.4,
                                                    ease: [0.4, 0.0, 0.2, 1],
                                                    type: 'spring',
                                                    damping: 25,
                                                    stiffness: 200,
                                                }}
                                                role="dialog"
                                                aria-label={`${navItem.name} category menu`}
                                            >
                                                <div className="public-dropdown-content">
                                                    <motion.div
                                                        className="public-dropdown-categories"
                                                        initial={{ opacity: 0, x: isMobile ? 0 : -30 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.15, duration: 0.4 }}
                                                    >
                                                        {isProductsLoading ? (
                                                            <motion.div
                                                                className="public-dropdown-loading"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                <div className="public-loading-spinner"></div>
                                                                <span>Loading items...</span>
                                                            </motion.div>
                                                        ) : !uniqueItems || uniqueItems.length === 0 ? (
                                                            <motion.div
                                                                className="public-dropdown-empty"
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                No items available
                                                            </motion.div>
                                                        ) : (
                                                            <>
                                                                <motion.div
                                                                    className="public-dropdown-category-group"
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
                                                                >
                                                                    <h4
                                                                        className="public-dropdown-category-title"
                                                                        onClick={() => isMobile && toggleSubmenu(navItem.name)}
                                                                    >
                                                                        {navItem.name}
                                                                        {isMobile && (
                                                                            <FaChevronDown
                                                                                className={`public-dropdown-arrow ${activeSubmenu === navItem.name ? 'rotate' : ''}`}
                                                                            />
                                                                        )}
                                                                    </h4>
                                                                    <ul
                                                                       className={`public-dropdown-categories-items ${
                                                                        isMobile && (activeSubmenu === navItem.name || !isMobile) 
                                                                          ? 'show-submenu' 
                                                                          : ''
                                                                      }`}
                                                                    >
                                                                        {uniqueItems.map((item, itemIndex) => (
                                                                            <motion.li
                                                                                key={itemIndex}
                                                                                className="public-dropdown-item"
                                                                                whileHover={{ x: isMobile ? 0 : 5, transition: { duration: 0.2 } }}
                                                                                initial={{ opacity: 0, x: -10 }}
                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                transition={{
                                                                                    delay: 0.3 + itemIndex * 0.03,
                                                                                    duration: 0.3,
                                                                                }}
                                                                                role="none"
                                                                            >
                                                                                <NavLink
                                                                                    to={`/${formatForURL(navItem.categoryKey)}/${formatForURL(item.ITEMNAME)}`}
                                                                                    state={{
                                                                                        itemId: item.ITEMID,
                                                                                        itemName: item.ITEMNAME,
                                                                                        category: navItem.categoryKey
                                                                                    }}
                                                                                    className={({ isActive }) => (isActive ? 'public-active-subnav-link' : '')}
                                                                                    role="menuitem"
                                                                                    tabIndex={0}
                                                                                    onClick={closeMobileMenu}
                                                                                >
                                                                                    <span className="public-dropdown-item-name">{item.ITEMNAME}</span>
                                                                                    {countMap[item.ITEMNAME].count > 1 && (
                                                                                        <span className="public-dropdown-item-count">
                                                                                            ({countMap[item.ITEMNAME].count})
                                                                                        </span>
                                                                                    )}
                                                                                </NavLink>
                                                                            </motion.li>
                                                                        ))}
                                                                    </ul>
                                                                </motion.div>
                                                               
                                                            </>
                                                        )}
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </motion.nav>
    );
};

export default NavBar;