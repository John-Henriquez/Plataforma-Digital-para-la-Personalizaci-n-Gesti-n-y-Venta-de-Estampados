import { useState } from 'react';
import { emptyDeletedPacks } from '../../services/pack.service';

const useEmptyDeletedPacks = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const emptyTrash = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await emptyDeletedPacks();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { emptyTrash, loading, error };
};

export default useEmptyDeletedPacks;
