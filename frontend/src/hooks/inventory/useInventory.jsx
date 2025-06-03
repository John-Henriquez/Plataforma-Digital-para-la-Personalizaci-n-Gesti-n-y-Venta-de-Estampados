import { useState, useEffect, useCallback } from 'react';
import { getItemTypes, getItemStock } from '@services/inventory.service';

const initialFilters = {
  color: '',
  size: ''
};

const useInventory = () => {
    const [itemTypes, setItemTypes] = useState([]);
    const [itemStock, setItemStock] = useState([]);
    const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(true);
    const [error] = useState(null);

  const fetchInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      const [types, stock] = await Promise.all([
        getItemTypes(),
        getItemStock(filters)
      ]);
      setItemTypes(types);
      setItemStock(stock);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

    useEffect(() => {
        fetchInventoryData();
    }, [fetchInventoryData]);

    return {
        itemTypes,
        itemStock,
        loading,
        error,
        filters,
        setFilters,
        refetch: fetchInventoryData,
    };
};

export default useInventory;