import { useState, useEffect } from 'react';
import { getPacks } from '../../services/pack.service';

const useDeletedPacks = () => {
  const [deletedPacks, setDeletedPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeleted = async () => {
    try {
      setLoading(true);
      const packs = await getPacks({ isActive: false });
      console.log("Packs eliminados obtenidos:", packs);
      setDeletedPacks(packs);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeleted();
  }, []);

  return { deletedPacks, loading, error, refetch: fetchDeleted };
};

export default useDeletedPacks;
