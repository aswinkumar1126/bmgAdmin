import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./CategorySection.css";
import goldIcon from "../../assets/icons/gold.jpg";
import silverIcon from "../../assets/icons/silver.jpg";
import diamondIcon from "../../assets/icons/pooja.jpg";
import allProductsIcon from "../../assets/icons/gift.jpg";
import others from '../../assets/icons/other.jpg';

const jewelryCategories = [
    { label: "Silver Gold Polish", id: "Silver Jewellery Gold Polish", icon: goldIcon },
    { label: "Silver Jewels", id: "silver jewellery", icon: silverIcon },
    { label: "Pooja sets", id: "pooja set", icon: diamondIcon },
    { label: "Gift Items", id: "gift", icon: allProductsIcon },
    { label: "Offers", id: "offer", icon: allProductsIcon },
    { label: "Others", id: "others", icon: others }
];

const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
        }
    }
};

const itemAnimation = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 10
        }
    },
    hover: {
        scale: 1.05,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    },
    tap: {
        scale: 0.95,
        transition: {
            duration: 0.2,
            ease: "easeOut"
        }
    }
};

function CategorySection() {
    const navigate = useNavigate();
    const gridRef = useRef(null);

    const scroll = (direction) => {
        if (gridRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            gridRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="category-section">
            <div className="category-container">
                <motion.h2
                    className="category-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    Shop Categories
                </motion.h2>

                <div className="category-scroll-container">
                    <button className="scroll-button left" onClick={() => scroll('left')}>
                        <FiChevronLeft />
                    </button>

                    <motion.div
                        className="category-grid"
                        ref={gridRef}
                        variants={containerAnimation}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {jewelryCategories.map((category) => (
                            <motion.div
                                key={category.id}
                                className="category-item"
                                variants={itemAnimation}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => {
                                    const element = document.getElementById(`cat-${category.id}`);
                                    if (element) {
                                        element.classList.add('category-flash');
                                        setTimeout(() => {
                                            element.classList.remove('category-flash');
                                            navigate(`/products?catname=${category.id}`);
                                        }, 300);
                                    } else {
                                        navigate(`/products?catname=${category.id}`);
                                    }
                                }}
                                id={`cat-${category.id}`}
                            >
                                <div className="category-image-wrapper">
                                    <img
                                        src={category.icon}
                                        alt={category.label}
                                        className="category-image"
                                        loading="lazy"
                                    />
                                    <div className="category-shine"></div>
                                </div>
                                <motion.span
                                    className="category-label"
                                    whileHover={{ color: "#d4af37" }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {category.label}
                                </motion.span>
                            </motion.div>
                        ))}
                    </motion.div>

                    <button className="scroll-button right" onClick={() => scroll('right')}>
                        <FiChevronRight />
                    </button>
                </div>
            </div>
        </section>
    );
}

export default CategorySection;