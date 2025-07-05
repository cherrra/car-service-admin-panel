// src/pages/Users/Users.js
import React, { useState, useEffect } from 'react';
import * as api from '../../api/apiService';
import './Users.module.css'; // Создайте этот файл для стилей

const Users = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

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
        setError('');
        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            try {
                await api.deleteUser(userId);
                fetchUsers(); // Обновляем список пользователей
            } catch (err) {
                console.error('Ошибка при удалении пользователя:', err);
                setError('Не удалось удалить пользователя.');
            }
        }
    };

    if (loading) {
        return <div className="loading">Загрузка пользователей...</div>;
    }

    return (
        <div className="users-container">
            <h2>Управление пользователями</h2>

            {error && <p className="error-message">{error}</p>}

            <div className="users-list">
                <h3>Список пользователей</h3>
                {users.length === 0 ? (
                    <p>Пользователи не найдены.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Имя пользователя</th>
                                <th>Email</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteUser(user.id)}
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

export default Users;