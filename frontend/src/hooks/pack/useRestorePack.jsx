import { useState } from 'react';
import { restorePack } from '../../services/pack.service';

const useRestorePack = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const restore = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const restored = await restorePack(id);
      return restored;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { restore, loading, error };
};

export default useRestorePack;
