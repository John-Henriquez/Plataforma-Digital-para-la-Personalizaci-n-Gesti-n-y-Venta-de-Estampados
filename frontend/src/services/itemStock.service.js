import axios from './root.service'; 

export async function getItemStock() {
    try {
        const { data } = await axios.get('/item-stocks');
        return data.data || [];
    } catch (error) {
        console.error('Error fetching item stock:', error);
        return [];
    }
}

export async function createItemStock(itemData) {
    try {
        console.log('📦 Datos enviados al backend:', itemData);
        const response = await axios.post('/item-stocks', itemData);
        return response.data.data;
    } catch (error) {
        console.error('Error creating item:', error);
        throw error.response?.data || error.message;
    }
}

export async function updateItemStock(id, updatedData) {
  try {
    const response = await axios.patch(`/item-stocks/${id}`, updatedData);
    return response.data.data;
  } catch (error) {
    const backendError = error.response?.data;
    console.error('❌ Error actualizando stock:', backendError || error.message);
    console.error('Detalles:', backendError?.details);
    throw backendError || error.message;
  }
}


export async function deleteItemStock(id) {
    try {
        const response = await axios.delete(`/item-stocks/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting item stock:', error);
        throw error.response?.data || error.message;
    }
}

export async function getDeletedItemStock() {
  try {
    const { data } = await axios.get('/item-stocks', { params: { isActive: false } });
    return data.data || [];
  } catch (error) {
    console.error('Error fetching deleted item stock:', error);
    return [];
  }
}

export async function restoreItemStock(id) {
  try {
    const { data } = await axios.patch(`/item-stocks/restore/${id}`);
    return data.data;
  } catch (error) {
    console.error('Error restoring item stock:', error);
    throw error.response?.data || error.message;
  }
}

export async function emptyDeletedItemStock() {
  try {
    const { data } = await axios.delete('/item-stocks/trash');
    return data;
  } catch (error) {
    console.error('Error emptying deleted item stock:', error);
    throw error.response?.data || error.message;
  }
}

export async function forceDeleteItemStock(id) {
  try {
    const response = await axios.delete(`/item-stocks/force-delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error force deleting item stock:', error);
    throw error.response?.data || error.message;
  }
}