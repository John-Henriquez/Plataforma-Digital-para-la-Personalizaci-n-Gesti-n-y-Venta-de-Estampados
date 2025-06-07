import { useState, useEffect } from 'react';
import { useCreateItemType } from './../hooks/inventory/useCreateItemType.jsx';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, InputLabel, FormControl,
  Checkbox, OutlinedInput, Chip, Box
} from '@mui/material';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert.js';

const PRINTING_OPTIONS = ['sublimación', 'DTF', 'vinilo'];
const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL'];

const AddItemTypeModal = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    printingMethods: [],
    hasSizes: false,
    sizesAvailable: [],
    baseImage: null
  });

  const { addType, loading } = useCreateItemType();

  useEffect(() => {
    if (form.category === 'clothing') {
      setForm(prev => ({ ...prev, hasSizes: true }));
    } else if (form.category === 'object') {
      setForm(prev => ({ ...prev, hasSizes: false, sizesAvailable: [] }));
    }
  }, [form.category]);
  
  useEffect(() => {
  if (open) {
    setForm({
      name: '',
      description: '',
      category: '',
      printingMethods: [],
      hasSizes: false,
      sizesAvailable: [],
      baseImage: null
    });
  }
}, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

const handleMultiSelectChange = (e) => {
  const { name, value } = e.target;
  const flattened = Array.isArray(value) ? value.flat(Infinity) : [value];

  setForm(prev => ({
    ...prev,
    [name]: flattened
  }));
};

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('hasSizes', form.hasSizes);

      form.printingMethods.forEach(method => {
        formData.append('printingMethods', method); 
      });

      form.sizesAvailable.forEach(size => {
        formData.append('sizesAvailable', size); 
      });
      
      if (form.baseImage instanceof File) {
        formData.append('baseImage', form.baseImage); 
      } else {
        console.warn("baseImage no es un File válido:", form.baseImage);
      }

      console.log('=== Contenido de formData antes de enviar ===');
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      console.log('==============================================');

      await addType(formData);
      
      showSuccessAlert('¡Tipo creado!', 'El tipo de ítem se agregó correctamente.');
      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      showErrorAlert('Error', error.message || 'No se pudo crear el tipo.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo Tipo de Ítem</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Nombre"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          fullWidth
        />

        <TextField
          label="Descripción"
          name="description"
          value={form.description}
          onChange={handleChange}
          multiline
          rows={3}
          fullWidth
        />

        <FormControl fullWidth required>
          <InputLabel>Categoría</InputLabel>
          <Select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <MenuItem value="clothing">Ropa</MenuItem>
            <MenuItem value="object">Objeto</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Métodos de Impresión</InputLabel>
          <Select
            multiple
            name="printingMethods"
            value={form.printingMethods}
            onChange={handleMultiSelectChange}
            input={<OutlinedInput label="Métodos de Impresión" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {PRINTING_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={form.printingMethods.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <input
          type="file"
          name="baseImage"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setForm(prev => ({ ...prev, baseImage: e.target.files[0] }));
            }
          }}
          className="inventory-image-upload"
        />
        {form.category === 'clothing' && (
          <FormControl fullWidth>
            <InputLabel>Tallas disponibles</InputLabel>
            <Select
              multiple
              name="sizesAvailable"
              value={form.sizesAvailable}
              onChange={handleMultiSelectChange}
              input={<OutlinedInput label="Tallas disponibles" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {SIZE_OPTIONS.map((size) => (
                <MenuItem key={size} value={size}>
                  <Checkbox checked={form.sizesAvailable.includes(size)} />
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !form.name || !form.category}
        >
          {loading ? 'Creando...' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddItemTypeModal;
