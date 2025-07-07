import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import SkeletonLoader from "../../components/loader/SkeletonLoader";
import Error from "../../components/error/Error";
import ProductCard from "../../components/productCard/ProductCard";
import MobileProductCard from "../../components/productCard/MobileProductCard";
import Button from "../../components/button/Button";
import { useCart } from "../../hook/cart/useCartQuery";
import "./Product.css"; // Renamed CSS file

function Product({ products = [], loading, error }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth <= 1023);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showArrows, setShowArrows] = useState(false);
    const user = localStorage.getItem("user");
    const navigate = useNavigate();
    const { addToCartHandler } = useCart();
    const carouselRef = useRef(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Responsive product count
    const productsPerPage = isMobile ? 2 : isTablet ? 3 : 4;
    const totalProducts = products.length;

    // Handle screen size changes
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 767);
            setIsTablet(window.innerWidth >= 768 && window.innerWidth <= 1023);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Auto-scroll carousel on non-mobile devices
    useEffect(() => {
        if (!isMobile && totalProducts > productsPerPage) {
            const interval = setInterval(() => {
                handleNext();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isMobile, totalProducts, productsPerPage, currentIndex]);

    // Swipe handlers
    const handlers = useSwipeable({
        onSwipedLeft: () => handleNext(),
        onSwipedRight: () => handlePrev(),
        trackMouse: true,
        preventDefaultTouchmoveEvent: true,
    });

    const handlePrev = useCallback(() => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        setCurrentIndex(prev =>
            prev === 0 ? totalProducts - productsPerPage : prev - 1
        );
        setTimeout(() => setIsTransitioning(false), 300);
    }, [totalProducts, productsPerPage, isTransitioning]);

    const handleNext = useCallback(() => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        setCurrentIndex(prev =>
            prev >= totalProducts - productsPerPage ? 0 : prev + 1
        );
        setTimeout(() => setIsTransitioning(false), 300);
    }, [totalProducts, productsPerPage, isTransitioning]);

    const getVisibleProducts = useCallback(() => {
        let endIndex = currentIndex + productsPerPage;
        if (endIndex > totalProducts) {
            return [
                ...products.slice(currentIndex),
                ...products.slice(0, endIndex - totalProducts)
            ];
        }
        return products.slice(currentIndex, endIndex);
    }, [currentIndex, productsPerPage, totalProducts, products]);

    const handleAddToCart = (product) => {
        if (!user) {
            localStorage.setItem(
                "redirectAfterLogin",
                JSON.stringify({ path: window.location.pathname })
            );
            navigate("/login");
            return;
        }

        addToCartHandler({
            itemTagSno: product.SNO,
            itemId: product.ITEMID,
            subItemId: product.SubItemId,
            tagNo: product.TAGNO,
            grsWt: parseFloat(product.GRSWT),
            netWt: parseFloat(product.NETWT),
            stnWt: 0,
            stnAmount: parseFloat(product.StoneAmount || 0),
            amount: parseFloat(product.GrandTotal || 0),
            purity: parseFloat(product.PURITY),
            quantity: 1,
        });
    };

    if (error) {
        return (
            <Error
                error={error}
                retry={() => window.location.reload()}
                aria-label="Error loading products"
            />
        );
    }

    return (
        <section className="pc-container" aria-label="Premium Product Collection">
            <header className="pc-header">
                <h2 className="pc-title">Our Premium Collection</h2>
                <p className="pc-subtitle">Exquisite craftsmanship for discerning tastes</p>
            </header>

            <div
                className="pc-carousel-wrapper"
                onMouseEnter={() => !isMobile && setShowArrows(true)}
                onMouseLeave={() => !isMobile && setShowArrows(false)}
                ref={carouselRef}
                {...handlers}
            >
                {loading ? (
                    <div className={`pc-grid ${isMobile ? "pc-mobile-view" : isTablet ? "pc-tablet-view" : ""}`}>
                        {[...Array(productsPerPage)].map((_, i) => (
                            <SkeletonLoader
                                key={`skel-${i}`}
                                mobile={isMobile}
                                aria-hidden="true"
                            />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <>
                        {showArrows && !isMobile && (
                            <>
                                <button
                                    className="pc-arrow pc-left-arrow"
                                    onClick={handlePrev}
                                    aria-label="Previous product set"
                                    type="button"
                                    disabled={isTransitioning}
                                >
                                    <FaArrowLeft aria-hidden="true" />
                                </button>
                                <button
                                    className="pc-arrow pc-right-arrow"
                                    onClick={handleNext}
                                    aria-label="Next product set"
                                    type="button"
                                    disabled={isTransitioning}
                                >
                                    <FaArrowRight aria-hidden="true" />
                                </button>
                            </>
                        )}

                        <div
                            className={`pc-grid ${isMobile ? "pc-mobile-view" : isTablet ? "pc-tablet-view" : ""} ${isTransitioning ? "pc-transitioning" : ""}`}
                            role="region"
                            aria-label="Product carousel"
                        >
                            {getVisibleProducts().map((product, index) => (
                                isMobile ? (
                                    <MobileProductCard
                                        key={`mobile-${product.SNO}-${index}`}
                                        product={product}
                                        onQuickView={() => navigate(`/product/${product.SNO}`)}
                                        onAddToCart={() => handleAddToCart(product)}
                                        aria-label={`View ${product.name || "product"} details`}
                                    />
                                ) : (
                                    <ProductCard
                                        key={`desk-${product.SNO}-${index}`}
                                        product={product}
                                        onQuickView={() => navigate(`/product/${product.SNO}`)}
                                        onAddToCart={() => handleAddToCart(product)}
                                        aria-label={`View ${product.name || "product"} details`}
                                    />
                                )
                            ))}
                        </div>

                        {(isMobile || isTablet) && totalProducts > productsPerPage && (
                            <div className="pc-mobile-controls" role="navigation">
                                <button
                                    onClick={handlePrev}
                                    aria-label="Previous product set"
                                    type="button"
                                    disabled={isTransitioning}
                                >
                                    <FaArrowLeft aria-hidden="true" />
                                </button>
                                <div className="pc-dots">
                                    {Array.from({
                                        length: Math.ceil(totalProducts / productsPerPage),
                                    }).map((_, i) => (
                                        <button
                                            key={i}
                                            className={`pc-dot ${i === Math.floor(currentIndex / productsPerPage) ? "pc-active" : ""}`}
                                            onClick={() => {
                                                if (!isTransitioning) {
                                                    setIsTransitioning(true);
                                                    setCurrentIndex(i * productsPerPage);
                                                    setTimeout(() => setIsTransitioning(false), 300);
                                                }
                                            }}
                                            aria-label={`Go to product set ${i + 1}`}
                                            aria-current={i === Math.floor(currentIndex / productsPerPage) ? "true" : "false"}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={handleNext}
                                    aria-label="Next product set"
                                    type="button"
                                    disabled={isTransitioning}
                                >
                                    <FaArrowRight aria-hidden="true" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="pc-no-products" role="alert">
                        <div className="pc-no-products-content">
                            <h3>No Products Available</h3>
                            <p>We're currently updating our collection. Please check back soon.</p>
                        </div>
                    </div>
                )}
            </div>

            {products.length > 0 && (
                <div className="pc-see-more">
                    <Button
                        label="Explore More Products"
                        onClick={() => navigate("/products")}
                        variant="primary"
                        size="large"
                        className="pc-see-more-btn"
                        aria-label="View all products"
                    />
                </div>
            )}
        </section>
    );
}

export default Product;
