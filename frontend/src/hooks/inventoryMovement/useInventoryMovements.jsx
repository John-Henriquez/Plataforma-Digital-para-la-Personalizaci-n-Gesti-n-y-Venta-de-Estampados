import { useState, useEffect, useCallback } from 'react';
import { getInventoryMovements } from '../../services/inventoryMovement.service';

const initialFilters = {
  startDate: '',
  endDate: '',
  type: '',
  itemStockId: '',
  createdBy: '',
};

const useInventoryMovements = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [movements, setMovements] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { movements, totals } = await getInventoryMovements(filters);
      setMovements(movements);
      setTotals(totals);
    } catch (err) {
      console.error('Error in useInventoryMovements:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return {
    movements,
    totals,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchMovements,
  };
};

export default useInventoryMovements;
