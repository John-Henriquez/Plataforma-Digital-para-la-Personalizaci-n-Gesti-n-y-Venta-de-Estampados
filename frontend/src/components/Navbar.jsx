import { NavLink, useNavigate } from "react-router-dom";
import { logout } from '../services/auth.service';
import './../styles/components/navbar.css';
import { useState, useEffect, useRef } from "react";
import { IconMenu2, IconX, IconUser, IconLogout, IconHome, IconUsers, IconSettings, IconPackage } from '@tabler/icons-react';

const Navbar = () => {
  const navigate = useNavigate();
  let user = '';
  try {
    user = JSON.parse(sessionStorage.getItem('usuario')) || '';
  } catch {
    user = '';
  }
  const userRole = user?.rol;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.body.style.overflow = menuOpen ? 'hidden' : '';
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const logoutSubmit = () => {
    try {
      logout();
      navigate('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = [
    { to: "/home", text: "Inicio", icon: <IconHome /> },
  ];

  const adminItems = [
    { to: "/users", text: "Usuarios", icon: <IconUsers /> },
    { to: '/inventario', text: 'Inventario', icon: <IconPackage /> },
  ];

  return (
    <nav className="navbar" style={{ fontFamily: 'var(--font-family)' }}>
      <div className="navbar__user-info">
        <IconUser size={24} />
        <span>{user?.nombreCompleto || 'Usuario'}</span>
      </div>

      {/* Menú para desktop */}
      <div className="navbar__desktop-menu">
        <ul>
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
              >
                {item.icon}
                {item.text}
              </NavLink>
            </li>
          ))}

          {userRole === 'administrador' && (
            <li className="navbar__dropdown">
              <button className="navbar__dropdown-toggle" aria-haspopup="true" aria-expanded="false">
                <IconSettings /> Administración
              </button>
              <div className="navbar__dropdown-menu">
                {adminItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                  >
                    {item.icon}
                    {item.text}
                  </NavLink>
                ))}
              </div>
            </li>
          )}
          <li>
            <button className="navbar__logout-button" onClick={logoutSubmit}>
              <IconLogout />
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>

      {/* Menú móvil */}
      <div className={`navbar__mobile-menu ${menuOpen ? 'active' : ''}`} ref={menuRef}>
        <button className="navbar__close-menu" onClick={() => setMenuOpen(false)}>
          <IconX size={24} />
        </button>

        <ul>
          {[...menuItems, ...(userRole === 'administrador' ? adminItems : [])].map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.icon}
                {item.text}
              </NavLink>
            </li>
          ))}
        </ul>

        <button className="navbar__logout-button" onClick={logoutSubmit}>
          <IconLogout />
          Cerrar sesión
        </button>
      </div>

      <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú">
        {menuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
      </button>
    </nav>
  );
};

export default Navbar;
