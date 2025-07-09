import { useState } from 'react';
import { forceDeletePack } from '../../services/pack.service';

const useForceDeletePack = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const forceDelete = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await forceDeletePack(id);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { forceDelete, loading, error };
};

export default useForceDeletePack;
