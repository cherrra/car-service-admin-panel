// src/pages/Orders/Orders.js
import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../api/apiService';
import styles from './Orders.module.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all'); // 'all', 'active', 'archived'
    const [searchQuery, setSearchQuery] = useState(''); // Для поиска по ID заказа или имени пользователя

    // orderStatuses остается здесь, так как используется в рендеринге select
    const orderStatuses = ['created', 'accepted', 'in_progress', 'completed', 'finished', 'canceled'];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.getAdminOrders();
            setOrders(response.data);
        } catch (err) {
            console.error('Ошибка при получении заказов:', err);
            setError('Не удалось загрузить заказы. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    // Мемоизированный список заказов после применения фильтров и поиска
    const filteredOrders = useMemo(() => {
        // Определяем статусы для активных и завершенных/отмененных заказов внутри useMemo
        // Это устраняет предупреждение react-hooks/exhaustive-deps
        const activeStatuses = ['created', 'accepted', 'in_progress'];
        const archivedStatuses = ['completed', 'finished', 'canceled'];

        let currentOrders = orders;

        // 1. Фильтрация по типу статуса
        if (filterType === 'active') {
            currentOrders = currentOrders.filter(order => activeStatuses.includes(order.status));
        } else if (filterType === 'archived') {
            currentOrders = currentOrders.filter(order => archivedStatuses.includes(order.status));
        }

        // 2. Поиск по ID заказа или имени пользователя
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            currentOrders = currentOrders.filter(order =>
                order.id_order.toString().includes(lowerCaseQuery) || // Поиск по ID заказа
                (order.user_name && order.user_name.toLowerCase().includes(lowerCaseQuery)) // Поиск по имени пользователя
            );
        }

        return currentOrders;
    }, [orders, filterType, searchQuery]); // Зависимости обновлены

    const translateStatus = (status) => {
        switch (status?.toLowerCase()) {
            case "created": return "Создан";
            case "accepted": return "Принят";
            case "in_progress": return "В процессе";
            case "completed": return "Выполнен";
            case "finished": return "Завершен";
            case "canceled": return "Отменён";
            default: return status || "Неизвестно";
        }
    };

    const formatDate = (rawDate) => {
        if (!rawDate) return "Не указано";
        try {
            const date = new Date(rawDate);
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

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        setError('');
        try {
            await api.updateOrderStatus(orderId, newStatus);
            fetchOrders(); // Перезагружаем заказы после обновления статуса
        } catch (err) {
            console.error('Ошибка при обновлении статуса заказа:', err);
            setError('Не удалось обновить статус заказа.');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        // ВНИМАНИЕ: window.confirm блокирует UI. В реальном приложении рекомендуется использовать пользовательский модальный диалог.
        if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
            try {
                await api.deleteOrder(orderId);
                fetchOrders(); // Перезагружаем заказы после удаления
            } catch (err) {
                console.error('Ошибка при удалении заказа:', err);
                setError('Не удалось удалить заказ.');
            }
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Загрузка заказов...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Управление заказами</h2>
                <p>Просмотр и управление всеми заказами клиентов</p>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Список заказов</h3>
                    <span className={styles.badge}>{filteredOrders.length} заказов</span> {/* Используем filteredOrders.length */}
                </div>

                <div className={styles.filtersContainer}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="statusFilter">Фильтр по статусу:</label>
                        <select
                            id="statusFilter"
                            className={styles.selectFilter}
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">Все заказы</option>
                            <option value="active">Активные</option>
                            <option value="archived">Завершенные/Отмененные</option>
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label htmlFor="search">Поиск (ID заказа / Имя пользователя):</label>
                        <input
                            type="text"
                            id="search"
                            className={styles.searchInput}
                            placeholder="Введите ID или имя пользователя"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <i className="fas fa-box-open"></i>
                        <p>Заказы не найдены, соответствующие вашим критериям.</p>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Пользователь</th>
                                    <th>Автомобиль</th>
                                    <th>Дата</th>
                                    <th>Статус</th>
                                    <th>Стоимость</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => ( // Используем filteredOrders
                                    <tr key={order.id_order}>
                                        <td>#{order.id_order}</td>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={styles.userAvatar}>
                                                    <i className="fas fa-user"></i>
                                                </div>
                                                <div>
                                                    <div className={styles.userName}>{order.user_name}</div>
                                                    <div className={styles.userEmail}>{order.user_email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {order.car && order.car.model && order.car.model.brand && order.car.model.brand.brand_name && order.car.model.model_name
                                                ? `${order.car.model.brand.brand_name} ${order.car.model.model_name}`
                                                : "Не указано"}
                                        </td>
                                        <td>{formatDate(order.order_date)}</td>
                                        <td>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateOrderStatus(order.id_order, e.target.value)}
                                                className={styles.statusSelect}
                                            >
                                                {orderStatuses.map((status) => (
                                                    <option key={status} value={status}>
                                                        {translateStatus(status)}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className={styles.priceCell}>
                                            {order.total_price ? `${order.total_price} ₽` : 'N/A'}
                                        </td>
                                        <td>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteOrder(order.id_order)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
