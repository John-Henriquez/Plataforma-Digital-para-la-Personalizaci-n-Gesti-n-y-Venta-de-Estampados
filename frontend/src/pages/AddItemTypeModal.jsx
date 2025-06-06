import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, InputLabel, FormControl,
  Checkbox, FormControlLabel, OutlinedInput, Chip, Box
} from '@mui/material';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert.js';
import { createItemType } from '../services/inventory.service.js';

const PRINTING_OPTIONS = ['sublimación', 'DTF', 'vinilo'];
const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL'];

const AddItemTypeModal = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    printingMethods: [],
    hasSizes: false,
    sizesAvailable: []
  });

  // Actualiza hasSizes según la categoría
  useEffect(() => {
    if (form.category === 'clothing') {
      setForm(prev => ({ ...prev, hasSizes: true }));
    } else if (form.category === 'object') {
      setForm(prev => ({ ...prev, hasSizes: false, sizesAvailable: [] }));
    }
  }, [form.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: typeof value === 'string' ? value.split(',') : value }));
  };

  const handleSubmit = async () => {
    try {
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      hasSizes: form.hasSizes,
      printingMethods: form.printingMethods,
      ...(form.hasSizes && { sizesAvailable: form.sizesAvailable })
    };

      await createItemType(payload);
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
        <Button onClick={handleSubmit} variant="contained" disabled={!form.name || !form.category}>
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddItemTypeModal;
