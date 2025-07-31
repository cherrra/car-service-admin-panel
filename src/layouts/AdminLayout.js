// src/layouts/AdminLayout.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../utils/auth';
import * as api from '../api/apiService';
import styles from './AdminLayout.module.css';
import logo from '../assets/logo.png'; // Импортируем логотип

// Компонент для всплывающего уведомления (тоста)
const Toast = ({ message, onClose }) => {
    useEffect(() => {
        console.log("Toast: Компонент Toast монтируется.");
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Тост исчезнет через 5 секунд
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={styles.toast}>
            <i className="fas fa-bell"></i>
            <span>{message}</span>
            <button onClick={onClose} className={styles.toastCloseButton}>&times;</button>
        </div>
    );
};

const AdminLayout = () => {
    console.log("AdminLayout: Функция компонента AdminLayout вызывается."); // Лог в начале функции
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const audioRef = useRef(null); // Ссылка на аудиоэлемент

    // Загрузка уведомлений из localStorage при монтировании
    useEffect(() => {
        const storedNotifications = JSON.parse(localStorage.getItem('adminNotifications')) || [];
        const lastChecked = localStorage.getItem('lastCheckedOrderTimestamp') || '0';
        
        console.log("AdminLayout (useEffect 1): Загрузка начальных данных из localStorage.");
        console.log("AdminLayout (useEffect 1): Загруженные уведомления:", storedNotifications);
        console.log("AdminLayout (useEffect 1): Загружен lastCheckedOrderTimestamp:", lastChecked);

        setNotifications(storedNotifications);
        setUnreadCount(storedNotifications.filter(n => !n.read).length);

        
        return () => {
            console.log("AdminLayout (useEffect 1): Компонент AdminLayout размонтируется.");
        };
    }, []); // Пустой массив зависимостей, чтобы эффект запускался только при монтировании

    // Сохранение уведомлений в localStorage при их изменении
    useEffect(() => {
        console.log("AdminLayout (useEffect 2): Уведомления изменились. Сохраняем в localStorage.");
        localStorage.setItem('adminNotifications', JSON.stringify(notifications));
        setUnreadCount(notifications.filter(n => !n.read).length);
        console.log("AdminLayout (useEffect 2): Уведомления обновлены в localStorage. Текущий список:", notifications);
    }, [notifications]);

    // Функция для воспроизведения звука
    const playNotificationSound = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.error("Ошибка воспроизведения звука:", e));
        }
    };

    // Функция для проверки новых заказов
    const checkNewOrders = async () => {
        console.log("checkNewOrders: Проверяем новые заказы...");
        try {
            const response = await api.getAdminOrders();
            const currentOrders = response.data;
            const lastCheckedTimestamp = parseInt(localStorage.getItem('lastCheckedOrderTimestamp') || '0');
            let newLastCheckedTimestamp = lastCheckedTimestamp;

            console.log("checkNewOrders: Текущие заказы с API:", currentOrders);
            console.log("checkNewOrders: Последняя проверенная метка времени из localStorage:", lastCheckedTimestamp);
            console.log("checkNewOrders: Текущее состояние notifications (до добавления новых):", notifications);

            const newNotifications = [];

            currentOrders.forEach(order => {
                const orderTimestamp = new Date(order.order_date).getTime(); // Предполагаем, что order_date - это строка даты/времени
                
                // Проверяем, является ли заказ новее, чем последний проверенный
                const isNewer = orderTimestamp > lastCheckedTimestamp;
                // Проверяем, существует ли уже уведомление для этого orderId в текущем состоянии
                const isDuplicate = notifications.some(n => n.orderId === order.id_order);

                console.log(`checkNewOrders: Заказ #${order.id_order}: Timestamp=${orderTimestamp}, isNewer=${isNewer}, isDuplicate=${isDuplicate}`);

                if (isNewer && !isDuplicate) {
                    const notificationText = `Новый заказ #${order.id_order} от ${order.user_name || 'Неизвестный пользователь'} на сумму ${order.total_price || 'N/A'} ₽`;
                    newNotifications.push({
                        id: `${order.id_order}-${Date.now()}`, // Уникальный ID для уведомления
                        orderId: order.id_order, // ID заказа для проверки дубликатов
                        text: notificationText,
                        timestamp: orderTimestamp,
                        read: false,
                    });
                    
                    // Обновляем метку времени последнего проверенного заказа
                    if (orderTimestamp > newLastCheckedTimestamp) {
                        newLastCheckedTimestamp = orderTimestamp;
                    }

                    // Показываем тост и воспроизводим звук
                    setToastMessage(notificationText);
                    setShowToast(true);
                    playNotificationSound();
                }
            });

            if (newNotifications.length > 0) {
                setNotifications(prev => {
                    const updated = [...prev, ...newNotifications].sort((a, b) => b.timestamp - a.timestamp);
                    console.log("checkNewOrders: Добавлены новые уведомления. Обновленное состояние notifications:", updated);
                    return updated;
                });
                localStorage.setItem('lastCheckedOrderTimestamp', newLastCheckedTimestamp.toString());
                console.log("checkNewOrders: Обновлен lastCheckedOrderTimestamp в localStorage:", newLastCheckedTimestamp);
            } else {
                console.log("checkNewOrders: Новых уведомлений не найдено.");
            }

        } catch (err) {
            console.error('checkNewOrders: Ошибка при проверке новых заказов:', err);
        }
    };

    // Запуск проверки заказов при монтировании компонента и установка интервала
    useEffect(() => {
        console.log("AdminLayout (useEffect 3): Запуск проверки заказов и установка интервала.");
        checkNewOrders(); // Проверяем сразу при загрузке
        const intervalId = setInterval(checkNewOrders, 30000); // Проверяем каждые 30 секунд
        return () => {
            clearInterval(intervalId); // Очищаем интервал при размонтировании
            console.log("AdminLayout (useEffect 3): Интервал проверки заказов очищен.");
        };
    }, []); // Добавил notifications в зависимости, чтобы ensure latest state is used in checkNewOrders

    const handleLogout = () => {
        if (window.confirm('Вы уверены, что хотите выйти?')) {
            removeAuthToken(); // Эта функция, как мы обсуждали, не должна очищать уведомления
            navigate('/admin/login');
        }
    };

    const handleNotificationClick = () => {
        navigate('/admin/notifications');
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
                        <button className={styles.notificationButton} onClick={handleNotificationClick}>
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
            {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
        </div>
    );
};

export default AdminLayout;
