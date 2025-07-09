import { useState } from 'react';
import { updatePack } from '../../services/pack.service';

const useEditPack = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const edit = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const updatedPack = await updatePack(id, data);
      return updatedPack;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { edit, loading, error };
};

export default useEditPack;
