// src/pages/Auth/Auth.js
import React, { useState } from 'react';
import { login } from '../../api/apiService'; // Импортируем функцию login
import { setAuthToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import './Auth.module.css'; // Стили для страницы авторизации

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Сбрасываем предыдущие ошибки
        try {
            // Вызываем функцию login из apiService.js
            const response = await login(email, password);

            // ИЗМЕНЕНО: Теперь ожидаем токен по ключу 'accessToken', как возвращает ваш бэкенд
            const token = response.data.accessToken; 

            if (token) {
                setAuthToken(token); // Токен успешно сохраняется в localStorage
                navigate('/admin/categories'); // Перенаправляем пользователя на страницу категорий
            } else {
                // Если токен отсутствует в ответе, выводим ошибку
                setError('Неверный ответ от сервера: токен отсутствует в ответе.');
                console.error('API response data (для отладки):', response.data); 
            }
        } catch (err) {
            // Обработка ошибок при входе (например, неверные учетные данные)
            console.error('Ошибка входа:', err.response ? err.response.data : err.message);
            setError('Неверный адрес электронной почты или пароль. Пожалуйста, попробуйте снова.');
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleLogin} className="auth-form">
                <h2>Вход для администратора</h2>
                {error && <p className="error-message">{error}</p>} {/* Отображаем сообщение об ошибке */}
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Пароль:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Войти</button>
            </form>
        </div>
    );
};

export default Auth;