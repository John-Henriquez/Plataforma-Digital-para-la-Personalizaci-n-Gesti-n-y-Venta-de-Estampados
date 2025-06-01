import axios from './root.service'; // Asegúrate de que la ruta sea correcta

export async function getItemTypes() {
    try {
        const { data } = await axios.get('/inventory/types');
        return data.data || [];
    } catch (error) {
        console.error('Error fetching item types:', error);
        return [];
    }
}

export async function getItemStock(params = {}) {
    try {
        const { data } = await axios.get('/inventory/stocks', { params });
        return data.data || [];
    } catch (error) {
        console.error('Error fetching item stock:', error);
        return [];
    }
}

export async function createItemStock(itemData) {
    try {
        const response = await axios.post('/inventory/stocks', itemData);
        return response.data.data;
    } catch (error) {
        console.error('Error creating item:', error);
        throw error.response?.data || error.message;
    }
}