import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useItemFilter } from '../../hook/category/useCategoryQuery';
import ProductCard from '../../components/productCard/ProductCard';
import MobileProductCard from '../../components/productCard/MobileProductCard';
import LoadingSpinner from '../../components/loader/SkeletonLoader';
import Error from '../../components/error/Error';
import './ProductsPage.css';

const ProductsPage = () => {
    const { itemName } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const page = parseInt(searchParams.get('page')) || 1;

    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const { state } = location;
    const itemId = state?.itemId;
    const metalType = state?.metal;
    const fullItemName = state?.itemName || itemName.replace(/-/g, ' ');

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { data: products, isLoading, isError, error } = useItemFilter({
        itemId,
        itemName: fullItemName,
        metal: metalType,
        page,
        pageSize: 20
    });

    const handlePageChange = (newPage) => {
        setIsLoadingMore(true);
        searchParams.set('page', newPage);
        navigate({ search: searchParams.toString() }, { replace: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleQuickView = (productSno) => {
        navigate(`/product/${productSno}`);
    };

    if (isLoading && !isLoadingMore) {
        return (
            <div className="product-page-loading-wrapper">
                <LoadingSpinner />
                <p className="product-loading-text">Loading our exquisite collection...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <Error
                message={error.message || "We couldn't load the products"}
                onRetry={() => window.location.reload()}
            />
        );
    }

    return (
        <div className="product-listing-container">
            <div className="product-listing-header">
                <div className="product-breadcrumb-nav">
                    <span className="breadcrumb-link" onClick={() => navigate('/')}>Home</span>
                    <span className="breadcrumb-separator"> / </span>
                    <span className="breadcrumb-current">{fullItemName.toUpperCase()}</span>
                </div>
                <h1 className="product-category-title">
                    {fullItemName.toUpperCase()}
                    {products?.length > 0 && (
                        <span className="product-count-badge">{products.length} {products.length === 1 ? 'item' : 'items'}</span>
                    )}
                </h1>
            </div>

            <div className="product-listing-content">
                {products?.length > 0 ? (
                    <>
                        <div className={`product-card-grid ${isMobileView ? 'mobile-layout' : 'desktop-layout'}`}>
                            {products.map(product => {
                                const productProps = {
                                    product: {
                                        ...product,
                                        isNew: product.isNew || false,
                                        discount: product.discount || 0
                                    },
                                    showSubItemName: true,
                                    onQuickView: () => handleQuickView(product.SNO)
                                };

                                return isMobileView ? (
                                    <MobileProductCard key={product.TAGNO} {...productProps} />
                                ) : (
                                    <ProductCard key={product.TAGNO} {...productProps} />
                                );
                            })}

                        </div>

                        <div className="product-pagination-controls">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="pagination-nav-button prev-button"
                            >
                                Previous
                            </button>
                            <span className="current-page-indicator">Page {page}</span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={products?.length < 20}
                                className="pagination-nav-button next-button"
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="empty-product-state">
                        <div className="empty-state-content">
                            <h3 className="empty-state-title">No Products Found</h3>
                            <p className="empty-state-message">We couldn't find any items matching your criteria.</p>
                            <button
                                onClick={() => navigate('/products')}
                                className="browse-all-button"
                            >
                                Browse All Products
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;