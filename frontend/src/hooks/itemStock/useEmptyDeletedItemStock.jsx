import { useState, useCallback } from 'react';
import { emptyDeletedItemStock } from '../../services/itemStock.service';

export function useEmptyDeletedItemStock() {
  const [emptying, setEmptying] = useState(false);

  const emptyTrash = useCallback(async () => {
    setEmptying(true);
    try {
      await emptyDeletedItemStock();
    } finally {
      setEmptying(false);
    }
  }, []);

  return { emptyTrash, emptying };
}
