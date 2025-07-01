import React, { useEffect, useState, useContext, useMemo } from 'react';
import {
  Box, Button, Grid, TextField, Paper, Typography,
  CircularProgress, Alert, MenuItem, InputAdornment,
  FormControl, InputLabel, Select
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

import AddItemTypeModal from '../components/AddItemTypeModal.jsx';
import AddItemStockModal from '../components/AddItemStockModal.jsx';
import ItemTypeTrash from '../components/ItemTypeTrashModal.jsx';
import ItemStockTrash from '../components/ItemStockTrashModal.jsx';

import useItemStock from '../hooks/itemStock/useItemStock.jsx';
import useDeleteItemStock from '../hooks/itemStock/useDeleteItemStock.jsx';

import { useItemTypes } from '../hooks/itemType/useItemType.jsx';
import { useDeleteItemType } from '../hooks/itemType/useDeleteItemType.jsx';
import { useDeletedItemTypes } from '../hooks/itemType/useDeletedItemType.jsx';
import { useRestoreItemType } from '../hooks/itemType/useRestoreItemType.jsx';
import { useRestoreItemStock } from '../hooks/itemStock/useRestoreItemStock.jsx';
import { useDeletedItemStock } from '../hooks/itemStock/useDeletedItemStock.jsx';
import { COLOR_DICTIONARY } from '../data/colorDictionary';

import { iconMap  } from '../data/iconCategories';

import { AuthContext } from '../context/AuthContext.jsx';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';
import '../styles/pages/inventario.css';

const Inventario = () => {
  const [openAddType, setOpenAddType] = useState(false);
  const [editingType] = useState(null);
  const [openAddStock, setOpenAddStock] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [openTrash, setOpenTrash] = useState(false);
  const [openStockTrash, setOpenStockTrash] = useState(false);

  const { deletedStock, fetchDeletedStock } = useDeletedItemStock();

  const { isAuthenticated, user } = useContext(AuthContext);

  const { 
    itemStock, 
    loading: stockLoading, 
    error: stockError, 
    filters, 
    setFilters, 
    refetch: refetchStock 
  } = useItemStock();
  const { 
    types: itemTypes, 
    fetchTypes, 
    loading: typesLoading, 
    error: typesError 
  } = useItemTypes();
  const { 
    deletedTypes, 
    fetchDeletedTypes, 
  } = useDeletedItemTypes();

  const { deleteItemStock } = useDeleteItemStock();
  const { removeType  } = useDeleteItemType();
  const { restoreType } = useRestoreItemType();
  const { restore } = useRestoreItemStock();


  useEffect(() => {
    fetchTypes(); 
  }, [fetchTypes]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

const colorOptions = useMemo(() => {
  const usedHexColors = new Set(
    itemStock
      .filter(item => item.hexColor)  
      .map(item => item.hexColor.toUpperCase()) 
  );

  return COLOR_DICTIONARY.filter(({ hex }) => 
    usedHexColors.has(hex.toUpperCase())
  );
}, [itemStock]);

  const filteredStock = useMemo(() => {
    if (!itemStock) return [];
    
    return itemStock.filter(item => {
      if (!item.itemType) return false; 
      
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        if (!item.itemType.name.toLowerCase().includes(searchTerm) &&
            !item.color.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
      if (filters.typeId && item.itemType.id !== filters.typeId) {
        return false;
      }
      if (filters.color) {
        const selectedHex = COLOR_DICTIONARY.find(c => c.name.toLowerCase() === filters.color.toLowerCase())?.hex;
        if (!selectedHex || item.hexColor?.toLowerCase() !== selectedHex.toLowerCase()) {
          return false;
        }
      }
      if (filters.size && item.size !== filters.size) {
        return false;
      }
      if (filters.stockStatus) {
        if (filters.stockStatus === 'low' && item.quantity > item.minStock) {
          return false;
        }
        if (filters.stockStatus === 'normal' && item.quantity <= item.minStock) {
          return false;
        }
      }
      return true;
    });
  }, [itemStock, filters]);

    if (!isAuthenticated || user?.rol !== 'administrador') {
    return <Navigate to="/auth" />;
  }

  const resetFilters = () => {
    setFilters({
      color: '',
      size: '',
      typeId: '',
      searchTerm: '',
      stockStatus: ''
    });
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
        console.error(error);
        const message = error?.message || 'Ocurrió un error inesperado';
        showErrorAlert('Error al eliminar', message);
      }
    }
  };

  const handleDeleteType = async (id) => {
    const result = await deleteDataAlert();
    if (result.isConfirmed) {
      try {
        await removeType(id);
        showSuccessAlert('Eliminado', 'El tipo de ítem fue eliminado correctamente');
        await Promise.all([
          fetchTypes(),
          refetchStock(), 
        ]);
      } catch (error) {
        console.error(error);
        const message = error?.message || 'Ocurrió un error inesperado';
        showErrorAlert('Error al eliminar', message);
      }
    }
  };

const handleRestoreType = async (id) => {
  try {
    await restoreType(id);
    showSuccessAlert('Restaurado', 'El tipo de ítem fue restaurado correctamente');

    await Promise.all([
      fetchTypes(),          
      fetchDeletedTypes(), 
      refetchStock(),  
    ]);

    setOpenTrash(false); 
  } catch (error) {
    showErrorAlert('Error al restaurar', error?.message || 'Ocurrió un error inesperado');
  }
};

const handleRestoreStock = async (id) => {
  try {
    const stockItem = deletedStock.find(item => item.id === id);
    if (!stockItem || !stockItem.itemType?.isActive) {
      showErrorAlert(
        'No se puede restaurar',
        'No puedes restaurar este stock porque su tipo de ítem aún está inactivo.'
      );
      return;
    }

    await restore(id);
    showSuccessAlert('Restaurado', 'El stock fue restaurado correctamente');

    await Promise.all([
      refetchStock(),
      fetchDeletedStock(),
      fetchTypes(),
    ]);

    setOpenStockTrash(false);
  } catch (error) {
    showErrorAlert('Error al restaurar', error?.message || 'Ocurrió un error inesperado');
  }
};


  const handleOpenTrashModal = async () => {
    try {
      await fetchDeletedTypes(); 
      setOpenTrash(true);
    } catch (err) {
      console.error('[Inventario] Error al obtener eliminados:', err);
    }
  };
  const handleCloseTrash = () => {
    setOpenTrash(false);
  };

  const handleOpenStockTrashModal = async () => {
    try {
      await fetchDeletedStock();  
      setOpenStockTrash(true);
    } catch (err) {
      console.error('[Inventario] Error al obtener stock eliminados:', err);
    }
  };

  const handleCloseStockTrash = () => {
    setOpenStockTrash(false);
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
        <Typography variant="h6" sx={{ mb: 2 }}>Filtros de Búsqueda</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Buscar producto"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleFilterChange}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Tipo de Producto"
              name="typeId"
              value={filters.typeId}
              onChange={handleFilterChange}
              fullWidth
            >
              <MenuItem value="">Todos</MenuItem>
              {itemTypes.map(type => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                name="color"
                value={filters.color}
                onChange={handleFilterChange}
                label="Color"
              >
                <MenuItem value="">Todos</MenuItem>
                {colorOptions.map(({ name, hex }) => (
                  <MenuItem key={name} value={name}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {hex && (
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: hex,
                            marginRight: 1
                          }}
                        />
                      )}
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Talla"
              name="size"
              value={filters.size}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Estado stock</InputLabel>
              <Select
                value={filters.stockStatus}
                onChange={handleFilterChange}
                name="stockStatus"
                label="Estado stock"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="low">Bajo stock</MenuItem>
                <MenuItem value="normal">Stock normal</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={1.5}>
            <Button
              variant="outlined"
              onClick={resetFilters}
              fullWidth
              className="inventory-button inventory-button--outlined"
            >
              Limpiar
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
        {/* Sección de Tipos de Productos */}
          <Paper className="inventory-paper">
            <Typography variant="h5">
              Tipos de Productos ({itemTypes.length})
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                className="inventory-button inventory-button--contained inventory-button--compact"
                onClick={() => setOpenAddType(true)}
              >
                Nuevo Tipo
              </Button>
              <Button
                variant="outlined"
                className="inventory-button inventory-button--outlined"
                onClick={handleOpenTrashModal}
              >
                Papelera
              </Button>
            </Box>
            <ul className="inventory-list">
              {itemTypes.map((type) => (
                <li key={type.id} className="inventory-list-item">
                  <Box display="flex" alignItems="center" gap={2}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {type.iconName && iconMap[type.iconName] && (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                          {React.createElement(iconMap[type.iconName], { size: 20 })}
                        </Box>
                      )}

                      <strong>{type.name}</strong>
                      <span style={{ marginLeft: 4, color: '#666' }}>({type.category})</span>
                      {type.sizesAvailable?.length > 0 && (
                        <span style={{ marginLeft: 6 }}>Tallas: {type.sizesAvailable.join(', ')}</span>
                      )}
                      {!type.isActive && (
                        <span className="inventory-item-inactive">(Inactivo)</span>
                      )}
                    </span>

                  </Box>
                  <Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleDeleteType(type.id)}
                      color="error"
                      className="inventory-button inventory-button--error inventory-button--small"
                    >
                      Eliminar
                    </Button>
                    {!type.isActive && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleRestoreType(type.id)}
                        className="inventory-button inventory-button--success inventory-button--small"
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
            <Button
              variant="outlined"
              color="secondary"
              className="inventory-button inventory-button--outlined"
              onClick={handleOpenStockTrashModal}
            >
              Papelera Stock
            </Button>
          </Box>
          <Typography variant="h5">Inventario</Typography>

          {itemTypes.map((type) => {
            const stockItems = filteredStock.filter(item => item.itemType?.id === type.id);

            return (
              <Box key={type.id} sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {type.iconName && iconMap[type.iconName] && (
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', mr: 1 }}>
                      {React.createElement(iconMap[type.iconName], { size: 20 })}
                    </Box>
                  )}
                  {type.name}
                </Typography>

                <Grid container spacing={2}>
                  {stockItems.length > 0 ? (
                    stockItems.map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Paper className="inventory-item-card">
                          <Typography className="inventory-item-details">
                            Color: {item.color}{' '}
                            {item.hexColor && (
                            <span
                              className="inventory-item-color-preview"
                              style={{ backgroundColor: item.hexColor }}
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
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setEditingStock(item);
                                setOpenAddStock(true);
                              }}
                              className="inventory-button inventory-button--outlined inventory-button--small"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() => handleDeleteStock(item.id)}
                              className="inventory-button inventory-button--error inventory-button--small"
                            >
                              Eliminar
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                    ))
                  ) : (
                    <p className="inventory-empty">No hay stock para este tipo.</p>
                  )}
                </Grid>
              </Box>
            );
          })}
        </Paper>
        </>
      )}
      
      <AddItemTypeModal
        open={openAddType}
        onClose={() => setOpenAddType(false)}
        onCreated={() => fetchTypes()}
        editingType={editingType}
      />

      <ItemTypeTrash 
        open={openTrash}
        onClose={handleCloseTrash}
        trashedTypes={deletedTypes} 
        onRestore={handleRestoreType}
        onRefresh={fetchDeletedTypes}
      />

      <ItemStockTrash
        open={openStockTrash}
        onClose={handleCloseStockTrash}
        trashedItems={Array.isArray(deletedStock) ? deletedStock : []}   
        onRestore={handleRestoreStock}
        onRefresh={() => {
          fetchDeletedStock();   
          refetchStock();        
        }}
      />
      <AddItemStockModal
        open={openAddStock}
          onClose={() => {
          setOpenAddStock(false);
          setEditingStock(null);
        }}
        onCreated={refetchStock}
        itemTypes={itemTypes}
        editingStock={editingStock}
      />
    </Box>
    
  );
};

export default Inventario;