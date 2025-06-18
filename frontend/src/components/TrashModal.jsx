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
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert.js';
import { useEmptyTrash } from '../hooks/itemType/useEmptyTrash';
import { useForceDeleteItemType } from '../hooks/itemType/useForceDeleteItemType';
import './../styles/components/trashModal.css';

const TrashModal = ({ open, onClose, trashedTypes, onRestore, onRefresh }) => {
  const { empty, loading: emptyingTrash } = useEmptyTrash();
  const { forceDelete, loading: deleting } = useForceDeleteItemType();

  const handleEmptyTrash = async () => {
    const result = await deleteDataAlert(
      '¿Vaciar la papelera?',
      'Esta acción eliminará permanentemente todos los elementos y no se podrá deshacer.'
    );

    if (result.isConfirmed) {
      try {
        await empty();
        showSuccessAlert('Papelera vaciada', 'Todos los elementos han sido eliminados permanentemente.');
        onRefresh();
      } catch (err) {
        console.error('[handleEmptyTrash] Error:', err);
        showErrorAlert('Error al vaciar', 'Ocurrió un problema al vaciar la papelera.');
      }
    }
  };

  const handleForceDelete = async (id) => {
    try {
      await forceDelete(id);
      onRefresh();
    } catch (err) {
      console.error(`[handleForceDelete] Error eliminando ID ${id}:`, err);
    }
  };

  const handleRestore = (id) => {
    onRestore(id);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" className="trash-modal">
      <DialogTitle className="trash-modal__header">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" className="trash-modal__title">
            Papelera de Tipos de Productos
          </Typography>
          <IconButton onClick={onClose} className="trash-modal__close-button">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent className="trash-modal__content">
        {trashedTypes.length === 0 ? (
          <Box className="trash-modal__empty-state">
            <Typography variant="body1">La papelera está vacía</Typography>
          </Box>
        ) : (
          <List className="trash-modal__list">
            {trashedTypes.map((type) => (
              <ListItem 
                key={type.id} 
                className="trash-modal__item"
                secondaryAction={
                  <Box className="trash-modal__actions">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleRestore(type.id)}
                      className="trash-modal__button trash-modal__button--restore"
                    >
                      Restaurar
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleForceDelete(type.id)}
                      disabled={deleting}
                      className="trash-modal__button trash-modal__button--delete"
                    >
                      Eliminar
                    </Button>
                  </Box>
                }
              >
                <ListItemText
                  primary={type.name}
                  secondary={`Categoría: ${type.category} | Tallas: ${type.sizesAvailable?.join(', ') || 'N/A'}`}
                  className="trash-modal__item-text"
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      
      <DialogActions className="trash-modal__footer">
        <Button 
          onClick={onClose} 
          className="trash-modal__button trash-modal__button--close"
        >
          Cerrar
        </Button>
        {trashedTypes.length > 0 && (
          <Button 
            onClick={handleEmptyTrash}
            disabled={emptyingTrash}
            className="trash-modal__button trash-modal__button--empty"
          >
            Vaciar Papelera
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TrashModal;