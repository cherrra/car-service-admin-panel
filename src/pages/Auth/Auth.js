// src/pages/Auth/Auth.js
import React, { useState } from 'react';
import { login } from '../../api/apiService';
import { setAuthToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import logo from '../../assets/logo_main.png'; // Предполагается, что этот путь верен

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await login(email, password);
            const token = response.data.accessToken;

            if (token) {
                setAuthToken(token);
                navigate('/admin/categories');
            } else {
                setError('Неверный ответ от сервера: токен отсутствует');
                console.error('API response:', response.data);
            }
        } catch (err) {
            console.error('Ошибка входа:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Неверный email или пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <div className={styles.logo}>
                        <img src={logo} alt="Automanservice Logo" />
                    </div>
                    <h2>Панель управления</h2>
                    <p>Введите ваши учетные данные для входа</p>
                </div>
                
                {error && (
                    <div className={styles.errorAlert}>
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className={styles.authForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <div className={styles.inputWrapper}>
                            <i className="fas fa-envelope"></i>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Введите ваш email"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Пароль</label>
                        <div className={styles.inputWrapper}>
                            <i className="fas fa-lock"></i>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введите ваш пароль"
                                required
                            />
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        className={styles.loginButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                <span>Вход...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sign-in-alt"></i>
                                <span>Войти</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
