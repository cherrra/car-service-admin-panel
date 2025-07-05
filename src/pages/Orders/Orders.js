// src/pages/Orders/Orders.js
import React, { useState, useEffect } from 'react';
import * as api from '../../api/apiService';
import './Orders.module.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    // Статусы, как они приходят с бэкенда.
    const orderStatuses = ['created', 'accepted', 'in_progress', 'completed', 'finished', 'canceled']; 

    useEffect(() => {
        console.log('Orders компонент смонтирован. Запускаю fetchOrders...');
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Начинаю запрос к API для получения заказов...');
            const response = await api.getAdminOrders();
            console.log('Ответ API для заказов:', response.data); 
            setOrders(response.data);
        } catch (err) {
            console.error('Ошибка при получении заказов (полный объект ошибки):', err);
            console.error('Сообщение об ошибке:', err.message);
            if (err.response) {
                console.error('Статус ответа API:', err.response.status);
                console.error('Данные ответа API:', err.response.data);
            }
            setError('Не удалось загрузить заказы. Проверьте консоль для деталей.');
        } finally {
            setLoading(false);
            console.log('Завершение fetchOrders.');
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        setError('');
        try {
            console.log('Попытка обновить статус заказа:', orderId, newStatus);
            await api.updateOrderStatus(orderId, newStatus);
            fetchOrders(); // Обновляем список заказов после успешного обновления
            console.log('Статус заказа успешно обновлен.');
        } catch (err) {
            console.error('Ошибка при обновлении статуса заказа (полный объект ошибки):', err);
            setError('Не удалось обновить статус заказа. Проверьте консоль для деталей.');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        setError('');
        if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
            try {
                console.log('Попытка удалить заказ:', orderId);
                await api.deleteOrder(orderId);
                fetchOrders(); // Обновляем список заказов после успешного удаления
                console.log('Заказ успешно удален.');
            } catch (err) {
                console.error('Ошибка при удалении заказа (полный объект ошибки):', err);
                setError('Не удалось удалить заказ. Проверьте консоль для деталей.');
            }
        }
    };

    // Вспомогательная функция для перевода статусов (как в Android)
    const translateStatus = (status) => {
        switch (status?.toLowerCase()) { // Используем ?. для безопасного доступа
            case "created": return "Создан";
            case "accepted": return "Принят";
            case "in_progress": return "В процессе";
            case "completed": return "Выполнен";
            case "finished": return "Завершен";
            case "canceled": return "Отменён";
            default: return status || "Неизвестно";
        }
    };

    // Вспомогательная функция для форматирования даты (как в Android)
    const formatDate = (rawDate) => {
        if (!rawDate) return "Не указано";
        try {
            const date = new Date(rawDate); // JavaScript может парсить "YYYY-MM-DD"
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            console.error("Ошибка форматирования даты:", e);
            return rawDate;
        }
    };

    if (loading) {
        return <div className="loading">Загрузка заказов...</div>;
    }

    return (
        <div className="orders-container">
            <h2>Управление заказами</h2>

            {error && <p className="error-message">{error}</p>}

            <div className="orders-list">
                <h3>Список заказов</h3>
                {orders.length === 0 ? (
                    <p>Заказы не найдены.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Пользователь</th>
                                <th>Автомобиль</th>
                                <th>Дата</th>
                                <th>Статус</th>
                                <th>Стоимость</th>
                                <th>Услуги</th>
                                <th>Комментарий</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                // ИСПРАВЛЕНО: Используем order.id_order для ключа
                                <tr key={order.id_order}> 
                                    {/* ИСПРАВЛЕНО: Используем правильные имена свойств из API */}
                                    <td>{order.id_order}</td> 
                                    <td>{order.user_name} ({order.user_email})</td> 
                                    <td>
                                        {/* Обработка вложенного объекта 'car' */}
                                        {order.car && order.car.model && order.car.model.brand && order.car.model.brand.brand_name && order.car.model.model_name
                                            ? `${order.car.model.brand.brand_name} ${order.car.model.model_name}`
                                            : "Не указано"}
                                    </td>
                                    {/* ИСПРАВЛЕНО: Используем order.order_date и функцию formatDate */}
                                    <td>{formatDate(order.order_date)}</td> 
                                    <td>
                                        <select
                                            value={order.status}
                                            // ИСПРАВЛЕНО: Используем order.id_order для обновления статуса
                                            onChange={(e) => handleUpdateOrderStatus(order.id_order, e.target.value)}
                                        >
                                            {orderStatuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {translateStatus(status)} {/* ИСПРАВЛЕНО: Переводим статус для отображения */}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    {/* ИСПРАВЛЕНО: Отображаем total_price */}
                                    <td>{order.total_price ? `${order.total_price} руб.` : 'N/A'}</td>
                                    {/* ИСПРАВЛЕНО: Отображаем услуги */}
                                    <td>{order.services || 'Нет услуг'}</td>
                                    {/* ИСПРАВЛЕНО: Отображаем комментарий */}
                                    <td>{order.comment || 'Нет'}</td>
                                    <td>
                                        <button
                                            className="delete-button"
                                            // ИСПРАВЛЕНО: Используем order.id_order для удаления
                                            onClick={() => handleDeleteOrder(order.id_order)}
                                        >
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Orders;
