import useInventory from "../hooks/inventory/useInventory";

const Home = () => {
  const { itemTypes, itemStock, loading } = useInventory();

  return (
    <div className="home-container">
      <h1>Gestión de Inventario</h1>
      
      {loading ? (
        <p>Cargando inventario...</p>
      ) : (
        <>
          <section className="inventory-section">
            <h2>Tipos de Productos ({itemTypes.length})</h2>
            <ul>
              {itemTypes.map(type => (
                <li key={type.id}>
                  {type.name} - {type.category}
                  {type.sizesAvailable?.length > 0 && (
                    <span> (Tallas: {type.sizesAvailable.join(', ')})</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="inventory-section">
            <h2>Stock Disponible ({itemStock.length})</h2>
            <div className="stock-grid">
              {itemStock.map(item => (
                <div key={item.id} className="stock-item">
                  <h3>{item.itemType?.name || 'Sin tipo'}</h3>
                  <p>Color: {item.color} {item.hexColor && (
                    <span style={{ 
                      display: 'inline-block',
                      width: '15px',
                      height: '15px',
                      backgroundColor: item.hexColor,
                      marginLeft: '5px',
                      border: '1px solid #000'
                    }}></span>
                  )}</p>
                  {item.size && <p>Talla: {item.size}</p>}
                  <p>Stock: {item.quantity} (Mín: {item.minStock})</p>
                  <p>Precio: ${item.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <style>{`
        .home-container {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
          padding: 20px;
          box-sizing: border-box;
        }

        .inventory-section {
          width: 90%;
          margin: 20px 0;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .stock-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .stock-item {
          background: white;
          padding: 15px;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        h1, h2, h3 {
          color: #333;
        }

        h1 {
          font-size: 24px;
          margin-bottom: 20px;
        }

        h2 {
          font-size: 20px;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}

export default Home;