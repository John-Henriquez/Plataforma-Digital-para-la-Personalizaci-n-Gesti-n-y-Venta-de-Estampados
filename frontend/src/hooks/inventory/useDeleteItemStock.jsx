import { useState } from 'react';
import { deleteItemStock as deleteItemStockService } from '../../services/inventory.service';

const useDeleteItemStock = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteItemStock = async (id) => {
    setLoading(true);
    try {
      const updatedItem = await deleteItemStockService(id);
      return updatedItem;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { deleteItemStock, loading, error };
};

export default useDeleteItemStock;
