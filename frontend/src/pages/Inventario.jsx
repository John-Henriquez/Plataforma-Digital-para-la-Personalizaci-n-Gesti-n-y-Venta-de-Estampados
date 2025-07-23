import React, { useEffect, useState, useContext, useMemo } from 'react';
import {
  Box, Button, Grid, TextField, Paper, Typography,
  CircularProgress, Alert, MenuItem, InputAdornment,
  FormControl, InputLabel, Select, Chip
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import Modal from '@mui/material/Modal';

import AddItemTypeModal from '../components/AddItemTypeModal.jsx';
import AddItemStockModal from '../components/AddItemStockModal.jsx';
import ItemTypeTrash from '../components/ItemTypeTrashModal.jsx';
import ItemStockTrash from '../components/ItemStockTrashModal.jsx';
import PackModal from '../components/PackModal.jsx';
import PackTrashModal from '../components/PackTrashModal.jsx';
import InventoryMovementHistory from '../components/InventoryMovementHistory.jsx';

import usePack from '../hooks/pack/usePack.jsx';
import useItemStock from '../hooks/itemStock/useItemStock.jsx';
import useDeleteItemStock from '../hooks/itemStock/useDeleteItemStock.jsx';
import useDeletePack from '../hooks/pack/useDeletePack.jsx';
import { useItemTypes } from '../hooks/itemType/useItemType.jsx';
import { useDeleteItemType } from '../hooks/itemType/useDeleteItemType.jsx';
import { useDeletedItemTypes } from '../hooks/itemType/useDeletedItemType.jsx';
import { useRestoreItemType } from '../hooks/itemType/useRestoreItemType.jsx';
import { useRestoreItemStock } from '../hooks/itemStock/useRestoreItemStock.jsx';
import { useDeletedItemStock } from '../hooks/itemStock/useDeletedItemStock.jsx';
import useRestorePack from '../hooks/pack/useRestorePack.jsx';
import useDeletedPacks from '../hooks/pack/useDeletedPacks.jsx';


import { AuthContext } from '../context/AuthContext.jsx';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';

import { COLOR_DICTIONARY } from '../data/colorDictionary';
import { iconMap  } from '../data/iconCategories';
import '../styles/pages/inventario.css';


const Inventario = () => {
  //modales 
  const [openAddType, setOpenAddType] = useState(false);
  const [openAddStock, setOpenAddStock] = useState(false);
  const [openTrash, setOpenTrash] = useState(false);
  const [openStockTrash, setOpenStockTrash] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [openPackModal, setOpenPackModal] = useState(false);
  const [openPackTrash, setOpenPackTrash] = useState(false);

  //edicion
  const [editingType] = useState(null);
  const [editingStock, setEditingStock] = useState(null);
  const [editingPack, setEditingPack] = useState(null);

  const { isAuthenticated, user } = useContext(AuthContext);

  //hooks pack
  const{
    packs, 
    loading: packsLoading, 
    error: packsError, 
    refetch 
  } = usePack();
  const { restore: restorePack } = useRestorePack();
  const { deletedPacks, refetch: fetchDeletedPacks } = useDeletedPacks();

  const { remove } = useDeletePack();


  //hooks stock
  const { 
    itemStock, 
    loading: stockLoading, 
    error: stockError, 
    filters, 
    setFilters, 
    refetch: refetchStock 
  } = useItemStock();

  const { deleteItemStock } = useDeleteItemStock();
  const { deletedStock, fetchDeletedStock } = useDeletedItemStock();
  const { restore } = useRestoreItemStock();

  //hooks tipos
  const { 
    types: itemTypes, 
    fetchTypes, 
    loading: typesLoading, 
    error: typesError 
  } = useItemTypes();

  const { removeType  } = useDeleteItemType();
  const { 
    deletedTypes, 
    fetchDeletedTypes, 
  } = useDeletedItemTypes();
  const { restoreType } = useRestoreItemType();
  
  //carga inicial tipos
  useEffect(() => {
    fetchTypes(); 
  }, [fetchTypes]);

  //filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const initialFilters = {
    color: '',
    size: '',
    typeId: '',
    searchTerm: '',
    stockStatus: ''
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    refetchStock();
  };

  const filteredStock = useMemo(() => {
    if (!itemStock) return [];
    
    return itemStock.filter(item => {
      if (!item.itemType) return false; 
      
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const itemName = item.itemType?.name?.toLowerCase() || '';
        const itemHex = item.hexColor?.toLowerCase() || '';

        if (!itemName.includes(searchTerm) && !itemHex.includes(searchTerm)) {
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

  //stock
  const handleDeleteStock = async (id) => {
    const result = await deleteDataAlert();

    if (!result.isConfirmed) return;

    const [res, err] = await deleteItemStock(id);
    console.log("resultado:", [res, err]);

    if (res && res.status === "Success") {
      showSuccessAlert('Eliminado', res.message || 'El item fue eliminado correctamente');
      refetchStock();
    } else if (err) {
      const { status, message } = err;

      if (status === 409) {
        showErrorAlert('No se puede eliminar', message || 'Este ítem está siendo utilizado en uno o más paquetes');
      } else if (status === 404) {
        showErrorAlert('No encontrado', message || 'El ítem no existe o ya fue eliminado');
      } else {
        showErrorAlert('Error', message || `Error inesperado (${status})`);
      }
    } else {
      showErrorAlert('Error', 'No se pudo determinar el resultado de la operación');
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

  //tipos
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
  //pack

  const handleDeletePack = async (id) => {
    const result = await deleteDataAlert();

    if (!result.isConfirmed) return;

    const [res, err] = await remove(id);
    console.log("resultado delete pack:", [res, err]);

    if (res && res.status === "Success") {
      showSuccessAlert("Eliminado", res.message || "Pack eliminado correctamente");
      refetch();
    } else if (err) {
      const { status, message } = err;

      if (status === 409) {
        showErrorAlert("No se puede eliminar", message || "Este pack contiene ítems que están en uso");
      } else if (status === 404) {
        showErrorAlert("No encontrado", message || "El pack ya fue eliminado o no existe");
      } else {
        showErrorAlert("Error", message || `Error inesperado (${status})`);
      }
    } else {
      showErrorAlert("Error", "No se pudo determinar el resultado de la operación");
    }
  };

    const handleRestorePack = async (id) => {
  try {
    await restorePack(id);
    showSuccessAlert('Restaurado', 'El pack fue restaurado correctamente');
    
    await Promise.all([
      refetch(),
      fetchDeletedPacks(),
    ]);
      setOpenPackTrash(false);
    } catch (error) {
      showErrorAlert('Error al restaurar', error?.message || 'Ocurrió un error inesperado');
    }
  };

  //modales
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

    const handleOpenPackTrash = async () => {
    try {
      await fetchDeletedPacks();
      setOpenPackTrash(true);
    } catch (err) {
      console.error('[Inventario] Error al obtener packs eliminados:', err);
    }
  };

  const handleClosePackTrash = () => {
    setOpenPackTrash(false);
    setEditingPack(null);
  };

  //colores 
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

    if (!isAuthenticated || user?.rol !== 'administrador') {
    return <Navigate to="/auth" />;
  }

  return (
    <Box className="inventory-container">
      <Typography className="inventory-title" variant="h4" gutterBottom>
        Gestión de Inventario
      </Typography>
      {/* Alertas de error */}
      {(stockError || typesError || packsError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {stockError || typesError}
        </Alert>
      )}

      {/* Sección de Filtros */}
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

          {/* Filtro por tipo */}
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

          {/* Filtro por color */}
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

          {/* Filtro por talla */}
          <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Talla</InputLabel>
                <Select
                  name="size"
                  value={filters.size}
                  onChange={handleFilterChange}
                  label="Talla"
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="S">S</MenuItem>
                  <MenuItem value="M">M</MenuItem>
                  <MenuItem value="L">L</MenuItem>
                  <MenuItem value="XL">XL</MenuItem>
                  <MenuItem value="XXL">XXL</MenuItem>
                </Select>
              </FormControl>
          </Grid>

          {/* Filtro por estado de stock */}
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

          {/* Botón para limpiar filtros */}
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

            {/* Listado de tipos */}
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

          {/* Sección de Inventario */}
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
            <Button
              variant="outlined"
              color="info"
              className="inventory-button inventory-button--outlined"
              onClick={() => setOpenHistory(true)}
            >
              Historial
            </Button>
          </Box>
          <Typography variant="h5">Inventario</Typography>
          
          {/* Listado de items por tipo */}
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

        {/* Sección de Packs */}
        <Paper className="inventory-paper" sx={{ mt: 3 }}>
          <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Typography variant="h5">Packs ({packs.length})</Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  className="inventory-button"
                  onClick={() => {
                    setEditingPack(packs);
                    setOpenPackModal(true);
                  }}
                >
                  Nuevo Pack
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  className="inventory-button"
                  onClick={handleOpenPackTrash}
                >
                  Papelera Packs
                </Button>
              </Box>
          </Box>

          {packsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : packs.length > 0 ? (
            <Grid container spacing={2}>
              {packs.map((pack) => (
                <Grid item xs={12} sm={6} md={4} key={pack.id}>
                  <Paper className="inventory-item-card" sx={{ p: 2 }}>

                    {/* Encabezado del pack */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">{pack.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={pack.isActive ? "Activo" : "Inactivo"} 
                          color={pack.isActive ? "success" : "error"} 
                          size="small"
                        />
                        {pack.autoCalculatePrice && (
                          <Chip label="Auto" color="info" size="small" />
                        )}
                      </Box>
                    </Box>

                    {/* Precio y descuento */}
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        ${pack.price?.toLocaleString()}
                      </Typography>
                      {pack.discount && pack.discount > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Incluye {pack.discount * 100}% de descuento
                        </Typography>
                      )}
                    </Box>

                    {/* Items del pack */}
                    <Box sx={{ mt: 2, flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Contiene:</Typography>
                      {pack.packItems?.map((packItem, index) => {
                        const stock = packItem.itemStock;
                        const itemType = stock?.itemType;

                        return (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{
                              width: 14, 
                              height: 14, 
                              borderRadius: '50%',
                              backgroundColor: stock?.hexColor || '#ccc', 
                              mr: 1, 
                              border: '1px solid #ddd'
                            }} />
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                              {itemType?.name || 'Item desconocido'} ({packItem.quantity}x)
                            </Typography>
                            {stock?.size && (
                              <Typography variant="body2" color="text.secondary">
                                {stock.size}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Box>

                    {/* Botones de acción */}
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => {
                          setEditingPack(pack);
                          setOpenPackModal(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        fullWidth
                        onClick={() => handleDeletePack(pack.id)}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                No se encontraron packs
              </Typography>
            )}
          </Paper>
        </>
      )}
      {/* modales*/}
      
      <PackTrashModal
        open={openPackTrash}
        onClose={handleClosePackTrash}
        deletedPacks={deletedPacks}
        onRestore={handleRestorePack}
        onDelete={handleDeletePack}
        onRefresh={() => {
          refetch();
        }}
      />
      
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
        onClose={() => setOpenAddStock(false)}
        onCreated={() => {
          refetchStock();
          setEditingStock(null);
        }}
        itemTypes={itemTypes}
        editingStock={openAddStock ? editingStock : null}
      />
      <PackModal
        open={openPackModal}
        onClose={() => setOpenPackModal(false)}
        onCompleted={() => {
          setOpenPackModal(false);
          refetch();
        }}
        editingPack={editingPack}
        currentUserRut={user?.rut}
        itemStock={itemStock} 
        refetchStocks={refetchStock} 
      />
      <Modal
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        aria-labelledby="historial-inventario"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{
          width: '90%',
          maxHeight: '90%',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
        }}>
          <Typography id="historial-inventario" variant="h6" gutterBottom>
            Historial de Movimientos de Inventario
          </Typography>
          <InventoryMovementHistory />
        </Box>
      </Modal>
    </Box>
    
  );
};

export default Inventario;