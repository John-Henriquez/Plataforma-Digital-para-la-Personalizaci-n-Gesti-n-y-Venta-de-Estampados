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
        const response = await axios.put(`/item-stocks/${id}`, updatedData);
        return response.data.data;
    } catch (error) {
        console.error('Error updating item stock:', error);
        throw error.response?.data || error.message;
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