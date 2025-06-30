import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Button, Grid, TextField, Paper, Typography,
  CircularProgress, Alert,
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import {
  Shirt, Coffee, GlassWater, Key, Table, Notebook, Gift,
  GraduationCap, Baby, Backpack, Smartphone, FlaskConical
} from 'lucide-react';

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


import { AuthContext } from '../context/AuthContext.jsx';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';
import '../styles/pages/inventario.css';

const ICON_CATEGORIES = [
  {
    name: 'Ropa y Textiles',
    icons: [
      { label: 'Camiseta', value: 'shirt', Icon: Shirt },
      { label: 'Gorra', value: 'cap', Icon: GraduationCap },
      { label: 'Pijama', value: 'pijama', Icon: Baby },
      { label: 'Bolso/Mochila', value: 'bag', Icon: Backpack },
    ],
  },
  {
    name: 'Accesorios',
    icons: [
      { label: 'Taza', value: 'mug', Icon: Coffee },
      { label: 'Vaso', value: 'glass', Icon: GlassWater },
      { label: 'Llave', value: 'key', Icon: Key },
    ],
  },
  {
    name: 'Hogar',
    icons: [
      { label: 'Mesa', value: 'table', Icon: Table },
      { label: 'Smartphone', value: 'phone', Icon: Smartphone },
    ],
  },
  {
    name: 'Promocionales/Regalos',
    icons: [
      { label: 'Libreta', value: 'notebook', Icon: Notebook },
      { label: 'Botella', value: 'bottle', Icon: FlaskConical },
      { label: 'Regalo', value: 'gift', Icon: Gift },
    ],
  },
];

const iconMap = ICON_CATEGORIES.flatMap(c => c.icons).reduce((map, { value, Icon }) => {
  map[value] = Icon;
  return map;
}, {});


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
              className="inventory-button inventory-button--contained inventory-button--compact"
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
                        <span style={{ marginLeft: 6, color: 'red', fontWeight: 'bold' }}>(Inactivo)</span>
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
                          onClick={() => {
                            setEditingStock(item);
                            setOpenAddStock(true);
                          }}
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