import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from "react-router-dom";
import { useFilteredItems } from "../../hook/search/useSearchQuery";
import ProductCard from "../../components/productCard/ProductCard";
import { useCart } from "../../hook/cart/useCartQuery";
import {
    Box,
    Typography,
    Grid,
    Container,
    Button,
    CircularProgress,
    Alert,
    useMediaQuery,
    useTheme,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Divider,
    Badge
} from "@mui/material";
import {
    AddShoppingCart,
    SearchOff,
    Close,
    ArrowBack,
    ArrowForward,
    FavoriteBorder,
    Favorite,
    ZoomIn
} from "@mui/icons-material";
import './SearchResultsPage.css';

// Enhanced animation variants
const searchContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            when: "beforeChildren"
        }
    }
};

const searchItemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 120,
            damping: 12,
            mass: 0.5
        }
    },
    hover: {
        scale: 1.03,
        boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.3 }
    },
    tap: {
        scale: 0.98
    }
};

const SearchResultsPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isSmallMobile = useMediaQuery('(max-width:400px)');
    const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));
    const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
    const user = localStorage.getItem("user");
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const itemName = queryParams.get("itemName");

    // State management
    const [page, setPage] = useState(1);
    const [allItems, setAllItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [quickViewItem, setQuickViewItem] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const pageSize = useMemo(() => {
        if (isSmallMobile) return 8;
        if (isMobile) return 12;
        return 16;
    }, [isMobile, isSmallMobile]);

    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
        refetch
    } = useFilteredItems({
        itemName,
        page: page - 1,
        pageSize
    });

    const { addToCartHandler, isAddingToCart } = useCart();

    // Load favorites from localStorage
    useEffect(() => {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, []);

    // Save favorites to localStorage when they change
    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    // Handle data updates
    useEffect(() => {
        if (data?.data?.data) {
            if (page === 1) {
                setAllItems(data.data.data);
            } else {
                setAllItems(prevItems => [...prevItems, ...data.data.data]);
            }
            setHasMore(data.data.data.length >= pageSize);
        }
    }, [data, page, pageSize]);

    // Reset initial load state
    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoad(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // Toggle favorite status
    const toggleFavorite = useCallback((itemId) => {
        setFavorites(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    }, []);

    // Add to cart handler
    const handleAddToCart = useCallback(async (item) => {
        if (!user) {
            localStorage.setItem(
                "redirectAfterLogin",
                JSON.stringify({
                    path: window.location.pathname + window.location.search
                })
            );
            navigate("/login");
            return;
        }

        try {
            await addToCartHandler({
                itemTagSno: item.SNO,
                itemId: item.ITEMID,
                subItemId: item.SubItemId,
                tagNo: item.TAGNO,
                grsWt: parseFloat(item.GRSWT),
                netWt: parseFloat(item.NETWT),
                stnWt: 0,
                stnAmount: parseFloat(item.StoneAmount || 0),
                amount: parseFloat(item.GrandTotal || 0),
                purity: parseFloat(item.PURITY),
                quantity: 1,
            });
        } catch (err) {
            console.error("Failed to add to cart:", err);
        }
    }, [user, addToCartHandler, navigate]);

    // Load more items
    const loadMore = useCallback(() => {
        setPage(prevPage => prevPage + 1);
    }, []);

    // Get responsive grid size
    const getGridSize = useCallback(() => {
        if (isSmallMobile) return 6;
        if (isMobile) return 4;
        if (isTablet) return 3;
        if (isDesktop) return 2.4;
        return 3;
    }, [isSmallMobile, isMobile, isTablet, isDesktop]);

    const gridSize = getGridSize();

    // Quick view navigation
    const handleNextImage = useCallback(() => {
        setSelectedImageIndex(prev =>
            prev >= (quickViewItem?.images?.length || 1) - 1 ? 0 : prev + 1
        );
    }, [quickViewItem]);

    const handlePrevImage = useCallback(() => {
        setSelectedImageIndex(prev =>
            prev <= 0 ? (quickViewItem?.images?.length || 1) - 1 : prev - 1
        );
    }, [quickViewItem]);

    if (isLoading && page === 1) {
        return (
            <Container maxWidth={false} sx={{ py: 4, px: { xs: 1, sm: 2 } }}>
                <Grid container spacing={2}>
                    {[...Array(6)].map((_, index) => (
                        <Grid item xs={6} sm={4} md={3} lg={2.4} key={index}>
                            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <CircularProgress size={isSmallMobile ? 40 : 60} />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    if (isError) {
        return (
            <Container maxWidth={false} sx={{ py: 4, px: { xs: 1, sm: 2 } }}>
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={refetch}
                        >
                            Retry
                        </Button>
                    }
                >
                    Error loading search results: {error.message}
                </Alert>
                <Button
                    variant="outlined"
                    onClick={() => navigate("/")}
                    startIcon={<ArrowBack />}
                >
                    Back to Home
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth={false} sx={{ py: 4, px: { xs: 1, sm: 2 } }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 2
                    }}
                >
                    Search Results for "{itemName}"
                </Typography>
                {allItems.length > 0 && (
                    <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                    >
                        Showing {allItems.length} {allItems.length === 1 ? 'item' : 'items'}
                    </Typography>
                )}
                <Divider sx={{ my: 2 }} />
            </Box>

            {allItems.length === 0 && !isFetching ? (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "60vh",
                        textAlign: "center",
                        gap: 2
                    }}
                >
                    <SearchOff sx={{
                        fontSize: 80,
                        color: theme.palette.text.disabled,
                        mb: 2
                    }} />
                    <Typography
                        variant="h5"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                    >
                        No items found matching "{itemName}"
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 3, maxWidth: '500px' }}
                    >
                        Try different keywords or browse our collections
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/")}
                        startIcon={<ArrowBack />}
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: '50px'
                        }}
                    >
                        Continue Shopping
                    </Button>
                </Box>
            ) : (
                <>
                    <motion.div
                        initial="hidden"
                        animate={isInitialLoad ? "hidden" : "visible"}
                        variants={searchContainerVariants}
                    >
                        <Grid
                            container
                            spacing={isSmallMobile ? 1 : 2}
                            alignItems="stretch"
                            justifyContent={isSmallMobile ? 'center' : 'flex-start'}
                        >
                            <AnimatePresence>
                                {allItems.map((item) => (
                                    <Grid
                                        item
                                        xs={6}
                                        sm={4}
                                        md={3}
                                        lg={2.4}
                                        key={item.SNO}
                                        sx={{ display: 'flex' }}
                                    >
                                        <motion.div
                                            variants={searchItemVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            className="search-result-card"
                                            layout
                                        >
                                            <Box sx={{ position: 'relative' }}>
                                                <IconButton
                                                    aria-label={favorites.includes(item.SNO) ? "Remove from favorites" : "Add to favorites"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(item.SNO);
                                                    }}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        zIndex: 2,
                                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255,255,255,0.9)'
                                                        }
                                                    }}
                                                >
                                                    {favorites.includes(item.SNO) ? (
                                                        <Favorite color="error" />
                                                    ) : (
                                                        <FavoriteBorder />
                                                    )}
                                                </IconButton>
                                                <ProductCard
                                                    product={item}
                                                    onQuickView={() => setQuickViewItem(item)}
                                                    onAddToCart={() => handleAddToCart(item)}
                                                    isAddingToCart={isAddingToCart}
                                                    actionIcon={
                                                        <Badge
                                                            badgeContent={1}
                                                            color="primary"
                                                            invisible={!isAddingToCart}
                                                        >
                                                            <AddShoppingCart />
                                                        </Badge>
                                                    }
                                                />
                                            </Box>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </AnimatePresence>
                        </Grid>
                    </motion.div>

                    {hasMore && (
                        <Box sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 6,
                            mb: 4
                        }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={loadMore}
                                disabled={isFetching}
                                startIcon={isFetching ? <CircularProgress size={20} /> : null}
                                sx={{
                                    minWidth: '200px',
                                    py: 1.5,
                                    px: 4,
                                    borderRadius: '50px',
                                    borderWidth: '2px',
                                    '&:hover': {
                                        borderWidth: '2px'
                                    }
                                }}
                                size="large"
                            >
                                {isFetching ? 'Loading...' : 'Load More'}
                            </Button>
                        </Box>
                    )}

                    {!hasMore && allItems.length > 0 && (
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            align="center"
                            sx={{
                                mt: 4,
                                mb: 2,
                                fontStyle: 'italic'
                            }}
                        >
                            You've reached the end of the list
                        </Typography>
                    )}
                </>
            )}

            {/* Quick View Dialog */}
            <Dialog
                open={!!quickViewItem}
                onClose={() => setQuickViewItem(null)}
                maxWidth="md"
                fullWidth
                scroll="body"
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        overflow: 'hidden'
                    }
                }}
            >
                {quickViewItem && (
                    <>
                        <DialogTitle sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: theme.palette.grey[100],
                            borderBottom: `1px solid ${theme.palette.divider}`
                        }}>
                            <Typography variant="h6" fontWeight={600}>
                                {quickViewItem.name || 'Product Details'}
                            </Typography>
                            <IconButton
                                onClick={() => setQuickViewItem(null)}
                                size="large"
                            >
                                <Close />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent dividers sx={{ p: 0 }}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                height: '100%'
                            }}>
                                <Box sx={{
                                    width: { xs: '100%', md: '50%' },
                                    position: 'relative',
                                    backgroundColor: theme.palette.grey[50],
                                    minHeight: '400px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 4
                                }}>
                                    <IconButton
                                        onClick={handlePrevImage}
                                        sx={{
                                            position: 'absolute',
                                            left: 16,
                                            zIndex: 1,
                                            backgroundColor: 'rgba(255,255,255,0.8)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.9)'
                                            }
                                        }}
                                    >
                                        <ArrowBack />
                                    </IconButton>
                                    <Box
                                        component="img"
                                        src={quickViewItem.image || '/placeholder-product.jpg'}
                                        alt={quickViewItem.name}
                                        sx={{
                                            maxWidth: '100%',
                                            maxHeight: '400px',
                                            objectFit: 'contain',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <IconButton
                                        onClick={handleNextImage}
                                        sx={{
                                            position: 'absolute',
                                            right: 16,
                                            zIndex: 1,
                                            backgroundColor: 'rgba(255,255,255,0.8)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.9)'
                                            }
                                        }}
                                    >
                                        <ArrowForward />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => window.open(quickViewItem.image, '_blank')}
                                        sx={{
                                            position: 'absolute',
                                            bottom: 16,
                                            right: 16,
                                            zIndex: 1,
                                            backgroundColor: 'rgba(255,255,255,0.8)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.9)'
                                            }
                                        }}
                                    >
                                        <ZoomIn />
                                    </IconButton>
                                </Box>
                                <Box sx={{
                                    width: { xs: '100%', md: '50%' },
                                    p: 4,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <Typography variant="h5" fontWeight={600} gutterBottom>
                                        {quickViewItem.description}
                                    </Typography>
                                    <Box sx={{ mb: 3 }}>
                                        <Chip
                                            label={`${quickViewItem.PURITY}k Gold`}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                            sx={{ mr: 1 }}
                                        />
                                        <Chip
                                            label={`${quickViewItem.NETWT}g`}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>
                                    <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
                                        ${quickViewItem.GrandTotal}
                                    </Typography>
                                    <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                                        {quickViewItem.details || 'Premium quality jewelry with exquisite craftsmanship.'}
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ mt: 'auto' }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            startIcon={<AddShoppingCart />}
                                            onClick={() => {
                                                handleAddToCart(quickViewItem);
                                                setQuickViewItem(null);
                                            }}
                                            sx={{
                                                py: 1.5,
                                                borderRadius: '8px',
                                                mb: 2
                                            }}
                                        >
                                            Add to Cart
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            size="large"
                                            onClick={() => {
                                                navigate(`/product/${quickViewItem.SNO}`);
                                                setQuickViewItem(null);
                                            }}
                                            sx={{
                                                py: 1.5,
                                                borderRadius: '8px'
                                            }}
                                        >
                                            View Full Details
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </Container>
    );
};

export default SearchResultsPage;