import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import "./AllProducts.css";
import ProductCard from "../../components/productCard/ProductCard";
import { usePaginatedProductsQuery } from "../../hook/product/usePaginatedProductsQuery";
import SkeletonLoader from "../../components/loader/SkeletonLoader";
import Error from "../../components/error/Error";
import { useCart } from "../../hook/cart/useCartQuery";
import CategorySection from "../category/CategorySection";
import { FiFilter } from "react-icons/fi";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

function Products() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const catname = searchParams.get("catname") || "";

    const [page, setPage] = useState(1);
    const [allProducts, setAllProducts] = useState([]);
    const [initialLimit, setInitialLimit] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        sort: "featured",
        priceRange: [0, 100000],
        metalType: ""
    });

    const { data, isLoading, isError, isFetching } = usePaginatedProductsQuery(catname, page);
    const { addToCartHandler } = useCart();

    useEffect(() => {
        setAllProducts([]);
        setPage(1);
        setInitialLimit(true);
    }, [catname, location.pathname]);

    useEffect(() => {
        if (Array.isArray(data)) {
            setAllProducts((prev) => [...prev, ...data]);
        } else if (Array.isArray(data?.content)) {
            setAllProducts((prev) => [...prev, ...data.content]);
        }
    }, [data]);

    const handleAddToCart = (product) => {
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

    const visibleProducts = initialLimit ? allProducts.slice(0, 20) : allProducts;

    const handleLoadMore = () => {
        if (initialLimit) {
            setInitialLimit(false);
        } else {
            setPage((prev) => prev + 1);
        }
    };

    const hasMore = Array.isArray(data?.content)
        ? page < data.totalPages
        : (data?.length === 50);

    if (isLoading && page === 1) return <SkeletonLoader />;
    if (isError) return <Error />;

    return (
        <div className="products-page-container">
            <CategorySection />

            <div className="products-content-wrapper">
                <div className="products-header-section">
                    <div className="header-content">
                        <h1 className="main-title">
                            {catname ? `${catname.replace(/-/g, ' ').toUpperCase()}` : "Our Premium Collection"}
                        </h1>
                        <p className="subtitle-text">
                            Discover exquisite craftsmanship and timeless designs
                        </p>
                    </div>

                    {/* <button
                        className="filter-toggle-button"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter className="filter-icon" />
                        Filters
                        {showFilters ? <FaChevronUp /> : <FaChevronDown />}
                    </button> */}
                </div>

                {/* {showFilters && (
                    <div className="filter-panel">
                        <div className="filter-section">
                            <h4>Sort By</h4>
                            <select
                                value={selectedFilters.sort}
                                onChange={(e) => setSelectedFilters({ ...selectedFilters, sort: e.target.value })}
                            >
                                <option value="featured">Featured</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="newest">Newest Arrivals</option>
                            </select>
                        </div>

                        <div className="filter-section">
                            <h4>Price Range</h4>
                            <div className="price-range-slider">
                                <input
                                    type="range"
                                    min="0"
                                    max="100000"
                                    value={selectedFilters.priceRange[0]}
                                    onChange={(e) => setSelectedFilters({
                                        ...selectedFilters,
                                        priceRange: [parseInt(e.target.value), selectedFilters.priceRange[1]]
                                    })}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="100000"
                                    value={selectedFilters.priceRange[1]}
                                    onChange={(e) => setSelectedFilters({
                                        ...selectedFilters,
                                        priceRange: [selectedFilters.priceRange[0], parseInt(e.target.value)]
                                    })}
                                />
                                <div className="price-range-values">
                                    <span>₹{selectedFilters.priceRange[0]}</span>
                                    <span>₹{selectedFilters.priceRange[1]}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            className="apply-filters-button"
                            onClick={() => {
                                // Apply filters logic here
                                setPage(1);
                                setAllProducts([]);
                            }}
                        >
                            Apply Filters
                        </button>
                    </div>
                )} */}

                <div className="products-grid-layout">
                    {visibleProducts.map((product, index) => (
                        <ProductCard
                            key={`${product.SNO}-${index}`}
                            product={product}
                            onQuickView={() => navigate(`/product/${product.SNO}`)}
                            onAddToCart={() => handleAddToCart(product)}
                        />
                    ))}
                </div>

                {(hasMore || initialLimit) && (
                    <div className="load-more-section">
                        <button
                            className="load-more-button"
                            onClick={handleLoadMore}
                            disabled={isFetching}
                        >
                            {isFetching ? (
                                <span className="loading-dots">
                                    <span>.</span>
                                    <span>.</span>
                                    <span>.</span>
                                </span>
                            ) : initialLimit ? (
                                "View More Products"
                            ) : (
                                "Load More"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Products;