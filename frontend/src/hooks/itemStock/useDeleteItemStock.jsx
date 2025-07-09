import { useState } from 'react';
import { deleteItemStock as deleteItemStockService } from '../../services/itemStock.service';

const useDeleteItemStock = () => {
  const [loading, setLoading] = useState(false);

  const deleteItemStock = async (id) => {
    setLoading(true);
    const [result, error] = await deleteItemStockService(id);
    setLoading(false);
    return [result, error];
  };

  return { deleteItemStock, loading };
};

export default useDeleteItemStock;
