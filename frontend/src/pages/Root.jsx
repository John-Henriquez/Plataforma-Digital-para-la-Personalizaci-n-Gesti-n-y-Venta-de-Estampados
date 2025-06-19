import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';

function Root()  {
return (
    <AuthProvider>
        <PageRoot/>
    </AuthProvider>
);
}

function PageRoot() {
return (
    <>
        <Navbar />
        <Outlet />
    </>
);
}

export default Root;