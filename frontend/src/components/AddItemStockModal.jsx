import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, InputLabel,
  FormControl, Box
} from '@mui/material';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';
import { useCreateItemStock } from '../hooks/itemStock/useCreateItemStock.jsx';
import useEditItemStock from '../hooks/itemStock/useEditItemStock.jsx';
import '../styles/components/addItemStockModal.css';

const AddItemStockModal = ({ open, onClose, onCreated, itemTypes, editingStock }) => {
  const [form, setForm] = useState({
    itemTypeId: '',
    hexColor: '#000000',
    size: '',
    quantity: '',
    price: '',
    minStock: '',
    images: ['']
  });

const [selectedType, setSelectedType] = useState(null);
const { addStock, loading } = useCreateItemStock();
const { editItemStock } = useEditItemStock();


  useEffect(() => {
    if (form.itemTypeId) {
      const type = itemTypes.find(t => t.id === form.itemTypeId);
      setSelectedType(type);
    } else {
      setSelectedType(null);
    }
  }, [form.itemTypeId, itemTypes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
const handleSubmit = async () => {
  try {
    // Filtrar imágenes no vacías
    const filteredImages = form.images.filter(url => url.trim() !== '');

    // Armar payload básico
    const payload = {
      hexColor: form.hexColor,
      quantity: parseInt(form.quantity, 10),
      price: parseInt(form.price, 10),
      minStock: parseInt(form.minStock, 10),
    };
    
    if (!editingStock) {
      payload.itemTypeId = form.itemTypeId;
    }

    // Incluir imágenes solo si hay
    if (filteredImages.length > 0) {
      payload.images = filteredImages;
    }

    // Incluir talla solo si corresponde
    if (selectedType?.hasSizes && form.size) {
      payload.size = form.size;
    }

    // Mostrar payload antes de enviar
    console.log("🧪 Payload enviado al backend:", payload);

    // Editar o agregar stock
    if (editingStock) {
      await editItemStock(editingStock.id, payload);
      showSuccessAlert('¡Stock actualizado!', 'El ítem fue actualizado correctamente.');
    } else {
      await addStock(payload);
      showSuccessAlert('¡Stock agregado!', 'El ítem fue agregado correctamente.');
    }

    onCreated();
    onClose();

  } catch (error) {
    const backendError = error.response?.data;
    console.error('❌ Error del backend:', backendError || error.message);
    
    if (backendError?.details) {
      console.error('🧩 Detalles de validación:', backendError.details);
    }

    showErrorAlert('Error', backendError?.message || 'No se pudo guardar el stock.');
  }
};


  useEffect(() => {
  if (editingStock) {
    const matchingType = itemTypes.find(t => t.id === editingStock.itemTypeId);
    setForm({
      itemTypeId: matchingType ? editingStock.itemTypeId : '',
      hexColor: editingStock.hexColor || '#000000',
      size: editingStock.size || '',
      quantity: editingStock.quantity.toString(),
      price: editingStock.price.toString(),
      minStock: editingStock.minStock?.toString() || '',
      images: editingStock.images?.length ? editingStock.images : [''],
    });
  } else {
    setForm({
      itemTypeId: '',
      hexColor: '#000000',
      size: '',
      quantity: '',
      price: '',
      minStock: '',
      images: ['']
    });
  }
}, [editingStock, itemTypes]);


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className='dialog-title'>Nuevo Stock</DialogTitle>

      <DialogContent dividers className='dialog-content'>
        <FormControl fullWidth margin="normal">
            {Array.isArray(itemTypes) && itemTypes.length > 0 ? (
            <>
            <InputLabel>Tipo de Ítem</InputLabel>
            <Select
            name="itemTypeId"
            value={form.itemTypeId}
            onChange={(e) => handleChange({
                target: { name: 'itemTypeId', value: Number(e.target.value) }
            })}
            required
            >
            {itemTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                {type.name}
                </MenuItem>
            ))}
            </Select>
            </>
        ) : (
            <Box className="no-types-message">No hay tipos disponibles</Box>
        )}
        </FormControl>

        <Box className="color-picker">
          <label>Color (hex)</label>
          <input
            type="color"
            name="hexColor"
            value={form.hexColor}
            onChange={handleChange}
            className="color-input"
          />
        </Box>

        {selectedType?.hasSizes && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Talla</InputLabel>
            <Select
              name="size"
              value={form.size}
              onChange={handleChange}
              required
            >
              {selectedType.sizesAvailable.map(size => (
                <MenuItem key={size} value={size}>{size}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <TextField
          label="Cantidad"
          name="quantity"
          type="number"
          value={form.quantity}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Precio"
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Stock mínimo"
          name="minStock"
          type="number"
          value={form.minStock}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="URL de imagen"
          name="images"
          value={form.images[0]}
          onChange={(e) =>
            setForm(prev => ({
              ...prev,
              images: [e.target.value]
            }))
          }
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions className='dialog-actions'>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className="button-primary"
          disabled={
            loading ||
            !form.itemTypeId ||
            !form.hexColor ||
            !form.quantity ||
            !form.price ||
            !form.minStock
          }
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddItemStockModal;
