import axiosInstance from '../api/axiosInstance';

// Helper function to parse JSON safely
const parseImagePaths = (imagePath) => {
    try {
        return JSON.parse(imagePath) || [];
    } catch (error) {
        console.error('Failed to parse image_path:', error);
        return [];
    }
};

export const categoryService = {
    uploadCategory: async (category, images) => {
        try {
            // Validate inputs
            if (!category || !images || images.length === 0) {
                throw new Error('Category and at least one image are required');
            }
            // Optional: Validate file types
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            for (const image of images) {
                if (!validTypes.includes(image.type)) {
                    throw new Error(`Invalid file type for ${image.name}. Only JPEG, PNG, and WebP are allowed.`);
                }
            }

            const formData = new FormData();
            formData.append('category', category);
            images.forEach((image) => {
                formData.append('images', image);
            });

            const response = await axiosInstance.post('/category_image/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || error.message || 'Failed to upload category');
        }
    },

    getCategoryImages: async (category) => {
        try {
            if (!category) {
                throw new Error('Category is required');
            }

            const response = await axiosInstance.get('/category_image/get', {
                params: { category }
            });

            const imagePaths = parseImagePaths(response.data.image_path);
            return {
                category,
                images: imagePaths.map((path, index) => ({
                    id: index, // Note: Consider using backend-provided IDs if available
                    image_path: path
                }))
            };
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to fetch category images');
        }
    },

    updateCategoryImage: async (category, oldImagePath, newImage) => {
        try {
            if (!category || !oldImagePath || !newImage) {
                throw new Error('Category, old image path, and new image are required');
            }
            // Optional: Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!validTypes.includes(newImage.type)) {
                throw new Error(`Invalid file type for ${newImage.name}. Only JPEG, PNG, and WebP are allowed.`);
            }

            const formData = new FormData();
            formData.append('category', category);
            formData.append('oldImagePath', oldImagePath);
            formData.append('newImage', newImage);

            const response = await axiosInstance.put('/category_image/update-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to update category image');
        }
    },

    deleteCategoryImage: async (category, imagePath) => {
        try {
            if (!category || !imagePath) {
                throw new Error('Category and image path are required');
            }

            const response = await axiosInstance.delete('/category_image/delete', {
                params: { category, imagePath }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to delete category image');
        }
    },

    getAllCategoriesWithImages: async () => {
        try {
            const response = await axiosInstance.get('/category_image/getAllCategories');
            return response.data.categories.map((cat) => ({
                id: cat.id,
                category_name: cat.category_name,
                images: parseImagePaths(cat.image_path)
            }));
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to fetch all categories');
        }
    }
};