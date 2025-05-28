import { NavLink, useNavigate } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import '@styles/navbar.css';
import { useState, useEffect, useRef } from "react";
import { IconMenu2, IconX, IconUser, IconLogout, IconHome, IconFile, IconPlus, IconUsers, IconDatabase, IconCar, IconSettings, IconId } from '@tabler/icons-react';


const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('usuario')) || '';
    const userRole = user?.rol;
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        { to: "/applications", text: "Solicitudes", icon: <IconFile /> },
        { to: "/add-application", text: "Crear solicitud", icon: <IconPlus /> },
    ];

    const adminItems = [
        { to: "/users", text: "Usuarios", icon: <IconUsers /> },
        { to: "/records", text: "Registros", icon: <IconDatabase /> },
        { to: "/vehicles", text: "Vehículos", icon: <IconCar /> },
        { to: "/drivers", text: "Conductores", icon: <IconId /> }
    ];

    return (
        <nav className="navbar">
            <div className="user-info">
                <IconUser size={24} />
                <span>{user?.nombreCompleto || 'Usuario'}</span>
            </div>

            {/* Menú para desktop */}
            <div className="desktop-menu">
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) => isActive ? 'active' : ''}
                            >
                                {item.icon}
                                {item.text}
                            </NavLink>
                        </li>
                    ))}
                    
                    {userRole === 'administrador' && (
                        <li className="dropdown">
                            <button className="dropdown-toggle">
                                <IconSettings /> Administración
                            </button>
                            <div className="dropdown-menu">
                                {adminItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        className={({ isActive }) => isActive ? 'active' : ''}
                                    >
                                        {item.icon}
                                        {item.text}
                                    </NavLink>
                                ))}
                            </div>
                        </li>
                    )}
                    <li>
                        <button className="navbar-button logout" onClick={logoutSubmit}>
                            <IconLogout />
                            Cerrar sesión
                        </button>
                    </li>                    
                </ul>
            </div>

            {/* Menú móvil */}
            <div className={`mobile-menu ${menuOpen ? 'active' : ''}`} ref={menuRef}>
                <button className="close-menu" onClick={() => setMenuOpen(false)}>
                    <IconX size={24} />
                </button>
                
                <ul>
                    {[...menuItems, ...(userRole === 'administrador' ? adminItems : [])].map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) => isActive ? 'active' : ''}
                                onClick={() => setMenuOpen(false)}
                            >
                                {item.icon}
                                {item.text}
                            </NavLink>
                        </li>
                    ))}
                </ul>
                
                    <button className="logout-button" onClick={logoutSubmit}>
                        <IconLogout />
                        Cerrar sesión
                    </button>
                </div>

            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
            </button>
        </nav>
    );
};

export default Navbar;