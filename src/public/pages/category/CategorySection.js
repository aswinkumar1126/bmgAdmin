import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useCategories } from "../../hook/category/useCategoryQuery";
import "./CategorySection.css";

// Import icons
import goldIcon from "../../assets/icons/gold.jpg";
import silverIcon from "../../assets/icons/silver.jpg";
import diamondIcon from "../../assets/icons/pooja.jpg";
import allProductsIcon from "../../assets/icons/gift.jpg";
import others from '../../assets/icons/other.jpg';

// Format name helper
const formatForCategoryDisplay = (str) => {
    if (!str || typeof str !== 'string') return 'Unnamed';
    return str.replace(/_/g, ' ').toLowerCase();
};

const getIconForCategory = (name) => {
    if (!name || typeof name !== 'string') return others;

    const formatted = name.toLowerCase();

    if (formatted.includes("gold")) return goldIcon;
    if (formatted.includes("silver")) return silverIcon;
    if (formatted.includes("pooja")) return diamondIcon;
    if (formatted.includes("gift")) return allProductsIcon;
    if (formatted.includes("offer")) return allProductsIcon;
    return others;
};
  
// Animations
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
        transition: { duration: 0.3, ease: "easeOut" }
    },
    tap: {
        scale: 0.95,
        transition: { duration: 0.2, ease: "easeOut" }
    }
};

function CategorySection() {
    const navigate = useNavigate();
    const gridRef = useRef(null);

    const { data: categories = [], isLoading } = useCategories();
    console.log(categories)

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
                        {isLoading ? (
                            <p>Loading categories...</p> // You can use a skeleton here
                        ) : (
                            categories.map((categoryName) => {
                                const icon = getIconForCategory(categoryName);
                                const label = formatForCategoryDisplay(categoryName);

                                console.log(label);

                                return (
                                    <motion.div
                                        key={categoryName}
                                        className="category-item"
                                        variants={itemAnimation}
                                        whileHover="hover"
                                        whileTap="tap"
                                        onClick={() => {
                                            const element = document.getElementById(`cat-${categoryName}`);
                                            if (element) {
                                                element.classList.add('category-flash');
                                                setTimeout(() => {
                                                    element.classList.remove('category-flash');
                                                    navigate(`/products?catname=${label}`);
                                                }, 300);
                                            } else {
                                                navigate(`/products?catname=${label}`);
                                            }
                                        }}
                                        id={`cat-${categoryName}`}
                                    >
                                        <div className="category-image-wrapper">
                                            <img
                                                src={icon}
                                                alt={label}
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
                                            {label}
                                        </motion.span>
                                    </motion.div>
                                );
                            
                            })
                        )}
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
