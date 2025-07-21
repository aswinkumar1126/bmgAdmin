import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { FiStar } from "react-icons/fi"; // Added for the star icon in the header
import SkeletonLoader from "../../components/loader/SkeletonLoader";
import Error from "../../components/error/Error";
import ProductCard from "../../components/productCard/ProductCard";
import MobileProductCard from "../../components/productCard/MobileProductCard";
import Button from "../../components/button/Button";
import { useCart } from "../../hook/cart/useCartQuery";
import { useNewArrivals } from "../../hook/newArrivals/useNewArrivals"; // Assuming this hook exists
import "./ProductSectionPage.css"; // Using the existing CSS file for consistency

function NewArrivalsPage() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showArrows, setShowArrows] = useState(false);
    const user = localStorage.getItem("user");
    const navigate = useNavigate();
    const { addToCartHandler } = useCart();
    const carouselRef = useRef(null);

    // Data fetching
    const {
        data: products = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useNewArrivals();
    console.log("Raw products:", products);

    // Transform product data to match expected structure (similar to your original)
    const transformedProducts = products.map((product) => ({
        ...product,
        ITEMNAME: product.itemName,
        ITEMSNO: product.itemTag_Sno,
        ITEMID: product.itemId,
        SubItemId: product.subItemId,
        TAGNO: product.tagNo,
        GRSWT: product.grsWt,
        NETWT: product.netWt,
        PURITY: 916, // Default purity value (916 = 22k gold)
        StoneAmount: 0, // Default stone amount
        GrandTotal: product.rate, // Calculate total price
        imagePath: product.imagePath || "/images/product-placeholder.jpg", // Fallback image
    }));
    console.log("Transformed products:", transformedProducts);

    // Responsive settings
    const productsPerPage = isMobile ? 2 : 4;
    const totalProducts = transformedProducts.length;

    // Handle screen size changes
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
            setCurrentIndex(0); // Reset index on resize to avoid overflow
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Swipe handlers
    const handlers = useSwipeable({
        onSwipedLeft: () => handleNext(),
        onSwipedRight: () => handlePrev(),
        trackMouse: true,
        preventDefaultTouchmoveEvent: true,
    });

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) =>
            prev === 0 ? totalProducts - productsPerPage : prev - 1
        );
    }, [totalProducts, productsPerPage]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) =>
            prev >= totalProducts - productsPerPage ? 0 : prev + 1
        );
    }, [totalProducts, productsPerPage]);

    const getVisibleProducts = useCallback(() => {
        const endIndex = Math.min(currentIndex + productsPerPage, totalProducts);
        return transformedProducts.slice(currentIndex, endIndex);
    }, [currentIndex, productsPerPage, totalProducts, transformedProducts]);

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

    if (isError) {
        return (
            <Error
                error={error}
                retry={refetch}
                aria-label="Error loading new arrivals"
            />
        );
    }

    return (
        <section className="product-container" aria-label="New Arrivals Collection">
            <header className="page-header">
                <div className="header-title-wrapper">
                    <FiStar className="header-icon" />
                    <h2 className="title animate-char">New Arrivals</h2>
                    {!isLoading && transformedProducts.length > 0 && (
                        <span className="items-count-badge">
                            {transformedProducts.length}{" "}
                            {transformedProducts.length === 1 ? "item" : "items"}
                        </span>
                    )}
                </div>
                <p className="section-subtitle">
                    Discover our latest jewelry collections
                </p>
            </header>

            <div
                className="product-carousel-wrapper"
                onMouseEnter={() => !isMobile && setShowArrows(true)}
                onMouseLeave={() => !isMobile && setShowArrows(false)}
                ref={carouselRef}
                {...handlers}
            >
                {isLoading ? (
                    <div className={`product-grid ${isMobile ? "mobile-view" : ""}`}>
                        {[...Array(productsPerPage)].map((_, i) => (
                            <SkeletonLoader
                                key={`skel-${i}`}
                                mobile={isMobile}
                                aria-hidden="true"
                            />
                        ))}
                    </div>
                ) : transformedProducts.length > 0 ? (
                    <>
                        {showArrows && !isMobile && (
                            <>
                                <button
                                    className="carousel-arrow left-arrow"
                                    onClick={handlePrev}
                                    aria-label="Previous new arrivals set"
                                    type="button"
                                >
                                    <FaArrowLeft aria-hidden="true" />
                                </button>
                                <button
                                    className="carousel-arrow right-arrow"
                                    onClick={handleNext}
                                    aria-label="Next new arrivals set"
                                    type="button"
                                >
                                    <FaArrowRight aria-hidden="true" />
                                </button>
                            </>
                        )}

                        <div
                            className={`product-grid ${isMobile ? "mobile-view" : ""}`}
                            role="region"
                            aria-label="New arrivals carousel"
                        >
                            {getVisibleProducts().map((product, index) => {
                                const uniqueKey = `${isMobile ? 'mobile' : 'desk'}-${product?.SNO || product?.TAGNO || index}`;

                                return isMobile ? (
                                    <MobileProductCard
                                        key={uniqueKey}
                                        product={product}
                                        onQuickView={() => navigate(`/product/${product.SNO}`)}
                                        onAddToCart={() => handleAddToCart(product)}
                                        aria-label={`View ${product.ITEMNAME || "new arrival"} details`}
                                    />
                                ) : (
                                    <ProductCard
                                        key={uniqueKey}
                                        product={product}
                                        onQuickView={() => navigate(`/product/${product.SNO}`)}
                                        onAddToCart={() => handleAddToCart(product)}
                                        aria-label={`View ${product.ITEMNAME || "new arrival"} details`}
                                    />
                                );
                            })}

                        </div>

                        {isMobile && totalProducts > productsPerPage && (
                            <div className="mobile-carousel-controls" role="navigation">
                                <button
                                    onClick={handlePrev}
                                    aria-label="Previous new arrivals set"
                                    type="button"
                                >
                                    <FaArrowLeft aria-hidden="true" />
                                </button>
                                <div className="carousel-dots">
                                    {Array.from({
                                        length: Math.ceil(totalProducts / productsPerPage),
                                    }).map((_, i) => (
                                        <button
                                            key={i}
                                            className={`dot ${i === Math.floor(currentIndex / productsPerPage)
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setCurrentIndex(i * productsPerPage)
                                            }
                                            aria-label={`Go to new arrival set ${i + 1}`}
                                            aria-current={
                                                i === Math.floor(currentIndex / productsPerPage)
                                                    ? "true"
                                                    : "false"
                                            }
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={handleNext}
                                    aria-label="Next new arrivals set"
                                    type="button"
                                >
                                    <FaArrowRight aria-hidden="true" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-products" role="alert">
                        No new arrivals available at this time
                    </div>
                )}
            </div>

            <div className="see-more-wrapper">
                <Button
                    label="Explore More Products"
                    onClick={() => navigate("/products")}
                    variant="primary"
                    size="large"
                    className="see-more-btn"
                    aria-label="View all products"
                />
            </div>
        </section>
    );
}

export default NewArrivalsPage;