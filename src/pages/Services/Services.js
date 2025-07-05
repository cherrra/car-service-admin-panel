// src/pages/Services/Services.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as api from '../../api/apiService';
import './Services.module.css'; // Создайте этот файл для стилей

const Services = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const categoryId = queryParams.get('id_category'); // Получаем categoryId из URL

    const [services, setServices] = useState([]);
    const [newService, setNewService] = useState({
        serviceName: '',
        description: '',
        price: '',
        id_category: categoryId || '', // Устанавливаем id_category, если есть
    });
    const [editingService, setEditingService] = useState(null); // { id, name, desc, price }
    const [editServiceData, setEditServiceData] = useState({
        serviceName: '',
        description: '',
        price: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (categoryId) {
            fetchServices(categoryId);
        } else {
            setError('ID категории не указан.');
            setLoading(false);
        }
    }, [categoryId]);

    const fetchServices = async (id) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.getServices(id);
            setServices(response.data);
        } catch (err) {
            console.error('Ошибка при получении услуг:', err);
            setError('Не удалось загрузить услуги.');
        } finally {
            setLoading(false);
        }
    };

    const handleNewServiceChange = (e) => {
        const { name, value } = e.target;
        setNewService((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        setError('');
        if (!newService.serviceName.trim() || !newService.description.trim() || !newService.price.trim()) {
            setError('Все поля услуги должны быть заполнены.');
            return;
        }
        if (!categoryId) {
            setError('Невозможно добавить услугу без ID категории.');
            return;
        }
        try {
            const serviceDataToSend = {
                ...newService,
                price: parseFloat(newService.price), // Преобразование цены в число
                id_category: parseInt(categoryId), // Убедитесь, что ID категории - число
            };
            await api.addService(serviceDataToSend);
            setNewService({ serviceName: '', description: '', price: '', id_category: categoryId });
            fetchServices(categoryId); // Обновляем список услуг
        } catch (err) {
            console.error('Ошибка при добавлении услуги:', err);
            setError('Не удалось добавить услугу.');
        }
    };

    const handleEditService = (service) => {
        setEditingService(service);
        setEditServiceData({
            serviceName: service.serviceName,
            description: service.description,
            price: service.price.toString(),
        });
    };

    const handleEditServiceChange = (e) => {
        const { name, value } = e.target;
        setEditServiceData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateService = async (e) => {
        e.preventDefault();
        setError('');
        if (!editServiceData.serviceName.trim() || !editServiceData.description.trim() || !editServiceData.price.trim()) {
            setError('Все поля услуги должны быть заполнены.');
            return;
        }
        if (!editingService) return;

        try {
            const serviceDataToSend = {
                ...editServiceData,
                price: parseFloat(editServiceData.price),
                id_category: parseInt(categoryId), // Убедитесь, что ID категории - число
            };
            await api.updateService(editingService.id, serviceDataToSend);
            setEditingService(null);
            setEditServiceData({ serviceName: '', description: '', price: '' });
            fetchServices(categoryId); // Обновляем список услуг
        } catch (err) {
            console.error('Ошибка при обновлении услуги:', err);
            setError('Не удалось обновить услугу.');
        }
    };

    const handleDeleteService = async (serviceId) => {
        setError('');
        if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
            try {
                await api.deleteService(serviceId);
                fetchServices(categoryId); // Обновляем список услуг
            } catch (err) {
                console.error('Ошибка при удалении услуги:', err);
                setError('Не удалось удалить услугу.');
            }
        }
    };

    if (!categoryId) {
        return <div className="info-message">Выберите категорию для просмотра услуг.</div>;
    }

    if (loading) {
        return <div className="loading">Загрузка услуг...</div>;
    }

    return (
        <div className="services-container">
            <h2>Услуги для категории ID: {categoryId}</h2>

            {error && <p className="error-message">{error}</p>}

            <div className="add-service-section">
                <h3>Добавить новую услугу</h3>
                <form onSubmit={handleAddService} className="add-service-form">
                    <input
                        type="text"
                        name="serviceName"
                        placeholder="Название услуги"
                        value={newService.serviceName}
                        onChange={handleNewServiceChange}
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Описание услуги"
                        value={newService.description}
                        onChange={handleNewServiceChange}
                        required
                    ></textarea>
                    <input
                        type="number"
                        name="price"
                        placeholder="Цена"
                        value={newService.price}
                        onChange={handleNewServiceChange}
                        step="0.01"
                        required
                    />
                    <button type="submit">Добавить услугу</button>
                </form>
            </div>

            <div className="services-list">
                <h3>Существующие услуги</h3>
                {services.length === 0 ? (
                    <p>Услуги для этой категории не найдены.</p>
                ) : (
                    <ul>
                        {services.map((service) => (
                            <li key={service.id} className="service-item">
                                {editingService && editingService.id === service.id ? (
                                    <form onSubmit={handleUpdateService} className="edit-service-form">
                                        <input
                                            type="text"
                                            name="serviceName"
                                            value={editServiceData.serviceName}
                                            onChange={handleEditServiceChange}
                                            required
                                        />
                                        <textarea
                                            name="description"
                                            value={editServiceData.description}
                                            onChange={handleEditServiceChange}
                                            required
                                        ></textarea>
                                        <input
                                            type="number"
                                            name="price"
                                            value={editServiceData.price}
                                            onChange={handleEditServiceChange}
                                            step="0.01"
                                            required
                                        />
                                        <button type="submit">Сохранить</button>
                                        <button type="button" onClick={() => setEditingService(null)}>
                                            Отмена
                                        </button>
                                    </form>
                                ) : (
                                    <>
                                        <div>
                                            <h4>{service.serviceName}</h4>
                                            <p>{service.description}</p>
                                            <p>Цена: {service.price} PLN</p>
                                        </div>
                                        <div className="service-actions">
                                            <button
                                                className="edit-button"
                                                onClick={() => handleEditService(service)}
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDeleteService(service.id)}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Services;