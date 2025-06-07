const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se envió ningún archivo" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  return res.status(200).json({ imageUrl });
};

export default {
  uploadImage,
};
