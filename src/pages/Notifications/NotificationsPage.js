// src/pages/Notifications/NotificationsPage.js
import React, { useState, useEffect } from 'react';
import styles from './NotificationsPage.module.css'; // Создайте этот файл стилей

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Загружаем уведомления из localStorage при монтировании
        const storedNotifications = JSON.parse(localStorage.getItem('adminNotifications')) || [];
        setNotifications(storedNotifications.sort((a, b) => b.timestamp - a.timestamp)); // Сортируем по убыванию даты
    }, []);

    const handleMarkAllAsRead = () => {
        // Отмечаем все уведомления как прочитанные
        const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updatedNotifications);
        localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
    };

    const handleDeleteNotification = (idToDelete) => {
        const updatedNotifications = notifications.filter(n => n.id !== idToDelete);
        setNotifications(updatedNotifications);
        localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Уведомления администратора</h2>
                <p>Здесь отображаются уведомления о новых заказах и других важных событиях.</p>
            </div>

            {notifications.length > 0 && (
                <div className={styles.actionsBar}>
                    <button onClick={handleMarkAllAsRead} className={styles.markAllReadButton}>
                        <i className="fas fa-check-double"></i> Отметить все как прочитанные
                    </button>
                </div>
            )}

            {notifications.length === 0 ? (
                <div className={styles.emptyState}>
                    <i className="fas fa-bell-slash"></i>
                    <p>Уведомлений нет.</p>
                </div>
            ) : (
                <div className={styles.notificationsList}>
                    {notifications.map((notification) => (
                        <div 
                            key={notification.id} 
                            className={`${styles.notificationCard} ${notification.read ? styles.read : styles.unread}`}
                        >
                            <div className={styles.notificationContent}>
                                <i className="fas fa-info-circle"></i>
                                <span>{notification.text}</span>
                            </div>
                            <div className={styles.notificationMeta}>
                                <span className={styles.notificationTime}>
                                    {new Date(notification.timestamp).toLocaleString('ru-RU')}
                                </span>
                                <button 
                                    className={styles.deleteNotificationButton}
                                    onClick={() => handleDeleteNotification(notification.id)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
