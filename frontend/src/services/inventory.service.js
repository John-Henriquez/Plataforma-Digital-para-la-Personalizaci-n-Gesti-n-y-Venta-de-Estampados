import axios from './root.service'; 

export async function getItemTypes() {
    try {
        const { data } = await axios.get('/inventory/types');
        // Debug: muestra la respuesta completa del servidor para getItemTypes
        // console.log('[SERVICE] ✅ getItemTypes: respuesta recibida:', data);
        return data.data || [];
    } catch (error) {
        // Muestra error detallado al fallar la petición GET /inventory/types
        console.error('Error fetching item types:', error);
        return [];
    }
}

export async function getItemStock() {
    try {
        const { data } = await axios.get('/inventory/stocks');
        // Debug: muestra la respuesta completa del servidor para getItemStock
        // console.log('[SERVICE] ✅ getItemStock: respuesta recibida:', data);
        return data.data || [];
    } catch (error) {
        // Muestra error detallado al fallar la petición GET /inventory/stocks
        console.error('Error fetching item stock:', error);
        return [];
    }
}

export async function createItemStock(itemData) {
    try {
        const response = await axios.post('/inventory/stocks', itemData);
        // Debug: muestra la respuesta después de crear un item stock
        // console.log('[SERVICE] ✅ createItemStock: respuesta recibida:', response.data);
        return response.data.data;
    } catch (error) {
        // Muestra error detallado al fallar la creación de item stock
        console.error('Error creating item:', error);
        // Lanza el error con datos detallados para manejar en la UI
        throw error.response?.data || error.message;
    }
}

export async function updateItemStock(id, updatedData) {
    try {
        const response = await axios.put(`/inventory/stocks/${id}`, updatedData);
        // Debug: muestra la respuesta después de actualizar un item stock
        // console.log('[SERVICE] ✅ updateItemStock: respuesta recibida:', response.data);
        return response.data.data;
    } catch (error) {
        // Muestra error detallado al fallar la actualización
        console.error('Error updating item stock:', error);
        throw error.response?.data || error.message;
    }
}

export async function deleteItemStock(id) {
    try {
        const response = await axios.delete(`/inventory/stocks/${id}`);
        // Debug: muestra la respuesta después de eliminar un item stock
        // console.log('[SERVICE] ✅ deleteItemStock: respuesta recibida:', response.data);
        return response.data;
    } catch (error) {
        // Muestra error detallado al fallar la eliminación
        console.error('Error deleting item stock:', error);
        throw error.response?.data || error.message;
    }
}

export async function createItemType(formData) {
  try {
    const response = await axios.post('/inventory/types', formData);
    // Debug: muestra la respuesta después de crear un tipo de item
    //console.log('[SERVICE] ✅ createItemType: respuesta recibida:', response.data);
    return response.data.data;
  } catch (error) {
    // Muestra error detallado si falla la creación del tipo de item
    console.error('Error creating item type:', error);
    throw error.response?.data || error.message;
  }
}
