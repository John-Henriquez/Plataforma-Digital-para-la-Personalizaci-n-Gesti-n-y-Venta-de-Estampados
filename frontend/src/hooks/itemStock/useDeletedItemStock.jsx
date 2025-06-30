import { useState, useCallback } from 'react';
import { getDeletedItemStock } from '../../services/itemStock.service';

export function useDeletedItemStock() {
  const [deletedStock, setDeletedStock] = useState([]);
  const [loadingDeletedStock, setLoadingDeletedStock] = useState(false);

  const fetchDeletedStock = useCallback(async () => {
    setLoadingDeletedStock(true);
    try {
      const response = await getDeletedItemStock();
      if (response.error) throw new Error(response.error);
      setDeletedStock(response.data || response);
    } catch (error) {
      console.error("Error al cargar stock eliminado:", JSON.stringify(error, null, 2));
    } finally {
      setLoadingDeletedStock(false);
    }
  }, []);

  return { deletedStock, loadingDeletedStock, fetchDeletedStock };
}
