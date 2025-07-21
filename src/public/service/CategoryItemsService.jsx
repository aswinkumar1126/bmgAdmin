// src/service/CategoryItemsService.js
import PublicUrl from '../api/publicUrl';
import { toast } from 'react-toastify';

// Existing service
export const getItemAndSubItemNames = async (metal) => {
    try {
        const response = await PublicUrl.get(`/product/itemnameAndSubItemname`, {
            params: { metal }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching item and subitem names:", error);
        toast.error("Failed to fetch items");
        return [];
    }
};

// ✅ New service: Fetch filtered items by itemId or itemName
export const getItemFilter = async ({ itemId, itemName, page = 1, pageSize = 20 }) => {
    try {
        // Create URL with all parameters
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('pageSize', pageSize);

        if (itemId) params.append('itemId', itemId.toString());
        if (itemName) params.append('itemName', itemName.trim());

        const response = await PublicUrl.get(
            `/product/getItemFilter?${params.toString()}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching item filters:", error);
        throw error;
    }
  };

  export const getCategory = async()=>{
    try{
        const response = await PublicUrl.get('/product/items/categories');
        return response.data;
    }
    catch(error){
        console.error("Error fetching Categories List");
        throw error;
    }
  }