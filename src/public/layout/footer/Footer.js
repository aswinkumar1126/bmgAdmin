import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const [openColumns, setOpenColumns] = useState({
        usefulLinks: false,
        navigation: false,
        contact: false,
    });

    const toggleColumn = (column) => {
        setOpenColumns((prev) => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    const columnVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        hover: { x: 5, color: '#d4af37', transition: { duration: 0.2 } },
        tap: { scale: 0.95 },
    };

    const socialIconVariants = {
        hover: {
            scale: 1.15,
            color: '#b89c30',
            y: -3,
            transition: { type: 'spring', stiffness: 400, damping: 10 },
        },
    };

    const usefulLinks = [
        { path: '/privacy-policy', text: 'Privacy Policy' },
        { path: '/terms-condition', text: 'Terms and Condition' },
        { path: '/delivery-shipping', text: 'Delivery-Shipping Policy' },
        { path: '/cancel-return', text: 'Cancellation & Return Policy' },
        { path: '/refund', text: 'Refund Policy' },
    ];

    const navigationLinks = [
        { path: '/', text: 'Home' },
        { path: '/products', text: 'Products' },
        { path: '/why-us', text: 'Why Us' },
        { path: '/videos', text: 'Videos' },
        { path: '/admin', text: 'Admin' },
    ];

    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Useful Links Column */}
                <motion.div
                    className="footer-column"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={columnVariants}
                >
                    <h4
                        className={`footer-header ${openColumns.usefulLinks ? 'show-links' : ''}`}
                        onClick={() => toggleColumn('usefulLinks')}
                    >
                        <span>Useful Links</span>
                    </h4>
                    <ul className={`footer-links ${openColumns.usefulLinks ? 'show-links' : ''}`}>
                        {usefulLinks.map((link, index) => (
                            <motion.li
                                key={index}
                                variants={itemVariants}
                                whileHover="hover"
                                whileTap="tap"
                                className="footer-link-item"
                            >
                                <NavLink
                                    to={link.path}
                                    className={({ isActive }) => (isActive ? 'active-footer-link' : '')}
                                >
                                    {link.text}
                                </NavLink>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>

                {/* Navigation Column */}
                <motion.div
                    className="footer-column"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={columnVariants}
                >
                    <h4
                        className={`footer-header ${openColumns.navigation ? 'show-links' : ''}`}
                        onClick={() => toggleColumn('navigation')}
                    >
                        <span>Navigation</span>
                    </h4>
                    <ul className={`footer-links ${openColumns.navigation ? 'show-links' : ''}`}>
                        {navigationLinks.map((link, index) => (
                            <motion.li
                                key={index}
                                variants={itemVariants}
                                whileHover="hover"
                                whileTap="tap"
                                className="footer-link-item"
                            >
                                <NavLink
                                    to={link.path}
                                    className={({ isActive }) => (isActive ? 'active-footer-link' : '')}
                                >
                                    {link.text}
                                </NavLink>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>

                {/* Contact Column */}
                <motion.div
                    className="footer-column"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={columnVariants}
                >
                    <h4
                        className={`footer-header ${openColumns.contact ? 'show-links' : ''}`}
                        onClick={() => toggleColumn('contact')}
                    >
                        <span>Contact</span>
                    </h4>
                    <motion.p
                        variants={itemVariants}
                        className={`footer-contact-text ${openColumns.contact ? 'show-links' : ''}`}
                    >
                        <span className="contact-title">Showroom Address:</span> M/s. BMG Jewellers Pvt Ltd, 160,
                        Melamasi St, Madurai-625001
                    </motion.p>
                    <motion.p
                        variants={itemVariants}
                        className={`footer-contact-text ${openColumns.contact ? 'show-links' : ''}`}
                    >
                        <span className="contact-title">Primary Contact:</span> +91-95143 33601, 95143 33609
                    </motion.p>
                    <motion.p
                        variants={itemVariants}
                        className={`footer-contact-text ${openColumns.contact ? 'show-links' : ''}`}
                    >
                        <a
                            href="mailto:Contact@bmgjewellers.in?subject=Inquiry&body=Hello, I have a question..."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-contact-text"
                        >
                            Contact@bmgjewellers.in
                        </a>
                    </motion.p>
                </motion.div>

                {/* Footer Bottom */}
                <motion.div
                    className="footer-bottom"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div className="social-icons" variants={itemVariants}>
                        {[
                            { icon: 'fab fa-facebook-f', url: 'https://www.facebook.com' },
                            { icon: 'fab fa-instagram', url: 'https://www.instagram.com' },
                            { icon: 'fab fa-twitter', url: 'https://www.twitter.com' },
                            { icon: 'fab fa-linkedin-in', url: 'https://www.linkedin.com' },
                            { icon: 'fab fa-youtube', url: 'https://www.youtube.com' },
                        ].map((social, index) => (
                            <motion.a
                                key={index}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                variants={socialIconVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <i className={social.icon}></i>
                            </motion.a>
                        ))}
                    </motion.div>

                    <p className="copy-rights">© 2025 BMG Jewellery Pvt Ltd. All rights reserved.</p>
                    <p className="design">
                        Powered by{' '}
                        <a href="https://www.brightechsoftware.com" target="_blank" className="designed-by">
                            BrightechSoftwareSolutions
                        </a>
                    </p>
                    <div className="payment-methods">
                        <i className="fab fa-cc-visa"></i>
                        <i className="fab fa-cc-mastercard"></i>
                        <i className="fab fa-cc-paypal"></i>
                        <i className="fab fa-cc-apple-pay"></i>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;