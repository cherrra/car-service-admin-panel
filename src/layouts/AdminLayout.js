// src/layouts/AdminLayout.js
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../utils/auth';
import './AdminLayout.module.css'; // Создайте этот файл для стилей

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Вы уверены, что хотите выйти?')) {
            removeAuthToken();
            navigate('/admin/login');
        }
    };

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h3>Админ-Панель</h3>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <Link to="/admin/categories">Категории</Link>
                        </li>
                        <li>
                            <Link to="/admin/users">Пользователи</Link>
                        </li>
                        <li>
                            <Link to="/admin/orders">Заказы</Link>
                        </li>
                    </ul>
                </nav>
                <button onClick={handleLogout} className="logout-button">
                    Выйти
                </button>
            </aside>
            <main className="content">
                <header className="main-header">
                    <h1>Добро пожаловать в админ-панель!</h1>
                    {/* Кнопка уведомлений, если нужна */}
                    <button className="notification-button">Уведомления</button>
                </header>
                <div className="page-content">
                    <Outlet /> {/* Здесь будут отображаться дочерние маршруты */}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;