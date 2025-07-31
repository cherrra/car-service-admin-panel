// src/pages/Users/Users.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import * as api from '../../api/apiService';
import styles from './Users.module.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Инициализируем useNavigate

    // Базовый URL для изображений. Убедитесь, что он соответствует вашему серверу,
    // где хранятся загруженные изображения.
    const IMAGE_BASE_URL = 'https://automser.store/'; 

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.getUsers();
            setUsers(response.data);
        } catch (err) {
            console.error('Ошибка при получении пользователей:', err);
            setError('Не удалось загрузить пользователей.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            try {
                await api.deleteUser(userId);
                fetchUsers();
            } catch (err) {
                console.error('Ошибка при удалении пользователя:', err);
                setError('Не удалось удалить пользователя.');
            }
        }
    };

    // Обработчик клика по карточке пользователя
    const handleUserCardClick = (userId) => {
        navigate(`/admin/users/${userId}`);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Загрузка пользователей...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Управление пользователями</h2>
                <p>Список всех зарегистрированных пользователей</p>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Список пользователей</h3>
                    <span className={styles.badge}>{users.length} пользователей</span>
                </div>

                {users.length === 0 ? (
                    <div className={styles.emptyState}>
                        <i className="fas fa-users"></i>
                        <p>Пользователи не найдены</p>
                    </div>
                ) : (
                    <div className={styles.usersList}>
                        {users.map((user) => (
                            <div 
                                key={user.id} 
                                className={styles.userCard}
                                onClick={() => handleUserCardClick(user.id)} // Добавлен обработчик клика
                            >
                                <div className={styles.userAvatar}>
                                    {user.link_img ? (
                                        <img
                                            src={`${IMAGE_BASE_URL}${user.link_img}`}
                                            alt={user.username}
                                            className={styles.avatarImage}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                                e.target.parentNode.querySelector('i').style.display = 'block';
                                            }}
                                        />
                                    ) : null}
                                    <i className="fas fa-user-circle" style={{ display: user.link_img ? 'none' : 'block' }}></i>
                                </div>
                                <div className={styles.userInfo}>
                                    <h4 className={styles.userName}>{user.username}</h4>
                                    <p className={styles.userEmail}>{user.email}</p>
                                </div>
                                {/* Кнопка удаления остается, но теперь она не вызывает навигацию при клике */}
                                <button
                                    className={styles.deleteButton}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Останавливаем всплытие события, чтобы не сработал клик по карточке
                                        handleDeleteUser(user.id);
                                    }}
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
