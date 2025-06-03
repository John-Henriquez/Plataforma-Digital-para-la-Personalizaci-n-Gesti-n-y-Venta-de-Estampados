import { useContext } from 'react';
import useInventory from './../hooks/inventory/useInventory';
import { AuthContext } from './../context/AuthContext'; 
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

const Inventario = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const {
    itemTypes,
    itemStock,
    loading,
    error,
    filters,
    setFilters,
    refetch
  } = useInventory()

  /* console.log('itemStock completo:', itemStock); */

  // Redirigir si no es admin
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
    <Box sx={{ padding: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Inventario
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Filtros</Typography>
        <Grid container spacing={2}>
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
            <Button variant="contained" onClick={applyFilters} fullWidth>
              Aplicar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto' }} />
      ) : (
        <>
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h5">
              Tipos de Productos ({itemTypes.length})
            </Typography>
            <ul>
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

          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5">
              Stock Disponible ({itemStock.length})
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {itemStock.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="h6">
                      {item.itemType?.name || 'Sin tipo'}
                    </Typography>
                    <Typography>
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
                        />
                      )}
                    </Typography>
                    {item.size && <Typography>Talla: {item.size}</Typography>}
                    <Typography>
                      Stock: {item.quantity} (Mín: {item.minStock})
                    </Typography>
                    <Typography>
                      Precio: ${item.price.toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Inventario;