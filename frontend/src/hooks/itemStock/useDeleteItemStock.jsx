import { useState } from 'react';
import { deleteItemStock as deleteItemStockService } from '../../services/itemStock.service';

const useDeleteItemStock = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteItemStock = async (id) => {
    setLoading(true);
    try {
      const updatedItem = await deleteItemStockService(id);
      return updatedItem;
    } catch (err) {
      const errorMsg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { deleteItemStock, loading, error };
};

export default useDeleteItemStock;
