import './../styles/pages/Error404.css';

const Error404 = () => {
  return (
    <main className="error-page">
      <div className="error-card">
        <h1 className="error-card__title">404</h1>
        <h3 className="error-card__subtitle">~ Página no encontrada ~</h3>
        <h4 className="error-card__message">
          Lo sentimos, la página que estás buscando no existe :(
        </h4>
      </div>
    </main>
  );
};

export default Error404;
