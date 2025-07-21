import React, { useState, useMemo, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    styled,
    IconButton,
    Button,
    Modal,
    TextField,
    CircularProgress,
    InputAdornment,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    useMediaQuery,
    useTheme,
    Grid,
    Chip,
    Avatar,
    Badge,
    Alert,
    Snackbar,
} from '@mui/material';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon,
    Search as SearchIcon,
    Add as AddIcon,
    Error as ErrorIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import Skeleton from '@mui/material/Skeleton';
import {
    useCategoriesQuery,
    useDeleteCategoryImageMutation,
    useUpdateCategoryImageMutation,
} from '../../../hooks/category/useCategories';
import { debounce } from 'lodash';

// Constants
const BASE_IMAGE_URL = 'https://app.bmgjewellers.com';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// Styled components with responsive adjustments
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    width: '100%',
    margin: 'auto',
    borderRadius: 16,
    boxShadow: theme.shadows[6],
    background: theme.palette.background.paper,
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(3),
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
        borderRadius: 12,
    },
}));

const DropzoneBox = styled(Box)(({ theme, isDragActive }) => ({
    border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
    borderRadius: 12,
    padding: theme.spacing(1),
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: isDragActive ? theme.palette.primary.light : theme.palette.background.default,
    transition: theme.transitions.create(['background-color', 'border-color'], {
        duration: theme.transitions.duration.short,
    }),
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        borderColor: theme.palette.primary.main,
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
    },
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: 8,
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1, 2),
    minWidth: 'fit-content',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(0.75, 1.5),
        fontSize: '0.75rem',
    },
}));

const ModalBox = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '0%',
    left: '0%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 700,
    maxHeight: '90vh',
    overflowY: 'auto',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[24],
    padding: theme.spacing(4),
    borderRadius: 16,
    outline: 'none',
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(3),
    },
    [theme.breakpoints.down('sm')]: {
        width: '95%',
        padding: theme.spacing(2),
    },
}));

const SearchField = styled(TextField)(({ theme }) => ({
    width: '100%',
    maxWidth: 300,
    '& .MuiOutlinedInput-root': {
        borderRadius: 8,
        '& fieldset': { borderColor: theme.palette.divider },
        '&:hover fieldset': { borderColor: theme.palette.primary.main },
        '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
    },
    [theme.breakpoints.down('sm')]: {
        maxWidth: '100%',
    },
}));

const ImagePreview = styled('img')(({ theme }) => ({
    width: '100%',
    height: 'auto',
    maxHeight: 150,
    objectFit: 'contain',
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
    transition: theme.transitions.create('transform'),
    '&:hover': {
        transform: 'scale(1.05)',
    },
}));

const toastOptions = {
    position: 'top-right',
    top:50,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progressStyle: { background: '#2563eb' },
    style: {
        borderRadius: '10px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
        fontFamily: '"Roboto", sans-serif',
        fontWeight: 500,
    },
};

const ManageCategoriesPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const [searchTerm, setSearchTerm] = useState('');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedImagePath, setSelectedImagePath] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const { data: categories, isLoading, error, refetch } = useCategoriesQuery();
    const deleteMutation = useDeleteCategoryImageMutation();
    const updateMutation = useUpdateCategoryImageMutation();

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        multiple: false,
        maxSize: MAX_FILE_SIZE,
        onDrop: (acceptedFiles, fileRejections) => {
            if (fileRejections.length > 0) {
                const reasons = fileRejections
                    .map((rej) => rej.errors.map((err) => `${rej.file.name}: ${err.message}`).join(', '))
                    .join('; ');
                showError(`File rejected: ${reasons}`);
            } else {
                if (newImage) URL.revokeObjectURL(newImage.preview);
                const file = acceptedFiles[0];
                if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
                    showError('Invalid file type. Please upload an image (PNG, JPG, JPEG, WebP).');
                    return;
                }
                setNewImage(
                    Object.assign(file, { preview: URL.createObjectURL(file) })
                );
            }
        },
    });

    // Show error message
    const showError = (message) => {
        setSnackbarMessage(message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
    };

    // Show success message
    const showSuccess = (message) => {
        setSnackbarMessage(message);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    };

    // Close snackbar
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    // Debounced search
    const filteredCategories = useMemo(() => {
        if (!searchTerm || !categories) return categories || [];
        const lowerSearch = searchTerm.toLowerCase();
        return categories.filter((cat) =>
            cat.category_name.toLowerCase().includes(lowerSearch)
        );
    }, [categories, searchTerm]);

    // Clean up object URLs when component unmounts
    useEffect(() => {
        return () => {
            if (newImage) URL.revokeObjectURL(newImage.preview);
        };
    }, [newImage]);

    // Handle edit action
    const handleEdit = (category, imagePath) => {
        setSelectedCategory(category);
        setSelectedImagePath(imagePath);
        setEditModalOpen(true);
    };

    // Handle update action
    const handleUpdate = () => {
        if (!newImage) {
            showError('Please select a new image');
            return;
        }
        updateMutation.mutate(
            {
                category: selectedCategory.category_name,
                oldImagePath: selectedImagePath,
                newImage,
            },
            {
                onSuccess: () => {
                    showSuccess('Image updated successfully!');
                    refetch();
                    setEditModalOpen(false);
                    setNewImage(null);
                },
                onError: (err) => {
                    showError(err.message || 'Failed to update image');
                },
            }
        );
    };

    // Handle delete action
    const handleDelete = (category, imagePath) => {
        setDeleteTarget({ category, imagePath });
        setDeleteDialogOpen(true);
    };

    // Confirm delete action
    const confirmDelete = () => {
        if (!deleteTarget) return;
        deleteMutation.mutate(
            { category: deleteTarget.category, imagePath: deleteTarget.imagePath },
            {
                onSuccess: (data) => {
                    showSuccess(data.message || 'Image deleted successfully!');
                    refetch();
                    setDeleteDialogOpen(false);
                    setDeleteTarget(null);
                },
                onError: (err) => {
                    showError(err.message || 'Failed to delete image');
                },
            }
        );
    };

    // Responsive columns configuration
    const columns = useMemo(() => [
        {
            field: 'id',
            headerName: 'ID',
            width: isMobile ? 60 : 100,
            headerAlign: 'center',
            align: 'center',
            sortable: true
        },
        {
            field: 'category_name',
            headerName: 'Category',
            width: isMobile ? 120 : isTablet ? 200 : 300,
            sortable: true,
            renderCell: (params) => (
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'images',
            headerName: 'Images',
            width: isMobile ? 130 : isTablet ? 200 : 280,
            height: isMobile ? 130 : isTablet ? 200 : 280,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    py: 1,
                }}>
                    {params.value.map((image, index) => (
                        <Tooltip key={index} title={`Image ${index + 1}`} arrow>
                            <Badge
                                badgeContent={index + 1}
                                color="primary"
                                overlap="circular"
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Avatar
                                        src={`${BASE_IMAGE_URL}${image}`}
                                        alt={`${params.row.category_name} image ${index + 1}`}
                                        sx={{
                                            width: isMobile ? 40 : 56,
                                            height: isMobile ? 40 : 56,
                                            cursor: 'pointer',
                                            border: `1px solid ${theme.palette.divider}`,
                                        }}
                                        onClick={() => window.open(`${BASE_IMAGE_URL}${image}`, '_blank')}
                                    />
                                </motion.div>
                            </Badge>
                        </Tooltip>
                    ))}
                </Box>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: isMobile ? 120 : 180,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{
                    display: 'flex',
                    gap: 1,
                    flexDirection: isMobile ? 'column' : 'row',
                }}>
                    {params.row.images.map((image, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title={`Edit image ${index + 1}`}>
                                <IconButton
                                    color="primary"
                                    size={isMobile ? 'small' : 'medium'}
                                    onClick={() => handleEdit(params.row, image)}
                                    aria-label={`Edit image ${index + 1} for ${params.row.category_name}`}
                                >
                                    <VisibilityIcon fontSize={isMobile ? 'small' : 'medium'} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={`Delete image ${index + 1}`}>
                                <IconButton
                                    color="error"
                                    size={isMobile ? 'small' : 'medium'}
                                    onClick={() => handleDelete(params.row.category_name, image)}
                                    disabled={deleteMutation.isLoading}
                                    aria-label={`Delete image ${index + 1} for ${params.row.category_name}`}
                                >
                                    <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ))}
                </Box>
            ),
        },
    ], [isMobile, isTablet, theme.palette.divider, deleteMutation.isLoading]);

    return (
        <Box sx={{
            p: { xs: 1, sm: 2, md: 3 },
            bgcolor: 'background.default',
            minHeight: '100vh',
        }}>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            color: 'primary.main',
                            textAlign: { xs: 'center', md: 'left' },
                        }}
                        component={motion.div}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        Manage Categories
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6} sx={{
                    display: 'flex',
                    justifyContent: { xs: 'space-between', md: 'space-between' },
                    gap: 6,
                    flexWrap: 'no-wrap',
                }}>
                    <SearchField
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        variant="outlined"
                        size="small"
                        component={motion.div}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    />
                    <ActionButton
                        variant="contained"
                        onClick={() => window.location.href = '/admin/category/add'}
                        startIcon={<AddIcon />}
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            whiteSpace: 'nowrap',
                        }}
                        component={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isMobile ? 'Add' : 'Add Category'}
                    </ActionButton>
                </Grid>
            </Grid>

            <StyledPaper elevation={1}>
                {isLoading ? (
                    <Box sx={{ p: 2 }}>
                        {[...Array(5)].map((_, index) => (
                            <Skeleton
                                key={index}
                                variant="rectangular"
                                height={60}
                                sx={{
                                    mb: 2,
                                    borderRadius: 1,
                                    animationDelay: `${index * 0.1}s`,
                                }}
                            />
                        ))}
                    </Box>
                ) : error ? (
                    <Box sx={{
                        p: 4,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                    }}>
                        <ErrorIcon color="error" sx={{ fontSize: 48 }} />
                        <Typography color="error" variant="h6">
                            Error Loading Categories
                        </Typography>
                        <Typography variant="body1">
                            {error.message || 'Failed to load categories. Please try again.'}
                        </Typography>
                        <ActionButton
                            variant="contained"
                            color="primary"
                            onClick={() => refetch()}
                            startIcon={<RefreshIcon />}
                        >
                            Retry
                        </ActionButton>
                    </Box>
                ) : (
                    <Box sx={{
                        height: 'auto',
                        width: '100%',
                        '& .MuiDataGrid-root': {
                            border: 'none',
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        },
                        '& .MuiDataGrid-columnHeader': {
                            backgroundColor: theme.palette.background.default,
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 700,
                        },
                    }}>
                        <DataGrid
                            rows={filteredCategories}
                            columns={columns}
                            pageSizeOptions={[5, 10, 20]}
                            autoHeight
                            disableRowSelectionOnClick
                            density={isMobile ? 'compact' : 'standard'}
                            sx={{
                                [`& .${gridClasses.cell}`]: {
                                    py: isMobile ? 1 : 2,
                                },
                                '& .MuiDataGrid-row:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                },
                            }}
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 10, page: 0 },
                                },
                            }}
                            components={{
                                NoRowsOverlay: () => (
                                    <Box sx={{
                                        p: 4,
                                        textAlign: 'center',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Typography variant="body1" color="textSecondary">
                                            No categories found
                                        </Typography>
                                        {searchTerm && (
                                            <ActionButton
                                                variant="text"
                                                onClick={() => setSearchTerm('')}
                                                sx={{ mt: 1 }}
                                            >
                                                Clear search
                                            </ActionButton>
                                        )}
                                    </Box>
                                ),
                                LoadingOverlay: () => (
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '100%',
                                    }}>
                                        <CircularProgress />
                                    </Box>
                                ),
                            }}
                        />
                    </Box>
                )}
            </StyledPaper>

            {/* Edit Image Modal */}
            <Modal
                open={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setNewImage(null);
                }}
                aria-labelledby="edit-image-modal"
                aria-describedby="edit-category-image"
                keepMounted={false}
            >
                <ModalBox
                    component={motion.div}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Typography
                        id="edit-image-modal"
                        variant="h6"
                        gutterBottom
                        sx={{
                            fontWeight: 600,
                            color: 'primary.main',
                            mb: 3,
                        }}
                    >
                        Update Image for {selectedCategory?.category_name}
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                Current Image
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                mb: 2,
                            }}>
                                <ImagePreview
                                    src={`${BASE_IMAGE_URL}${selectedImagePath}`}
                                    alt="Current category image"
                                />
                            </Box>
                            <Chip
                                label="Current Image"
                                color="primary"
                                variant="outlined"
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                New Image
                            </Typography>
                            <DropzoneBox {...getRootProps()} isDragActive={isDragActive}>
                                <input {...getInputProps()} />
                                <CloudUploadIcon
                                    sx={{
                                        fontSize: 48,
                                        color: isDragActive ? 'primary.main' : 'text.secondary',
                                        mb: 1,
                                    }}
                                />
                                <Typography
                                    variant="body1"
                                    color={isDragActive ? 'primary.main' : 'text.primary'}
                                    gutterBottom
                                >
                                    {isDragActive ? 'Drop the image here' : 'Drag & drop a new image, or click to select'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Supported formats: PNG, JPG, JPEG, WebP (max 5MB)
                                </Typography>
                            </DropzoneBox>
                            {newImage && (
                                <Box sx={{ mt: 2 }}>
                                    <ImagePreview
                                        src={newImage.preview}
                                        alt={newImage.name}
                                    />
                                    <Box sx={{
                                        mt: 1,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {newImage.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {(newImage.size / 1024 / 1024).toFixed(2)} MB
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label="New Image"
                                        color="secondary"
                                        variant="outlined"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                            )}
                        </Grid>
                    </Grid>

                    <Box sx={{
                        mt: 4,
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'flex-end',
                        flexWrap: 'wrap',
                    }}>
                        <ActionButton
                            variant="outlined"
                            onClick={() => {
                                setEditModalOpen(false);
                                setNewImage(null);
                            }}
                            disabled={updateMutation.isLoading}
                            component={motion.button}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Cancel
                        </ActionButton>
                        <ActionButton
                            variant="contained"
                            onClick={handleUpdate}
                            disabled={updateMutation.isLoading || !newImage}
                            startIcon={updateMutation.isLoading ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : null}
                            sx={{
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            }}
                            component={motion.button}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {updateMutation.isLoading ? 'Updating...' : 'Update Image'}
                        </ActionButton>
                    </Box>
                </ModalBox>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="delete-confirm-dialog"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id="delete-confirm-dialog">
                    Confirm Image Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this image from the category "{deleteTarget?.category}"?
                    </DialogContentText>
                    <Box sx={{
                        mt: 2,
                        display: 'flex',
                        justifyContent: 'center',
                    }}>
                        <Avatar
                            src={`${BASE_IMAGE_URL}${deleteTarget?.imagePath}`}
                            alt="Image to delete"
                            sx={{
                                width: 120,
                                height: 120,
                                border: `2px solid ${theme.palette.error.main}`,
                            }}
                        />
                    </Box>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        This action cannot be undone. The image will be permanently deleted.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <ActionButton
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={deleteMutation.isLoading}
                        variant="outlined"
                        color="inherit"
                    >
                        Cancel
                    </ActionButton>
                    <ActionButton
                        onClick={confirmDelete}
                        color="error"
                        disabled={deleteMutation.isLoading}
                        startIcon={deleteMutation.isLoading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : <DeleteIcon />}
                        variant="contained"
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                        }}
                    >
                        {deleteMutation.isLoading ? 'Deleting...' : 'Delete Image'}
                    </ActionButton>
                </DialogActions>
            </Dialog>

            {/* Toast Container */}
            <ToastContainer {...toastOptions} />

            {/* Snackbar for error messages */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{ width: '100%' }}
                    iconMapping={{
                        error: <ErrorIcon fontSize="inherit" />,
                        success: <CheckCircleIcon fontSize="inherit" />,
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ManageCategoriesPage;