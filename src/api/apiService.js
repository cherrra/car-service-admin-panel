// src/api/apiService.js
import axios from 'axios';
import { getAuthToken, removeAuthToken } from '../utils/auth'; // Импортируем обе функции

// ИСПРАВЛЕНО: Убрано Markdown-форматирование из URL.
// Базовый URL вашего API. Убедитесь, что он заканчивается на слэш.
const BASE_URL = 'https://automser.store/api/';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ДОБАВЛЕННЫЙ ПЕРЕХВАТЧИК ЗАПРОСОВ:
// Этот перехватчик будет добавлять токен в заголовок Authorization для каждого исходящего запроса.
api.interceptors.request.use(
    (config) => {
        const token = getAuthToken(); // Получаем токен из localStorage
        if (token) {
            // ВАЖНО: Убедитесь, что ваш бэкенд ожидает именно "Bearer " перед токеном.
            // Стандарт OAuth 2.0 и большинство бэкендов на Spring Security ожидают этот формат.
            // Если ваш бэкенд ожидает просто токен без "Bearer ", измените строку ниже на:
            // config.headers.Authorization = token;
            config.headers.Authorization = `Bearer ${token}`; 
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// СУЩЕСТВУЮЩИЙ ПЕРЕХВАТЧИК ОТВЕТОВ:
// Этот перехватчик обрабатывает ошибки, такие как 401 (Unauthorized) или 403 (Forbidden),
// и перенаправляет пользователя на страницу входа, если токен недействителен.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn('Аутентификация не удалась или токен истек. Перенаправление на страницу входа.');
            removeAuthToken(); // Удаляем недействительный токен из localStorage
            // Используем window.location.href для полного перезагрузки страницы и сброса состояния
            window.location.href = '/admin/login'; 
        }
        return Promise.reject(error);
    }
);

// --- Endpoints аутентификации ---
export const login = (email, password) => {
    // ИСПРАВЛЕНО: Возвращено использование экземпляра 'api' с его baseURL.
    // Проблема с 404 должна быть решена после исправления BASE_URL.
    return api.post('auth/login', { email, password });
};

export const register = (username, email, password) => {
    return api.post('auth/register', { username, email, password });
};

export const getUserDetails = () => {
    return api.get('auth/user');
};

export const deleteAccount = () => {
    return api.delete('auth/delete');
};

export const updateUser = (userData) => {
    return api.put('auth/user', userData);
};

// --- Endpoints для загрузки изображений (зависит от вашей реализации бэкенда) ---
export const uploadImage = (formData) => {
    return api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const uploadImageCar = (carId, formData) => {
    return api.post(`cars/${carId}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// --- Endpoints для автомобилей ---
export const getCars = () => {
    return api.get('cars');
};

export const deleteCar = (carId) => {
    return api.delete(`cars/${carId}`);
};

export const addCar = (carData) => {
    return api.post('cars', carData);
};

export const updateCar = (carId, carData) => {
    return api.put(`cars/${carId}`, carData);
};

// --- Endpoints для категорий ---
export const getCategories = () => {
    return api.get('categories');
};

export const createCategory = (categoryName) => {
    return api.post('categories', { categoryName });
};

export const updateCategory = (categoryId, newCategoryName) => {
    return api.put(`categories/${categoryId}`, { categoryName: newCategoryName });
};

export const deleteCategory = (categoryId) => {
    return api.delete(`categories/${categoryId}`);
};

// --- Endpoints для услуг ---
export const getServices = (categoryId) => {
    return api.get(`services?id_category=${categoryId}`);
};

export const addService = (serviceData) => {
    return api.post('services', serviceData);
};

export const updateService = (serviceId, serviceData) => {
    return api.put(`services/${serviceId}`, serviceData);
};

export const deleteService = (serviceId) => {
    return api.delete(`services/${serviceId}`);
};

// --- Endpoints для заказов ---
export const getOrders = () => {
    return api.get('orders');
};

export const getAdminOrders = () => {
    return api.get('orders/admin');
};

export const deleteOrder = (orderId) => {
    return api.delete(`orders/${orderId}`);
};

export const updateOrderStatus = (orderId, newStatus) => {
    return api.put(`orders/admin/${orderId}`, { status: newStatus });
};

// --- Endpoints для пользователей ---
export const getUsers = () => {
    return api.get('users');
};

export const getUserById = (userId) => {
    return api.get(`users/${userId}`);
};

export const deleteUser = (userId) => {
    return api.delete(`users/${userId}`);
};