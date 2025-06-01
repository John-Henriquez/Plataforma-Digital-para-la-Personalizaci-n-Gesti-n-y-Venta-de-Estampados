import { useState, useEffect } from 'react';
import { getItemTypes, getItemStock } from '@services/inventory.service';

const useInventory = () => {
    const [itemTypes, setItemTypes] = useState([]);
    const [itemStock, setItemStock] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInventoryData = async () => {
        try {
            setLoading(true);
            const [types, stock] = await Promise.all([
                getItemTypes(),
                getItemStock()
            ]);
            setItemTypes(types);
            setItemStock(stock);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventoryData();
    }, []);

    return { 
        itemTypes, 
        itemStock, 
        loading, 
        refetch: fetchInventoryData 
    };
};

export default useInventory;