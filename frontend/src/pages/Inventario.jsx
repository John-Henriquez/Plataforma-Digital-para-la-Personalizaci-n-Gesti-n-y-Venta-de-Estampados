import { useState, useContext } from 'react';
import AddItemTypeModal from './AddItemTypeModal.jsx';
import useInventory from '../hooks/inventory/useInventory';
import useDeleteItemStock from '../hooks/inventory/useDeleteItemStock';
import useEditItemStock from '../hooks/inventory/useEditItemStock';
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
import './../styles/pages/inventario.css'; 

const Inventario = () => {
  const [openAddType, setOpenAddType] = useState(false);
  const [openAddStock, setOpenAddStock] = useState(false);

  const { deleteItemStock } = useDeleteItemStock();

  const handleDelete = async (id) => {
    const result = await deleteDataAlert();

    if (result.isConfirmed) {
      try {
        await deleteItemStock(id);
        showSuccessAlert('Eliminado', 'El item fue eliminado correctamente');
        refetch();
      } catch (error) {
        showErrorAlert('Error al eliminar', error.message || 'Ocurrió un error inesperado');
      }
    }
  };

  const { handleEdit } = useEditItemStock();

  const { isAuthenticated, user } = useContext(AuthContext);
  const {
    itemTypes,
    itemStock,
    loading,
    error,
    filters,
    setFilters,
    refetch,
  } = useInventory();

  if (!isAuthenticated || user?.rol !== 'administrador') {
    return <Navigate to="/auth" />;
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    refetch();
  };

  return (
    <Box className="inventory-container">
      <Typography className="inventory-title" variant="h4" gutterBottom>
        Gestión de Inventario
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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

      {loading ? (
        <div className="inventory-loading">
          <CircularProgress />
        </div>
      ) : (
        <>
          <Paper className="inventory-paper">
            <Typography variant="h5">
              Tipos de Productos ({itemTypes.length})
            </Typography>
            <ul className="inventory-list">
              {itemTypes.map((type) => (
                <li key={type.id}>
                  {type.name} - {type.category}
                  {type.sizesAvailable?.length > 0 && (
                    <span> (Tallas: {type.sizesAvailable.join(', ')})</span>
                  )}
                </li>
              ))}
            </ul>
          </Paper>

          <Paper className="inventory-paper">
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenAddType(true)}
                className="inventory-button"
              >
                Nuevo Tipo
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setOpenAddStock(true)}
                className="inventory-button"
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
                    <Typography className="inventory-item-details">
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
                        onClick={() => handleDelete(item.id)}
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
        onCreated={refetch}
      />
    </Box>
  );
};

export default Inventario;