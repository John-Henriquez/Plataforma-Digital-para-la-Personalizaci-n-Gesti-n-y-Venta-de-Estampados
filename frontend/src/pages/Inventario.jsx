import { useEffect, useState, useContext } from 'react';
import AddItemTypeModal from '../components/AddItemTypeModal.jsx';
import useItemStock from '../hooks/itemStock/useItemStock.jsx';
import useDeleteItemStock from '../hooks/itemStock/useDeleteItemStock';
import useEditItemStock from '../hooks/itemStock/useEditItemStock';
import { useItemTypes } from '../hooks/itemType/useItemType.jsx';
import { useDeleteItemType } from '../hooks/itemType/useDeleteItemType';
import { useRestoreItemType } from '../hooks/itemType/useRestoreItemType';
import { AuthContext } from '../context/AuthContext';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert.js';
import {
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import '../styles/pages/inventario.css';

const Inventario = () => {
  const [openAddType, setOpenAddType] = useState(false);
  const [openAddStock, setOpenAddStock] = useState(false); // Corregido

  const { isAuthenticated, user } = useContext(AuthContext);
  const { itemStock, loading: stockLoading, error: stockError, filters, setFilters, refetch: refetchStock } = useItemStock();
  const { types: itemTypes, fetchTypes, loading: typesLoading, error: typesError } = useItemTypes();
  const { deleteItemStock } = useDeleteItemStock();
  const { deleteItemType } = useDeleteItemType();
  const { restoreType } = useRestoreItemType();
  const { handleEdit } = useEditItemStock();

  // Cargar tipos de ítems al montar el componente
  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  if (!isAuthenticated || user?.rol !== 'administrador') {
    return <Navigate to="/auth" />;
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    refetchStock();
  };

  const handleDeleteStock = async (id) => {
    const result = await deleteDataAlert();
    if (result.isConfirmed) {
      try {
        await deleteItemStock(id);
        showSuccessAlert('Eliminado', 'El item fue eliminado correctamente');
        refetchStock();
      } catch (error) {
        showErrorAlert('Error al eliminar', error || 'Ocurrió un error inesperado');
      }
    }
  };

  const handleDeleteType = async (id) => {
    const result = await deleteDataAlert();
    if (result.isConfirmed) {
      try {
        await deleteItemType(id);
        showSuccessAlert('Eliminado', 'El tipo de ítem fue eliminado correctamente');
        fetchTypes();
      } catch (error) {
        showErrorAlert('Error al eliminar', error || 'Ocurrió un error inesperado');
      }
    }
  };

  const handleRestoreType = async (id) => {
    try {
      await restoreType(id);
      showSuccessAlert('Restaurado', 'El tipo de ítem fue restaurado correctamente');
      fetchTypes();
    } catch (error) {
      showErrorAlert('Error al restaurar', error || 'Ocurrió un error inesperado');
    }
  };

  return (
    <Box className="inventory-container">
      <Typography className="inventory-title" variant="h4" gutterBottom>
        Gestión de Inventario
      </Typography>

      {(stockError || typesError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {stockError || typesError}
        </Alert>
      )}

      <Paper className="inventory-paper">
        <Typography variant="h6">Filtros</Typography>
        <Grid className="inventory-filter-grid" container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Color"
              name="color"
              value={filters.color || ''}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Talla"
              name="size"
              value={filters.size || ''}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              onClick={applyFilters}
              fullWidth
              className="inventory-button"
            >
              Aplicar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {(stockLoading || typesLoading) ? (
        <div className="inventory-loading">
          <CircularProgress />
        </div>
      ) : (
        <>
          <Paper className="inventory-paper">
            <Typography variant="h5">
              Tipos de Productos ({itemTypes.length})
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                className="inventory-button inventory-button--primary"
                onClick={() => setOpenAddType(true)}
              >
                Nuevo Tipo
              </Button>
            </Box>
            <ul className="inventory-list">
              {itemTypes.map((type) => (
                <li key={type.id} className="inventory-list-item">
                  <Box display="flex" alignItems="center" gap={2}>
                    {type.baseImageUrl && (
                      <img src={type.baseImageUrl} alt={type.name} width={24} />
                    )}
                    <span>
                      {type.name} - {type.category}
                      {type.sizesAvailable?.length > 0 && (
                        <span> (Tallas: {type.sizesAvailable.join(', ')})</span>
                      )}
                      {!type.isActive && <span> (Inactivo)</span>}
                    </span>
                  </Box>
                  <Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleDeleteType(type.id)}
                      color="error"
                      className="inventory-button"
                    >
                      Eliminar
                    </Button>
                    {!type.isActive && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleRestoreType(type.id)}
                        className="inventory-button"
                      >
                        Restaurar
                      </Button>
                    )}
                  </Box>
                </li>
              ))}
            </ul>
          </Paper>

          <Paper className="inventory-paper">
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                className="inventory-button inventory-button--secondary"
                onClick={() => setOpenAddStock(true)}
              >
                Nuevo Stock
              </Button>
            </Box>
            <Typography variant="h5">
              Stock Disponible ({itemStock.length})
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {itemStock.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Paper className="inventory-item-card">
                    <Typography variant="h6">
                      {item.itemType?.name || 'Sin tipo'}
                    </Typography>
                    <Typography className="inventory-item-details">
                      Color: {item.color}{' '}
                      {item.hexColor && (
                        <span
                          style={{
                            display: 'inline-block',
                            width: '15px',
                            height: '15px',
                            backgroundColor: item.hexColor,
                            marginLeft: '5px',
                            border: '1px solid #000',
                          }}
                          className="inventory-item-color"
                        />
                      )}
                    </Typography>
                    {item.size && (
                      <Typography className="inventory-item-details">
                        Talla: {item.size}
                      </Typography>
                    )}
                    <Typography className={`inventory-item-details ${item.quantity <= item.minStock ? 'inventory-item-details--low-stock' : item.quantity <= item.minStock * 1.2 ? 'inventory-item-details--warning-stock' : ''}`}>
                      Stock: {item.quantity} (Mín: {item.minStock})
                    </Typography>
                    <Typography className="inventory-item-details">
                      Precio: ${item.price.toLocaleString()}
                    </Typography>
                    <Box className="inventory-action-buttons" sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEdit(item)}
                        className="inventory-button"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleDeleteStock(item.id)}
                        className="inventory-button"
                      >
                        Eliminar
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}
      <AddItemTypeModal
        open={openAddType}
        onClose={() => setOpenAddType(false)}
        onCreated={() => fetchTypes()}
      />
      {/* Agregar modal para añadir stock si es necesario */}
    </Box>
  );
};

export default Inventario;