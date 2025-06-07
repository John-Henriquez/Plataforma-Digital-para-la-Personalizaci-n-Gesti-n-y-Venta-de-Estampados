import { useState } from 'react';
import { createItemType } from '../../services/inventory.service';

export const useCreateItemType = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addType = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await createItemType(formData);
      setLoading(false);
      return data;  
    } catch (err) {
      setError(err.message || 'Error al crear el tipo de ítem');
      setLoading(false);
      throw err; 
    }
  };

  return { addType, loading, error };
};
