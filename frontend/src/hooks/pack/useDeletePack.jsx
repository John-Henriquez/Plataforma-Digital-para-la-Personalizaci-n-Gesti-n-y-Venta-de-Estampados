import { useState } from 'react';
import { deletePack } from '../../services/pack.service';

const useDeletePack = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const remove = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deletePack(id);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error };
};

export default useDeletePack;
