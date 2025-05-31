import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Catalogo = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('usuario'));

  useEffect(() => {
    fetch('http://localhost:3000/api/public/stocks') // nuevo endpoint sin auth
      .then(res => res.json())
      .then(data => {
        if (data.status === 204) {
          setItems([]);
        } else {
          setItems(data.data);
        }
      })
      .catch(err => console.error("Error al cargar catálogo:", err));
  }, []);

  const handleComprar = (item) => {
    if (!user) return navigate('/auth');
    // Aquí podrías mostrar un modal o redirigir a un formulario de pedido
    alert(`Solicitando compra de: ${item.itemType.name} - ${item.color} - ${item.size}`);
  };

  return (
    <div className="catalogo">
      <h2>Catálogo de artículos disponibles</h2>
      <div className="productos">
        {items.map((item) => (
          <div key={item.id} className="producto">
            <h3>{item.itemType.name}</h3>
            <p>Color: {item.color}</p>
            {item.itemType.hasSize && <p>Talla: {item.size}</p>}
            <p>Stock: {item.quantity}</p>
            <button onClick={() => handleComprar(item)}>
              {user ? 'Solicitar compra' : 'Inicia sesión para comprar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalogo;
