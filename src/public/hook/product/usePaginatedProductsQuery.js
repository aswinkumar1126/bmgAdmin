import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../../service/ProductService";

export const usePaginatedProductsQuery = (catname, page, pageSize = 50) => {
    return useQuery({
        queryKey: ["paginatedProducts", catname, page],
        queryFn: () => getAllProducts(catname, page, pageSize),
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000,
    });
};
