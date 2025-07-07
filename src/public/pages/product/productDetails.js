import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { gsap } from "gsap";
import 'magic.css/dist/magic.min.css';
import Error from "../../components/error/Error";
import SkeletonLoader from "../../components/loader/SkeletonLoader";
import Button from "../../components/button/Button";
import { useSingleProductQuery } from "../../hook/product/useSingleProductQuery";
import './ProductDetails.css';
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiX } from "react-icons/fi";
import { useCart } from "../../hook/cart/useCartQuery";
import { useRecentlyViewed } from "../../hook/recentlyViewed/useRecentlyViewedQuery";
import RecentlyViewedPage from "../recentlyViewed/RecentlyViewed";
import { useRatesQuery } from "../../hook/rate/useRatesQuery";

const ProductDetails = () => {
    const { sno } = useParams();
    const stickyCartRef = useRef(null);
    const [isStickyVisible, setIsStickyVisible] = useState(false);
    const animationRef = useRef(null);
    console.log(sno);

    useEffect(() => {
        if (sno) {
            addItem(sno);
        }
    }, [sno]);

    const { data: productDetail, isLoading, isError, error } = useSingleProductQuery(sno);
    console.log(productDetail);
    const { data: metalRates } = useRatesQuery();

    const { addToCartHandler } = useCart();
    const { addItem } = useRecentlyViewed();

    const [zoomStyle, setZoomStyle] = useState({});
    const [showZoom, setShowZoom] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [expandedSpecs, setExpandedSpecs] = useState(true);
    const [showFullImage, setShowFullImage] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const imgRef = useRef(null);
    const zoomRef = useRef(null);
    const thumbnailContainerRef = useRef(null);

    const baseUrl = "https://app.bmgjewellers.com";
    const [imageUrls, setImageUrls] = useState([]);

    // GSAP animations for sticky cart
    useEffect(() => {
        if (!stickyCartRef.current) return;

        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const triggerPosition = 300;
            const viewportHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const isNearBottom = scrollPosition + viewportHeight >= documentHeight - 100;

            if (scrollPosition > triggerPosition && !isStickyVisible && !isNearBottom) {
                setIsStickyVisible(true);
                gsap.fromTo(stickyCartRef.current,
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
                );
            } else if ((scrollPosition <= triggerPosition || isNearBottom) && isStickyVisible) {
                setIsStickyVisible(false);
                gsap.to(stickyCartRef.current,
                    { y: 50, opacity: 0, duration: 0.3, ease: "power2.in" }
                );
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isStickyVisible]);

    // Image handling
    useEffect(() => {
        try {
            const parsedImages = JSON.parse(productDetail?.ImagePath || "[]");
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                setImageUrls(parsedImages);
            } else {
                setImageUrls(["/fallback.jpg"]);
            }
        } catch (err) {
            console.error("Invalid image path format:", err);
            setImageUrls(["/fallback.jpg"]);
        }
    }, [productDetail]);

    const mainImage = imageUrls.length > 0 ? baseUrl + imageUrls[activeImageIndex] : "/fallback.jpg";

    const handleMouseMove = (e) => {
        if (!imgRef.current || !zoomRef.current) return;

        const container = imgRef.current;
        const { left, top, width, height } = container.getBoundingClientRect();

        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;

        setZoomStyle({
            backgroundImage: `url(${mainImage})`,
            backgroundPosition: `${x}% ${y}%`,
            backgroundSize: `${width * 2}px ${height * 2}px`,
        });
    };

    const handleThumbnailScroll = (direction) => {
        if (thumbnailContainerRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            thumbnailContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handleThumbnailClick = (index) => {
        if (index === activeImageIndex || isTransitioning) return;
        setActiveImageIndex(index);
    };

    const navigateImage = (direction) => {
        if (isTransitioning) return;

        setIsTransitioning(true);

        let newIndex;
        if (direction === 'next') {
            newIndex = (activeImageIndex + 1) % imageUrls.length;
        } else {
            newIndex = (activeImageIndex - 1 + imageUrls.length) % imageUrls.length;
        }

        setActiveImageIndex(newIndex);

        // Reset transitioning state after animation would complete
        setTimeout(() => {
            setIsTransitioning(false);
        }, 300);
    };

    const handleAddToCart = () => {
        if (!productDetail) return;

        addToCartHandler({
            itemTagSno: productDetail.SNO,
            itemId: productDetail.ITEMID,
            subItemId: productDetail.SubItemId,
            tagNo: productDetail.TAGNO,
            grsWt: parseFloat(productDetail.GRSWT || 0),
            netWt: parseFloat(productDetail.NETWT || 0),
            stnWt: 0,
            stnAmount: parseFloat(productDetail.StoneAmount || 0),
            amount: parseFloat(productDetail.GrandTotal || 0),
            purity: parseFloat(productDetail.PURITY || 0),
            quantity: 1,
        });
    };

    const toggleSpecs = () => {
        setExpandedSpecs(!expandedSpecs);
    };

    const toggleFullImage = () => {
        setShowFullImage(!showFullImage);
    };

    if (isError) {
        console.error("Product fetch error:", error);
        return <Error error={error} />;
    }
    if (isLoading || !productDetail) return <SkeletonLoader count={1} type="details" />;

    if (productDetail.METALID === 'G') productDetail.METALID = 'GOLD';
    if (productDetail.METALID === 'S') productDetail.METALID = 'SILVER';
    if (productDetail.METALID === 'D') productDetail.METALID = 'DIAMOND';
    if (productDetail.METALID === 'P') productDetail.METALID = 'PLATINUM';

    let metalRateSpec = [];

    if (metalRates) {
        if (productDetail.METALID === 'GOLD' && metalRates.GOLDRATE) {
            metalRateSpec.push({
                label: 'Gold Rate',
                value: `₹${metalRates.GOLDRATE.toLocaleString()} /gm`
            });
        } else if (productDetail.METALID === 'SILVER' && metalRates.SILVERRATE) {
            metalRateSpec.push({
                label: 'Silver Rate',
                value: `₹${metalRates.SILVERRATE.toLocaleString()} /gm`
            });
        }
    }

    const specificationGroups = {
        "Basic Details": [
            { label: "Item Name", value: productDetail.ITEMNAME },
            { label: "Subitem Name", value: productDetail.SUBITEMNAME || '-' },
            { label: "SK-Unit", value: `${productDetail.ITEMID || '-'} - ${productDetail.TAGNO}` },
            { label: "Purity", value: productDetail.PURITY },
            { label: "Metal Type", value: productDetail.METALID },
            ...metalRateSpec
        ],

        "Weight Details": [
            { label: "Gross Weight", value: `${productDetail.GRSWT} grams` },
            { label: "Net Weight", value: `${productDetail.NETWT} grams` },
            { label: "Wastage", value: productDetail.Wastage },
        ],
        "Pricing Details": [
            { label: "Making Charges", value: `₹${productDetail.MC}` },
            { label: "Stone Amount", value: `₹${productDetail.StoneAmount}` },
            { label: "Misc Amount", value: `₹${productDetail.MiscAmount}` },
            { label: `GST (${productDetail.GSTPer})`, value: `₹${productDetail.GSTAmount}` },
            { label: "Grand Total", value: `₹${productDetail.GrandTotal}` },
        ],
    };

    return (
        <>
            <div className="product-details-container">
                <div className="product-details-wrapper">
                    {/* Sticky Add to Cart Bar */}
                    <div
                        ref={stickyCartRef}
                        className={`sticky-cart-bar ${isStickyVisible ? 'visible' : ''}`}
                    >
                        <div className="sticky-cart-content">
                            <div className="sticky-cart-left">
                                <img
                                    src={mainImage}
                                    alt={productDetail.ITEMNAME}
                                    className="sticky-cart-image"
                                />
                                <span className="sticky-cart-name">
                                    {productDetail.ITEMNAME || productDetail.productName}
                                </span>
                            </div>
                            <div className="sticky-cart-right">
                                <span className="sticky-cart-price">₹{productDetail.GrandTotal}</span>
                                <Button
                                    className="sticky-cart-btn"
                                    label="Add to Cart"
                                    onClick={handleAddToCart}
                                    primary
                                />
                            </div>
                        </div>
                    </div>

                    <div className="product-image-section">
                        <div
                            className="image-container"
                            onMouseEnter={() => setShowZoom(true)}
                            onMouseLeave={() => setShowZoom(false)}
                            onMouseMove={handleMouseMove}
                            ref={imgRef}
                            onClick={toggleFullImage}
                        >
                            {imageUrls.length > 1 && (
                                <>
                                    <button
                                        className="image-nav-button left"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigateImage('prev');
                                        }}
                                        aria-label="Previous image"
                                    >
                                        <FiChevronLeft size={24} />
                                    </button>
                                    <button
                                        className="image-nav-button right"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigateImage('next');
                                        }}
                                        aria-label="Next image"
                                    >
                                        <FiChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            <img
                                src={mainImage}
                                alt={productDetail.ITEMNAME || productDetail.productName}
                                className={`main-product-image ${isTransitioning ? 'fade' : ''}`}
                                loading="lazy"
                                onError={(e) => {
                                    e.target.src = '/fallback.jpg';
                                    e.target.alt = 'Product image not available';
                                }}
                            />

                            <div className="image-counter">
                                {activeImageIndex + 1} / {imageUrls.length}
                            </div>

                            <button className="zoom-indicator">
                                <FiZoomIn size={24} />
                            </button>

                            {showZoom && (
                                <div
                                    className="zoom-preview"
                                    ref={zoomRef}
                                    style={zoomStyle}
                                    aria-hidden="true"
                                />
                            )}
                        </div>

                        {imageUrls.length > 1 && (
                            <div className="thumbnail-gallery-container">
                                <button
                                    className="thumbnail-nav-button left"
                                    onClick={() => handleThumbnailScroll('left')}
                                    aria-label="Scroll thumbnails left"
                                >
                                    <FiChevronLeft size={20} />
                                </button>

                                <div className="image-thumbnails" ref={thumbnailContainerRef}>
                                    {imageUrls.map((url, index) => (
                                        <button
                                            key={index}
                                            className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleThumbnailClick(index);
                                            }}
                                            aria-label={`View image ${index + 1}`}
                                        >
                                            <img
                                                src={baseUrl + url}
                                                alt={`Thumbnail ${index + 1}`}
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-thumbnail.jpg';
                                                    e.target.alt = 'Thumbnail not available';
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className="thumbnail-nav-button right"
                                    onClick={() => handleThumbnailScroll('right')}
                                    aria-label="Scroll thumbnails right"
                                >
                                    <FiChevronRight size={20} />
                                </button>
                            </div>
                        )}

                        <div className="product-actions">
                            <Button
                                className="add-to-cart-btn"
                                label="Add to Cart"
                                onClick={handleAddToCart}
                            />
                            <Button
                                className="buy-now-btn"
                                label="Buy Now"
                                primary
                            />
                        </div>
                    </div>

                    <div className="product-info-section">
                        <div className="product-header">
                            <div className="product-title-row">
                                <h1 className="product-title">{productDetail.ITEMNAME || productDetail.productName}</h1>
                                <div className="price-section">
                                    <span className="current-price">₹{productDetail.GrandTotal || productDetail.productPrice}</span>
                                    {productDetail.originalPrice && (
                                        <span className="original-price">₹{productDetail.originalPrice}</span>
                                    )}
                                    {productDetail.discountPercentage && (
                                        <span className="discount">{productDetail.discountPercentage}% off</span>
                                    )}
                                </div>
                            </div>

                            {(productDetail.rating || productDetail.reviewCount) && (
                                <div className="rating-section">
                                    {productDetail.rating && (
                                        <div className="rating-badge">
                                            {productDetail.rating} <i className="fas fa-star"></i>
                                        </div>
                                    )}
                                    {productDetail.reviewCount && (
                                        <span className="rating-count">
                                            {productDetail.reviewCount} Ratings & Reviews
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="product-details-accordion">
                            <div className="specifications">
                                <div
                                    className="specs-header"
                                    onClick={toggleSpecs}
                                    role="button"
                                    tabIndex="0"
                                    aria-expanded={expandedSpecs}
                                >
                                    <h3>Specifications</h3>
                                    <span className="toggle-icon">
                                        {expandedSpecs ? (
                                            <i className="fas fa-minus"></i>
                                        ) : (
                                            <i className="fas fa-plus"></i>
                                        )}
                                    </span>
                                </div>

                                {expandedSpecs && (
                                    <div className="specs-content">
                                        {Object.entries(specificationGroups).map(([groupName, specs]) => (
                                            <div key={groupName} className="spec-group">
                                                <h4 className="spec-group-title">{groupName}</h4>
                                                <div className="spec-grid">
                                                    {specs.map((spec, index) => (
                                                        <React.Fragment key={index}>
                                                            <div className="spec-label">{spec.label}</div>
                                                            <div className="spec-value">{spec.value}</div>
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="product-description">
                                <h3>Description</h3>
                                <p>{productDetail.Description || "No description available"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showFullImage && (
                <div className="full-image-modal" onClick={toggleFullImage}>
                    <div className="full-image-content">
                        <button
                            className="modal-nav-button left"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateImage('prev');
                            }}
                            aria-label="Previous image"
                        >
                            <FiChevronLeft size={32} />
                        </button>

                        <img
                            src={mainImage}
                            alt="Full size product"
                            onClick={(e) => e.stopPropagation()}
                        />

                        <button
                            className="modal-nav-button right"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateImage('next');
                            }}
                            aria-label="Next image"
                        >
                            <FiChevronRight size={32} />
                        </button>

                        <div className="modal-image-counter">
                            {activeImageIndex + 1} / {imageUrls.length}
                        </div>

                        <button className="close-modal" onClick={toggleFullImage}>
                            <FiX size={24} />
                        </button>
                    </div>
                </div>
            )}

            <section>
                <RecentlyViewedPage />
            </section>
        </>
    );
};

export default ProductDetails;