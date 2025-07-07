import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../hook/cart/useCartQuery";
import { useFavorites } from "../../hook/favorites/useFavoritesQuery";
import { useAuth } from "../../context/authContext/UserAuthContext";
import TopBar from "./TopBar";
import MainHeader from "./MainHeader";
import NavBar from "./NavBar";
import "./Header.css";

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showTopBar, setShowTopBar] = useState(true);
    const [showNavBar, setShowNavBar] = useState(true);
    const [compact, setCompact] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const lastScrollY = useRef(0);
    const profileMenuRef = useRef(null);
    const navRef = useRef(null);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const isAuthenticated = !!user;
    const username = user?.username || null;

    const { cartItems, error: cartError, isLoading: cartLoading } = useCart({
        enabled: isAuthenticated,
    });
    const {
        data: favoritesData,
        error: favoritesError,
        refetch: refetchFavorites,
        isLoading: favoritesLoading,
    } = useFavorites({ enabled: isAuthenticated });

    useEffect(() => {
        if (isAuthenticated) {
            refetchFavorites();
        }
    }, [isAuthenticated, refetchFavorites]);

    useEffect(() => {
        if (cartError?.response?.status === 401 || favoritesError?.response?.status === 401) {
            logout();
            navigate("/login");
        }
    }, [cartError, favoritesError, navigate, logout]);

    const cartList = isAuthenticated && Array.isArray(cartItems?.data) ? cartItems.data : [];

    const handleProfileClick = useCallback(() => {
        if (!isAuthenticated) {
            navigate("/login");
        } else {
            setIsProfileMenuOpen((prev) => !prev);
        }
    }, [navigate, isAuthenticated]);

    const handleLogout = useCallback(() => {
        logout();
        setIsProfileMenuOpen(false);
        navigate("/login");
    }, [logout, navigate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
            if (
                navRef.current &&
                !navRef.current.contains(event.target) &&
                (!dropdownRef.current || !dropdownRef.current.contains(event.target))
            ) {
                setIsMobileMenuOpen(false);
                setActiveDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const debounce = useCallback((func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (isMobile) {
                // Disable scrolled effects on mobile
                setShowTopBar(true);
                setShowNavBar(true);
                setCompact(false);
                setIsScrolled(false);
            } else {
                // Apply scroll behavior only on desktop
                const currentScrollY = window.scrollY;
                const isScrollingUp = currentScrollY < lastScrollY.current;
                const isAtTop = currentScrollY <= 50;

                setShowTopBar(isAtTop);
                setShowNavBar(isScrollingUp || isAtTop);
                setCompact(currentScrollY > 50 && !isScrollingUp);
                setIsScrolled(currentScrollY > 50);
                lastScrollY.current = currentScrollY;
            }
        };

        const handleResize = debounce(() => {
            const isNowMobile = window.innerWidth <= 992;
            setIsMobile(isNowMobile);
            if (!isNowMobile) {
                setIsMobileMenuOpen(false);
                setActiveDropdown(null);
                setIsProfileMenuOpen(false);
            }
        }, 100);

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, [debounce, isMobile]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
    }, [location.pathname]);

    const toggleDropdown = useCallback((menu) => {
        setActiveDropdown((prev) => (prev === menu ? null : menu));
    }, []);

    const closeMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
    }, []);

    return (
        <header
            className={`public-header-container ${isScrolled && !isMobile ? "public-scrolled" : ""
                } ${compact ? "compact" : ""}`}
        >
            <TopBar
                announcement="🔥 Free Shipping on Orders Above ₹50,000 | Special Discounts This Week!"
                className={showTopBar ? "" : "hide-top-bar"}
            />
            <MainHeader
                isMobile={isMobile}
                isAuthenticated={isAuthenticated}
                username={username}
                wishlistCount={
                    favoritesLoading
                        ? 0
                        : isAuthenticated && Array.isArray(favoritesData?.data)
                            ? favoritesData.data.length
                            : 0
                }
                cartCount={
                    cartLoading
                        ? 0
                        : isAuthenticated && Array.isArray(cartItems?.data)
                            ? cartItems.data.length
                            : 0
                }
                handleProfileClick={handleProfileClick}
                isProfileMenuOpen={isProfileMenuOpen}
                setIsProfileMenuOpen={setIsProfileMenuOpen}
                handleLogout={handleLogout}
                toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                isMobileMenuOpen={isMobileMenuOpen}
            />
            <NavBar
                isMobile={isMobile}
                isMobileMenuOpen={isMobileMenuOpen}
                activeDropdown={activeDropdown}
                toggleDropdown={toggleDropdown}
                closeMobileMenu={closeMobileMenu}
                setActiveDropdown={setActiveDropdown}
                navRef={navRef}
                dropdownRef={dropdownRef}
                location={location}
                className={showNavBar ? "" : "hide-nav-bar"}
            />
        </header>
    );
};

export default Header;