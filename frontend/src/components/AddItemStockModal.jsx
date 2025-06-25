import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, InputLabel,
  FormControl, Box
} from '@mui/material';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';
import { useCreateItemStock } from '../hooks/itemStock/useCreateItemStock.jsx';
import '../styles/components/addItemStockModal.css';

const AddItemStockModal = ({ open, onClose, onCreated, itemTypes }) => {
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
      const payload = {
        itemTypeId: form.itemTypeId,
        hexColor: form.hexColor,
        quantity: parseInt(form.quantity, 10),
        price: parseInt(form.price, 10),
        minStock: form.minStock ? parseInt(form.minStock, 10) : undefined,
        images: form.images.filter(url => url.trim() !== ''),
      };

      // Solo agrega size si tiene valor válido (y el itemType tiene tallas)
      if (selectedType?.hasSizes && form.size) {
        payload.size = form.size;
      }

      await addStock(payload);


      showSuccessAlert('¡Stock agregado!', 'El ítem fue agregado correctamente.');
      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      showErrorAlert('Error', error?.message || 'No se pudo crear el stock.');
    }
  };

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
