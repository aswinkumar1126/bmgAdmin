// hooks/useCategoryProducts.js
import { useQuery } from '@tanstack/react-query';
import { getAllProducts } from '../../service/ProductService';

export const useCategoryProducts = (categories) => {
    return useQuery({
        queryKey: ['categoryProducts'],
        queryFn: async () => {
            if (!categories || categories.length === 0) return {};

            const results = {};
            await Promise.all(
                categories.map(async (category) => {
                    try {
                        const data = await getAllProducts(category, 1, 50);
                        results[category] = data;
                    } catch (error) {
                        console.error(`Error fetching products for category ${category}:`, error);
                        results[category] = [];
                    }
                })
            );
            return results;
        },
        enabled: !!categories && categories.length > 0,
        staleTime: 5 * 60 * 1000,
    });
};