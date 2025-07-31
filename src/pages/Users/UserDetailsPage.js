// src/pages/Users/UserDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../../api/apiService';
import styles from './UserDetailsPage.module.css';

const UserDetailsPage = () => {
    const { userId } = useParams(); // Получаем userId из URL
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const IMAGE_BASE_URL = 'https://automser.store/'; // Базовый URL для изображений

    useEffect(() => {
        const fetchUserDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await api.getUserById(userId);
                setUserDetails(response.data);
            } catch (err) {
                console.error('Ошибка при получении деталей пользователя:', err);
                setError('Не удалось загрузить информацию о пользователе. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserDetails();
        } else {
            setError('ID пользователя не указан.');
            setLoading(false);
        }
    }, [userId]);

    const translateOrderStatus = (status) => {
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

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Загрузка информации о пользователе...</p>
            </div>
        );
    }

    if (error) {
        return <div className={styles.errorAlert}>{error}</div>;
    }

    if (!userDetails) {
        return <div className={styles.emptyState}>Пользователь не найден.</div>;
    }

    return (
        <div className={styles.container}>
            <button onClick={() => navigate('/admin/users')} className={styles.backButton}>
                <i className="fas fa-arrow-left"></i> Назад к списку пользователей
            </button>

            <div className={styles.header}>
                <h2>Информация о пользователе: {userDetails.username}</h2>
                <p>Подробные данные о пользователе, его автомобилях и заказах.</p>
            </div>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Личные данные</h3>
                <div className={styles.personalInfo}>
                    <div className={styles.userAvatarLarge}>
                        {userDetails.link_img ? (
                            <img
                                src={`${IMAGE_BASE_URL}${userDetails.link_img}`}
                                alt={userDetails.username}
                                className={styles.avatarImageLarge}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentNode.querySelector('i').style.display = 'block';
                                }}
                            />
                        ) : null}
                        <i className="fas fa-user-circle" style={{ display: userDetails.link_img ? 'none' : 'block' }}></i>
                    </div>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <strong>Имя пользователя:</strong> {userDetails.username}
                        </div>
                        <div className={styles.infoItem}>
                            <strong>Email:</strong> {userDetails.email}
                        </div>
                        <div className={styles.infoItem}>
                            <strong>Дата рождения:</strong> {userDetails.birth_date || 'Не указана'}
                        </div>
                        <div className={styles.infoItem}>
                            <strong>Телефон:</strong> {userDetails.phone_number || 'Не указан'}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Автомобили пользователя</h3>
                {userDetails.cars && userDetails.cars.length > 0 ? (
                    <div className={styles.carsList}>
                        {userDetails.cars.map((car) => (
                            <div key={car.id_car} className={styles.carCard}>
                                {/* Контейнер для изображения автомобиля */}
                                <div className={styles.carImageContainer}>
                                    {car.link_img ? (
                                        <img
                                            src={`${IMAGE_BASE_URL}${car.link_img}`}
                                            alt={`${car.model?.brand?.brand_name} ${car.model?.model_name}`}
                                            className={styles.carImage}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                                e.target.parentNode.querySelector('i').style.display = 'block';
                                            }}
                                        />
                                    ) : null}
                                    {/* Заглушка, если изображения нет или оно не загрузилось */}
                                    <i className="fas fa-car" style={{ display: car.link_img ? 'none' : 'block' }}></i>
                                </div>
                                <div className={styles.carInfo}>
                                    <strong>{car.model?.brand?.brand_name} {car.model?.model_name}</strong>
                                    <p>Год: {car.year}</p>
                                    <p>Номер: {car.license_plate}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <i className="fas fa-car"></i>
                        <p>У пользователя нет зарегистрированных автомобилей.</p>
                    </div>
                )}
            </div>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Заказы пользователя</h3>
                {userDetails.orders && userDetails.orders.length > 0 ? (
                    <div className={styles.ordersList}>
                        {userDetails.orders.map((order) => (
                            <div key={order.id_order} className={styles.orderCard}>
                                <div className={styles.orderHeader}>
                                    <strong>Заказ #{order.id_order}</strong>
                                </div>
                                <div className={styles.orderInfo}>
                                    {/* Форматируем время, оставляя только часы и минуты */}
                                    <p>Дата: {order.date} {order.time?.substring(0, 5)}</p>
                                    <p>Автомобиль: {order.car?.model?.brand?.brand_name} {order.car?.model?.model_name} ({order.car?.license_plate})</p>
                                    <p>Услуги: {order.services && order.services.length > 0 ? order.services.map(s => s.service_name).join(', ') : 'Нет услуг'}</p>
                                </div>
                                <span className={styles.orderStatus}>{translateOrderStatus(order.status)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <i className="fas fa-shopping-basket"></i>
                        <p>У пользователя нет заказов.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDetailsPage;
