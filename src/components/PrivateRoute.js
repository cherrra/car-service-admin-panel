// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthToken } from '../utils/auth';

const PrivateRoute = () => {
    const isAuthenticated = getAuthToken(); // Проверяем наличие токена

    return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default PrivateRoute;