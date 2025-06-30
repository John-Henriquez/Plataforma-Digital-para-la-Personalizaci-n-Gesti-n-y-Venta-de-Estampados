import { useState, useCallback } from 'react';
import { emptyDeletedItemStock } from '../../services/itemStock.service';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '../../helpers/sweetAlert';

export function useEmptyDeletedItemStock(onRefresh) {
  const [emptying, setEmptying] = useState(false);

  const emptyTrash = useCallback(async () => {
    const result = await deleteDataAlert(
      '¿Vaciar papelera de stock?',
      'Esta acción eliminará permanentemente todos los elementos desactivados.'
    );
    if (!result.isConfirmed) return;

    setEmptying(true);
    try {
      await emptyDeletedItemStock();
      showSuccessAlert('Papelera de stock vaciada', 'Todos los elementos se eliminaron para siempre.');
      if (onRefresh) onRefresh();
    } catch (err) {
      showErrorAlert('Error al vaciar', err.message || err);
    }
    setEmptying(false);
  }, [onRefresh]);

  return { emptyTrash, emptying };
}
