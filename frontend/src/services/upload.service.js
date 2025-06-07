import axios from './root.service';

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const { data } = await axios.post('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.imageUrl;  // La URL que devuelve el backend
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error.response?.data || error.message;
  }
}
