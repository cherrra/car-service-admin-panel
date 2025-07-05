// src/layouts/AdminLayout.js
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../utils/auth';
import styles from './AdminLayout.module.css';
import logo from '../assets/logo.png'; // Импортируем логотип

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Вы уверены, что хотите выйти?')) {
            removeAuthToken();
            navigate('/admin/login');
        }
    };

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <img src={logo} alt="Automanservice Logo" className={styles.logo} />
                    <h3>Automanservice</h3>
                </div>
                <nav className={styles.sidebarNav}>
                    <ul>
                        <li>
                            <Link to="/admin/categories" className={styles.navLink}>
                                <i className={`${styles.icon} fas fa-list`}></i>
                                <span>Категории</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/users" className={styles.navLink}>
                                <i className={`${styles.icon} fas fa-users`}></i>
                                <span>Пользователи</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/orders" className={styles.navLink}>
                                <i className={`${styles.icon} fas fa-shopping-cart`}></i>
                                <span>Заказы</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    <i className={`${styles.icon} fas fa-sign-out-alt`}></i>
                    <span>Выйти</span>
                </button>
            </aside>
            <main className={styles.content}>
                <header className={styles.mainHeader}>
                    <h1>Панель управления Automanservice</h1>
                    <div className={styles.headerActions}>
                        <button className={styles.notificationButton}>
                            <i className="fas fa-bell"></i>
                        </button>
                        <div className={styles.userProfile}>
                            <i className="fas fa-user-circle"></i>
                        </div>
                    </div>
                </header>
                <div className={styles.pageContent}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;