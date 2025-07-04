import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome,
  FaBell,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaEnvelope,
  FaGlobe,
  FaSearch,
} from 'react-icons/fa';
import {
  MdDarkMode,
  MdOutlineLightMode,
  MdOutlineMenu,
  MdMenuOpen,
} from 'react-icons/md';
import { MyContext } from '../../context/themeContext/themeContext';
import logo from '../../assets/logo/logo.jpg';
import './NewAdminHeader.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/authContext';
import { useUserProfile } from '../../hooks/profile/useUserProfile';
import { debounce } from 'lodash';

const NewAdminHeader = ({ toggleSidebar, isSidebarOpen }) => {
  const { themeMode, setThemeMode } = useContext(MyContext);
  const [scrolled, setScrolled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showSearch, setShowSearch] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [activeButton, setActiveButton] = useState(null);

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const { data: user, isLoading } = useUserProfile();

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const languageRef = useRef(null);
  const emailRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Window resize handler
  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setShowSearch(false);
      }
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      handleResize.cancel();
    };
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = debounce(() => setScrolled(window.scrollY > 20), 100);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      handleScroll.cancel();
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
        setActiveButton(null);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
        setActiveButton(null);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
        setActiveButton(null);
      }
      if (emailRef.current && !emailRef.current.contains(event.target)) {
        setIsEmailOpen(false);
        setActiveButton(null);
      }
     
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [windowWidth]);

  // Date and time update
  useEffect(() => {
    const updateDateTime = () => {
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentDateTime(`DATE: ${formattedDate} - TIME: ${formattedTime}`);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleButtonClick = (buttonName) => {
    setActiveButton(activeButton === buttonName ? null : buttonName);
  };


  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLanguageOpen(false);
    setActiveButton(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleHomeClick = () => {
    const confirmed = window.confirm("Do you want to go to the home page?");
    if (confirmed) {
      navigate('/');
    }
  };


  return (
    <header
      className={`new-header ${scrolled ? 'scrolled' : ''} ${themeMode}`}
      role="banner"
      aria-label="Admin Header"
    >
      <div className="new-header-container">
        {/* Left: Logo & Name */}
        <div className="new-header-left">
          {windowWidth < 768 && (
          <button
            className={`new-menu-toggle ${isSidebarOpen ? 'active' : ''}`}
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSidebar()}
          >
            {isSidebarOpen ? <MdMenuOpen /> : <MdOutlineMenu />}
          </button>
            )}
          <div className="new-logo">
            <img src={logo} alt="BMG Jewelers Logo" className="new-logo-image" />
            {windowWidth > 576 && (
              <h1 className="new-company-name">
                BMG Jewelers {windowWidth > 768 && <span className='new-company-sub-name'>pvt ltd</span>}
              </h1>
            )}
          </div>
        </div>

        {/* Center: Search & Date-Time */}
        <div className="new-header-center">
          

          {windowWidth > 768 && (
            <div className="new-date-time-container">
              <input
                type="text"
                value={currentDateTime}
                readOnly
                className="new-date-box"
                aria-label="Current date and time"
              />
            </div>
          )}
        </div>

        {/* Right: Icons & Profile */}
        <div className="new-header-right">

          <div className="new-dropdown-wrapper" ref={dropdownRef}>
            <button
              className={`new-icon-button ${activeButton === 'home' ? 'active' : ''}`}
              onClick={() => {
                setIsOpen((prev) => !prev);
                handleButtonClick('home');
              }}
              aria-label="Go to Home"
              tabIndex={0}
            >
              <FaHome />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="new-dropdown-menu"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <button
                    onClick={handleHomeClick}
                    tabIndex={0}
                    className="new-dropdown-item"
                  >
                    Go to Home
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            className={`new-icon-button ${activeButton === 'theme' ? 'active' : ''}`}
            onClick={() => {
              toggleTheme();
              handleButtonClick('theme');
            }}
            aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
            tabIndex={0}
          >
            {themeMode === 'light' ? <MdDarkMode /> : <MdOutlineLightMode />}
          </button>

          <div className="new-dropdown-wrapper" ref={languageRef}>
            <button
              className={`new-icon-button ${activeButton === 'language' ? 'active' : ''}`}
              onClick={() => {
                setIsLanguageOpen(!isLanguageOpen);
                handleButtonClick('language');
              }}
              aria-label="Change language"
              tabIndex={0}
            >
              <FaGlobe />
            </button>
            <AnimatePresence>
              {isLanguageOpen && (
                <motion.div
                  className="new-dropdown-menu"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <button
                    onClick={() => changeLanguage('en')}
                    tabIndex={0}
                    className="new-dropdown-item"
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('ta')}
                    tabIndex={0}
                    className="new-dropdown-item"
                  >
                    Tamil
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {windowWidth > 480 && (
            <>
              <div className="new-dropdown-wrapper" ref={emailRef}>
                <button
                  className={`new-icon-button ${activeButton === 'email' ? 'active' : ''}`}
                  onClick={() => {
                    setIsEmailOpen(!isEmailOpen);
                    handleButtonClick('email');
                  }}
                  aria-label="Messages"
                  tabIndex={0}
                >
                  <FaEnvelope />
                </button>
                <AnimatePresence>
                  {isEmailOpen && (
                    <motion.div
                      className="new-dropdown-menu"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <div className="new-dropdown-header">Messages</div>
                      <div className="new-dropdown-item">
                        <div className="new-message-preview">
                          <strong>Coming Soon</strong>
                          <small>Messages feature under development</small>
                        </div>
                      </div>
                      <div className="new-dropdown-footer">
                        <button tabIndex={0}>View all messages</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="new-dropdown-wrapper" ref={notificationsRef}>
                <button
                  className={`new-icon-button ${activeButton === 'notifications' ? 'active' : ''}`}
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    handleButtonClick('notifications');
                  }}
                  aria-label="Notifications"
                  tabIndex={0}
                >
                  <FaBell />
                  <span className="new-badge">5</span>
                </button>
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      className="new-dropdown-menu new-notification-menu"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <div className="new-dropdown-header">
                        Notifications
                        <button className="new-settings-button" aria-label="Notification settings" tabIndex={0}>
                          <FaCog />
                        </button>
                      </div>
                      <div className="new-dropdown-item">
                        <div className="new-notification-preview">
                          <div className="new-notification-icon">
                            <FaUserCircle />
                          </div>
                          <div className="new-notification-content">
                            <strong>Coming Soon</strong>
                            <small>Notifications feature under development</small>
                          </div>
                        </div>
                      </div>
                      <div className="new-dropdown-footer">
                        <button tabIndex={0}>View all notifications</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          <div className="new-dropdown-wrapper new-profile-dropdown" ref={profileRef}>
            <button
              className={`new-profile-button ${activeButton === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                handleButtonClick('profile');
              }}
              aria-label="User profile"
              tabIndex={0}
            >
              <div className="new-profile-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt="User Avatar" />
                ) : (
                  <FaUserCircle />
                )}
              </div>
              {windowWidth > 768 && (
                <span className="new-profile-name">{user?.username || 'User'}</span>
              )}
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  className="new-dropdown-menu new-profile-menu"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <div className="new-dropdown-header">User Profile</div>
                  <button
                    className="new-dropdown-item"
                    onClick={() => {
                      navigate('/admin/profile');
                      setIsProfileOpen(false);
                      setActiveButton(null);
                    }}
                    tabIndex={0}
                  >
                    <FaUserCircle className="new-menu-icon" />
                    My Profile
                  </button>
                  <div className="new-dropdown-divider"></div>
                  <button
                    className="new-dropdown-item"
                    onClick={handleLogout}
                    tabIndex={0}
                  >
                    <FaSignOutAlt className="new-menu-icon" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NewAdminHeader;