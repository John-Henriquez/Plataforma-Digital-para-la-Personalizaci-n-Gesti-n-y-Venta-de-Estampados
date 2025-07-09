import { useState } from 'react';
import { createPack } from '../../services/pack.service';

const useCreatePack = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = async (packData) => {
    try {
      setLoading(true);
      setError(null);
      const newPack = await createPack(packData);
      return newPack;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};

export default useCreatePack;
