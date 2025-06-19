import { useState } from 'react';
import { updateItemStock } from '../../services/itemStock.service';

const useEditItemStock = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const editItemStock = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedItem = await updateItemStock(id, updatedData);
      return updatedItem;
    } catch (err) {
      setError(err.message || 'Error al actualizar');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { editItemStock, loading, error };
};

export default useEditItemStock;
