// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Auth from './pages/Auth/Auth';
import Categories from './pages/Categories/Categories';
import Users from './pages/Users/Users';
import UserDetailsPage from './pages/Users/UserDetailsPage';
import Orders from './pages/Orders/Orders';
import Services from './pages/Services/Services';
import PrivateRoute from './components/PrivateRoute';
import NotificationsPage from './pages/Notifications/NotificationsPage'
import './App.css'; // Глобальные стили, если нужны

function App() {
    return (
        <Router>
            <Routes>
                {/* Маршрут для входа */}
                <Route path="/admin/login" element={<Auth />} />

                {/* Защищенные маршруты для админ-панели */}
                <Route path="/admin" element={<PrivateRoute />}>
                    <Route element={<AdminLayout />}>
                        {/* По умолчанию перенаправляем на категории при входе в админку */}
                        <Route index element={<Navigate to="categories" replace />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="users" element={<Users />} />
                        <Route path="users/:userId" element={<UserDetailsPage />} />
                        <Route path="orders" element={<Orders />} />
                        {/* Маршрут для услуг. Обратите внимание на параметр URL для ID категории */}
                        <Route path="services" element={<Services />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        {/* Вы также можете добавить маршрут, если ID категории будет частью пути, например: */}
                        {/* <Route path="categories/:categoryId/services" element={<Services />} /> */}
                    </Route>
                </Route>

                {/* Перенаправление с корневого URL на страницу входа админки */}
                <Route path="/" element={<Navigate to="/admin/login" replace />} />
                <Route path="*" element={<h1>404: Страница не найдена</h1>} /> {/* Обработка 404 */}
            </Routes>
        </Router>
    );
}

export default App;