import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "../../service/categoryService";

export const useCategoriesQuery = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: categoryService.getAllCategoriesWithImages,
        // Customize retry and stale time
        retry: 1, // Reduce retries to avoid overloading the server
        staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
        onError: (error) => {
            console.error("Failed to fetch categories:", error.message);
            // Optionally, trigger a global error notification
        },
    });
};

export const useCategoryImagesQuery = (category) => {
    return useQuery({
        queryKey: ["categoryImages", category],
        queryFn: () => categoryService.getCategoryImages(category),
        enabled: !!category,
        retry: 1,
        staleTime: 5 * 60 * 1000,
        select: (data) => ({
            // Normalize response to match getAllCategoriesWithImages
            category: data.category,
            images: data.images.map((img, index) => ({
                id: img.id, // Note: Replace with backend-provided ID if available
                image_path: img.image_path,
            })),
        }),
        onError: (error) => {
            console.error(`Failed to fetch images for ${category}:`, error.message);
        },
    });
};

export const useUploadCategoryMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ category, images }) => categoryService.uploadCategory(category, images),
        onSuccess: (_, { category }) => {
            // Invalidate both categories and specific category images
            queryClient.invalidateQueries(["categories"]);
            queryClient.invalidateQueries(["categoryImages", category]);
        },
        onError: (error) => {
            console.error("Upload failed:", error.message);
            // Trigger UI notification (e.g., toast)
            return { error: error.message }; // Return for component-level handling
        },
    });
};

export const useUpdateCategoryImageMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ category, oldImagePath, newImage }) =>
            categoryService.updateCategoryImage(category, oldImagePath, newImage),
        onMutate: async ({ category, oldImagePath, newImage }) => {
            await queryClient.cancelQueries(["categoryImages", category]);
            const previousData = queryClient.getQueryData(["categoryImages", category]);

            // Optimistic update
            queryClient.setQueryData(["categoryImages", category], (old) => {
                if (!old?.images) return old;
                return {
                    ...old,
                    images: old.images.map((img) =>
                        img.image_path === oldImagePath
                            ? { ...img, image_path: `temp_${newImage.name}` } // Temporary path
                            : img
                    ),
                };
            });

            return { previousData };
        },
        onError: (err, { category }, { previousData }) => {
            queryClient.setQueryData(["categoryImages", category], previousData);
            console.error("Update failed:", err.message);
            return { error: err.message };
        },
        onSuccess: (_, { category }) => {
            queryClient.invalidateQueries(["categoryImages", category]);
            queryClient.invalidateQueries(["categories"]);
        },
    });
};

export const useDeleteCategoryImageMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ category, imagePath }) =>
            categoryService.deleteCategoryImage(category, imagePath),
        onMutate: async ({ category, imagePath }) => {
            await queryClient.cancelQueries(["categoryImages", category]);
            const previousData = queryClient.getQueryData(["categoryImages", category]);

            // Optimistic update
            queryClient.setQueryData(["categoryImages", category], (old) => {
                if (!old?.images) return old;
                return {
                    ...old,
                    images: old.images.filter((img) => img.image_path !== imagePath),
                };
            });

            return { previousData };
        },
        onError: (err, { category }, { previousData }) => {
            queryClient.setQueryData(["categoryImages", category], previousData);
            console.error("Delete failed:", err.message);
            return { error: err.message };
        },
        onSettled: (_, __, { category }) => {
            queryClient.invalidateQueries(["categoryImages", category]);
            queryClient.invalidateQueries(["categories"]);
        },
    });
};