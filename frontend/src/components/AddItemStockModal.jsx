import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, InputLabel,
  FormControl, Box
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';
import { useCreateItemStock } from '../hooks/itemStock/useCreateItemStock.jsx';
import useEditItemStock from '../hooks/itemStock/useEditItemStock.jsx';
import { COLOR_DICTIONARY } from '../data/colorDictionary';
import '../styles/components/modal.css';

const DEFAULT_FORM = {
  itemTypeId: '',
  hexColor: '#000000',
  size: '',
  quantity: '',
  price: '',
  minStock: '',
  images: ['']
};

const AddItemStockModal = ({ open, onClose, onCreated, itemTypes, editingStock }) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [selectedType, setSelectedType] = useState(null);

  const { addStock, loading } = useCreateItemStock();
  const { editItemStock } = useEditItemStock();

  useEffect(() => {
    if (open && editingStock) {
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
      setForm(DEFAULT_FORM);
    }
  }, [open, editingStock, itemTypes]);

  useEffect(() => {
    setSelectedType(itemTypes.find(type => type.id === form.itemTypeId) || null);
  }, [form.itemTypeId, itemTypes]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ 
      ...prev,
      [name]: type === 'number' || ['quantity', 'price', 'minStock'].includes(name)
        ? value 
        : value
    }));
  };

const handleSubmit = async () => {
  try {
    const filteredImages = form.images.filter(url => url.trim() !== '');
    
    const payload = {
      hexColor: form.hexColor,
      quantity: parseInt(form.quantity, 10),
      price: parseInt(form.price, 10),
      minStock: parseInt(form.minStock, 10),
      ...(filteredImages.length > 0 && { images: filteredImages }),
      ...(selectedType?.hasSizes && form.size && { size: form.size }),
      ...(!editingStock && { itemTypeId: form.itemTypeId })
    };
    
    console.log("🧪 Payload enviado al backend:", payload);

    if (filteredImages.length > 0) {
      payload.images = filteredImages;
    }
    if (selectedType?.hasSizes && form.size) {
      payload.size = form.size;
    }

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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" className="modal">
      <DialogTitle className='modal-title'>
        {editingStock ? 'Editar Stock' : 'Nuevo Stock'}
      </DialogTitle>

      <DialogContent dividers className='modal-content'>
        {/* Tipo de item*/}
        <FormControl fullWidth margin="normal" className="modal-field">
          {itemTypes.length > 0 ? (
            <>
              <InputLabel>Tipo de Ítem</InputLabel>
              <Select
                name="itemTypeId"
                value={form.itemTypeId}
                onChange={(e) => 
                  handleChange({
                    target: { 
                      name: 'itemTypeId', 
                      value: Number(e.target.value),
                      type: 'number'
                    }
                  })
                }
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
            <Box className="modal-no-types-message">No hay tipos disponibles</Box>
          )}
        </FormControl>
        {/* Color */}
        <Autocomplete
          options={COLOR_DICTIONARY}
          getOptionLabel={(option) => option.name}
          value={COLOR_DICTIONARY.find(c => c.hex === form.hexColor) || null}
          onChange={(e, newValue) => newValue && setForm(prev => ({ ...prev, hexColor: newValue.hex }))}
          renderInput={(params) => (
            <TextField {...params} label="Color" fullWidth margin="normal" className="modal-field" />
          )}
          isOptionEqualToValue={(option, value) => option.hex === value.hex}
        />
        {/* Talla */}
        {selectedType?.hasSizes && (
          <FormControl fullWidth margin="normal" className="modal-field">
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
        {/* Campos de cantidad, precio y stock mínimo */}
        <TextField
          label="Cantidad"
          name="quantity"
          type="number"
          value={form.quantity}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          className="modal-field"
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
          className="modal-field"
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
          className="modal-field"
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
          className="modal-field"
        />
      </DialogContent>

      <DialogActions className='modal-actions'>
        <Button onClick={onClose} className="modal-button modal-button--cancel">Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            loading ||
            !form.itemTypeId ||
            !form.hexColor ||
            !form.quantity ||
            !form.price ||
            !form.minStock
        }
          className="modal-button modal-button--primary"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddItemStockModal;
