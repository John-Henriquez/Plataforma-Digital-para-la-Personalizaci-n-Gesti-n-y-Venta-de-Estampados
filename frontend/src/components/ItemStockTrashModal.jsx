import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CloseIcon from '@mui/icons-material/Close';
import { showSuccessAlert, showErrorAlert, deleteDataAlert } from '../helpers/sweetAlert';
import { useEmptyDeletedItemStock } from '../hooks/itemStock/useEmptyDeletedItemStock.jsx';
import { useRestoreItemStock } from '../hooks/itemStock/useRestoreItemStock.jsx';
import { useForceDeleteItemStock } from '../hooks/itemStock/useForceDeleteItemStock.jsx';
import { COLOR_DICTIONARY } from '../data/colorDictionary';
import './../styles/components/trashModal.css';

const ItemStockTrashModal = ({ open, onClose, trashedItems, onRefresh }) => {
  const { emptyTrash, loading: emptyingTrash } = useEmptyDeletedItemStock();
  const { restore, loading: restoring } = useRestoreItemStock();
  const { forceDelete, loading: deleting } = useForceDeleteItemStock();
  const [forceDeletingId, setForceDeletingId] = useState(null);

  const handleEmptyTrash = async () => {
    const result = await deleteDataAlert(
      '¿Vaciar la papelera?',
      'Esta acción eliminará permanentemente todos los elementos y no se podrá deshacer.'
    );
    if (!result.isConfirmed) return;

    try {
      await emptyTrash();
      showSuccessAlert('Papelera vaciada', 'Todos los elementos han sido eliminados permanentemente.');
      onRefresh();
      onClose();
    } catch (err) {
      console.error('[handleEmptyTrash] Error:', err);
      showErrorAlert('Error al vaciar', 'Ocurrió un problema al vaciar la papelera.');
    }
  };

  const getColorNameFromHex = (hex) => {
    if (!hex) return '';
    const color = COLOR_DICTIONARY.find((c) => c.hex.toUpperCase() === hex.toUpperCase());
    return color ? color.name : hex;
  };

  const handleRestore = async (id) => {
    try {
      await restore(id);
      showSuccessAlert('Restaurado', 'El stock ha sido restaurado.');
      
      onRefresh();
      onClose();
    } catch (err) {
      console.error('[handleRestore] Error:', err);
      showErrorAlert('Error al restaurar', 'Ocurrió un problema al restaurar el stock.');
    }
  };

  const handleForceDelete = async (id) => {
    const result = await deleteDataAlert(
      '¿Eliminar permanentemente este stock?',
      'Esta acción no se puede deshacer.'
    );
    if (!result.isConfirmed) return;

    try {
      setForceDeletingId(id);
      await forceDelete(id);
      showSuccessAlert('Eliminado', 'El stock ha sido eliminado permanentemente.');
      onRefresh();
    } catch (err) {
      console.error(`[handleForceDelete] Error eliminando ID ${id}:`, err);
      showErrorAlert('Error al eliminar', 'Ocurrió un problema al eliminar el stock.');
    } finally {
      setForceDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" className="trash-modal">
      <DialogTitle className="trash-modal__header">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" className="trash-modal__title">
            Papelera de Stock de Inventario
          </Typography>
          <IconButton onClick={onClose} className="trash-modal__close-button">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent className="trash-modal__content">
        {(trashedItems || []).length === 0 ? (
          <Box className="trash-modal__empty-state">
            <Typography variant="h6" color="textSecondary" fontStyle="italic">
              La papelera está vacía 📭
            </Typography>
          </Box>
        ) : (
          <List className="trash-modal__list">
            {trashedItems.map((item) => (
              <ListItem
                key={item.id}
                className="trash-modal__item"
                secondaryAction={
                  <Box className="trash-modal__actions">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleRestore(item.id)}
                      className="trash-modal__button trash-modal__button--restore"
                      startIcon={<RestoreFromTrashIcon />}
                      disabled={restoring}
                    >
                      Restaurar
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleForceDelete(item.id)}
                      className="trash-modal__button trash-modal__button--delete"
                      startIcon={<DeleteForeverIcon />}
                      disabled={deleting && forceDeletingId === item.id}
                    >
                      Eliminar permanentemente
                    </Button>
                  </Box>
                }
              >
                <ListItemText
                  primary={`Producto: ${item.itemType?.name} — ${item.size || 'Talla única'}`}
                  secondary={`Color: ${getColorNameFromHex(item.hexColor)} • Cantidad: ${item.quantity} • Precio unitario: $${item.price}`}
                  className="trash-modal__item-text"
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions className="trash-modal__footer">
        {(trashedItems || []).length > 0 && (
          <Button
            onClick={handleEmptyTrash}
            disabled={emptyingTrash}
            className="trash-modal__button trash-modal__button--empty"
            startIcon={<DeleteSweepIcon />}
          >
            Vaciar Papelera
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ItemStockTrashModal;
