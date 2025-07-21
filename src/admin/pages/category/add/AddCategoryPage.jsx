import React, { useState, useEffect } from 'react';
import { useUploadCategoryMutation } from '../../../hooks/category/useCategories';
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    Grid,
    Paper,
    styled,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    maxWidth: 900,
    margin: 'auto',
    borderRadius: 12,
    boxShadow: theme.shadows[4],
    background: 'linear-gradient(145deg, #ffffff, #f9f9f9)',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
    },
}));

const DropzoneBox = styled(Box)(({ theme, isDragActive }) => ({
    border: `2px dashed ${isDragActive ? theme.palette.primary.main : '#ccc'}`,
    borderRadius: 8,
    padding: theme.spacing(4),
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: isDragActive ? theme.palette.primary.light : '#fafafa',
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: theme.palette.grey[100],
        borderColor: theme.palette.primary.main,
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
    },
}));

const FilePreviewCard = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    textAlign: 'center',
    position: 'relative',
    transition: 'transform 0.2s ease',
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: theme.shadows[2],
    },
}));

const DeleteButton = styled(Button)(({ theme }) => ({
    position: 'absolute',
    top: -10,
    right: -10,
    minWidth: 30,
    width: 30,
    height: 30,
    borderRadius: '50%',
    backgroundColor: theme.palette.error.main,
    color: '#fff',
    '&:hover': {
        backgroundColor: theme.palette.error.dark,
    },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
    borderRadius: 8,
    padding: theme.spacing(1.5, 4),
    textTransform: 'none',
    fontWeight: 600,
    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
    [theme.breakpoints.down('sm')]: {
        width: '100%',
    },
}));

// Custom toast styles
const toastOptions = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progressStyle: { background: '#1976d2' },
    style: {
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontFamily: '"Roboto", sans-serif',
    },
};

const AddCategoryPage = () => {
    const [categoryName, setCategoryName] = useState('');
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const { mutate: uploadCategory, isLoading, error: mutationError } = useUploadCategoryMutation();

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        multiple: true,
        maxSize: 5 * 1024 * 1024, // 5MB limit
        onDrop: (acceptedFiles, fileRejections) => {
            if (fileRejections.length > 0) {
                const reasons = fileRejections
                    .map((rej) => rej.errors.map((err) => `${rej.file.name}: ${err.message}`).join(', '))
                    .join('; ');
                setError(`File rejections: ${reasons}`);
                toast.error(`File rejections: ${reasons}`, toastOptions);
            } else {
                files.forEach((file) => URL.revokeObjectURL(file.preview));
                setFiles(
                    acceptedFiles.map((file) =>
                        Object.assign(file, { preview: URL.createObjectURL(file) })
                    )
                );
                setError(null);
            }
        },
    });

    // Clean up object URLs
    useEffect(() => {
        return () => {
            files.forEach((file) => URL.revokeObjectURL(file.preview));
        };
    }, [files]);

    const handleRemoveFile = (indexToRemove) => {
        const newFiles = files.filter((_, index) => index !== indexToRemove);
        files[indexToRemove] && URL.revokeObjectURL(files[indexToRemove].preview);
        setFiles(newFiles);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const sanitizedCategory = categoryName.trim();
        if (!sanitizedCategory) {
            setError('Category name is required');
            toast.error('Category name is required', toastOptions);
            return;
        }
        if (!/^[a-zA-Z0-9\s]+$/.test(sanitizedCategory)) {
            setError('Category name can only contain letters, numbers, and spaces');
            toast.error('Category name can only contain letters, numbers, and spaces', toastOptions);
            return;
        }
        if (files.length === 0) {
            setError('At least one image is required');
            toast.error('At least one image is required', toastOptions);
            return;
        }

        uploadCategory(
            { category: sanitizedCategory, images: files },
            {
                onSuccess: (data) => {
                    toast.success(
                        <Box display="flex" alignItems="center">
                            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                            {data.message || 'Category and images uploaded successfully!'}
                        </Box>,
                        toastOptions
                    );
                    setCategoryName('');
                    setFiles([]);
                    setError(null);
                },
                onError: (err) => {
                    const errorMessage = err.message || 'Failed to upload category';
                    setError(errorMessage);
                    toast.error(errorMessage, toastOptions);
                },
            }
        );
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                    fontWeight: 700,
                    color: '#1a237e',
                    textAlign: { xs: 'center', md: 'left' },
                }}
            >
                Add New Category
            </Typography>
            <StyledPaper elevation={0}>
                <form onSubmit={handleSubmit} noValidate>
                    <TextField
                        fullWidth
                        label="Category Name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        margin="normal"
                        required
                        variant="outlined"
                        error={!!error && error.includes('Category name')}
                        helperText={
                            error && error.includes('Category name') ? error : 'Enter a unique category name'
                        }
                        inputProps={{ pattern: '[a-zA-Z0-9\\s]+' }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 8,
                                '& fieldset': { borderColor: '#bdbdbd' },
                                '&:hover fieldset': { borderColor: '#1976d2' },
                            },
                        }}
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    />

                    <DropzoneBox
                        {...getRootProps()}
                        isDragActive={isDragActive}
                        role="region"
                        aria-label="Drag and drop images here"
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <input {...getInputProps()} />
                        <CloudUploadIcon
                            sx={{ fontSize: 40, color: isDragActive ? 'primary.main' : 'grey.600', mb: 1 }}
                        />
                        <Typography variant="body1" color={isDragActive ? 'primary.main' : 'text.primary'}>
                            Drag & drop images here, or click to select files
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            (PNG, JPG, JPEG, WebP; max 5MB; at least 1 image required)
                        </Typography>
                    </DropzoneBox>

                    <AnimatePresence>
                        {files.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                                    Selected Files ({files.length})
                                </Typography>
                                <Grid container spacing={2}>
                                    {files.map((file, index) => (
                                        <Grid item xs={6} sm={4} md={3} key={index}>
                                            <FilePreviewCard
                                                component={motion.div}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                            >
                                                <DeleteButton
                                                    size="small"
                                                    onClick={() => handleRemoveFile(index)}
                                                    aria-label={`Remove ${file.name}`}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </DeleteButton>
                                                <img
                                                    src={file.preview}
                                                    alt={file.name}
                                                    style={{
                                                        width: '100%',
                                                        height: 'auto',
                                                        maxHeight: 100,
                                                        objectFit: 'contain',
                                                        borderRadius: 4,
                                                    }}
                                                />
                                                <Typography noWrap variant="caption" color="text.secondary">
                                                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </Typography>
                                            </FilePreviewCard>
                                        </Grid>
                                    ))}
                                </Grid>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Box sx={{ mt: 4, textAlign: { xs: 'center', md: 'left' } }}>
                        <SubmitButton
                            type="submit"
                            variant="contained"
                            disabled={isLoading || !categoryName.trim() || files.length === 0}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                            component={motion.button}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isLoading ? 'Uploading...' : 'Upload Category'}
                        </SubmitButton>
                    </Box>

                    {(error || mutationError) && (
                        <Typography
                            color="error"
                            sx={{ mt: 2, textAlign: 'center' }}
                            component={motion.div}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {error || mutationError?.message}
                        </Typography>
                    )}
                </form>
            </StyledPaper>
            <ToastContainer {...toastOptions} />
        </Box>
    );
};

export default AddCategoryPage;