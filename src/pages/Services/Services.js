// src/pages/Services/Services.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as api from '../../api/apiService';
import styles from './Services.module.css';

const Services = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const categoryId = queryParams.get('id_category');

    const [services, setServices] = useState([]);
    const [newService, setNewService] = useState({
        serviceName: '',
        description: '',
        price: '',
        id_category: categoryId || '',
    });
    const [editingService, setEditingService] = useState(null);
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

    const handleAddService = async (e) => {
        e.preventDefault();
        setError('');
        if (!newService.serviceName.trim() || !newService.description.trim() || !newService.price.trim()) {
            setError('Все поля услуги должны быть заполнены.');
            return;
        }
        try {
            await api.addService({
                ...newService,
                price: parseFloat(newService.price),
                id_category: parseInt(categoryId),
            });
            setNewService({ serviceName: '', description: '', price: '', id_category: categoryId });
            fetchServices(categoryId);
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

    const handleUpdateService = async (e) => {
        e.preventDefault();
        setError('');
        if (!editServiceData.serviceName.trim() || !editServiceData.description.trim() || !editServiceData.price.trim()) {
            setError('Все поля услуги должны быть заполнены.');
            return;
        }
        try {
            await api.updateService(editingService.id, {
                ...editServiceData,
                price: parseFloat(editServiceData.price),
                id_category: parseInt(categoryId),
            });
            setEditingService(null);
            fetchServices(categoryId);
        } catch (err) {
            console.error('Ошибка при обновлении услуги:', err);
            setError('Не удалось обновить услугу.');
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
            try {
                await api.deleteService(serviceId);
                fetchServices(categoryId);
            } catch (err) {
                console.error('Ошибка при удалении услуги:', err);
                setError('Не удалось удалить услугу.');
            }
        }
    };

    if (!categoryId) {
        return (
            <div className={styles.infoMessage}>
                <i className="fas fa-folder-open"></i>
                <p>Выберите категорию для просмотра услуг</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Загрузка услуг...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Управление услугами</h2>
                <p>Категория ID: {categoryId}</p>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Добавить новую услугу</h3>
                <form onSubmit={handleAddService} className={styles.addForm}>
                    <div className={styles.formGroup}>
                        <label>Название услуги</label>
                        <input
                            type="text"
                            value={newService.serviceName}
                            onChange={(e) => setNewService({...newService, serviceName: e.target.value})}
                            placeholder="Введите название"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Описание</label>
                        <textarea
                            value={newService.description}
                            onChange={(e) => setNewService({...newService, description: e.target.value})}
                            placeholder="Введите описание"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Цена (₽)</label>
                        <input
                            type="number"
                            value={newService.price}
                            onChange={(e) => setNewService({...newService, price: e.target.value})}
                            placeholder="Введите цену"
                            step="0.01"
                            required
                        />
                    </div>
                    <button type="submit" className={styles.addButton}>
                        <i className="fas fa-plus"></i> Добавить услугу
                    </button>
                </form>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Список услуг</h3>
                    <span className={styles.badge}>{services.length} услуг</span>
                </div>

                {services.length === 0 ? (
                    <div className={styles.emptyState}>
                        <i className="fas fa-folder-open"></i>
                        <p>Услуги не найдены</p>
                    </div>
                ) : (
                    <div className={styles.servicesGrid}>
                        {services.map((service) => (
                            <div key={service.id} className={styles.serviceCard}>
                                {editingService?.id === service.id ? (
                                    <form onSubmit={handleUpdateService} className={styles.editForm}>
                                        <div className={styles.formGroup}>
                                            <label>Название</label>
                                            <input
                                                type="text"
                                                value={editServiceData.serviceName}
                                                onChange={(e) => setEditServiceData({...editServiceData, serviceName: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Описание</label>
                                            <textarea
                                                value={editServiceData.description}
                                                onChange={(e) => setEditServiceData({...editServiceData, description: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Цена (₽)</label>
                                            <input
                                                type="number"
                                                value={editServiceData.price}
                                                onChange={(e) => setEditServiceData({...editServiceData, price: e.target.value})}
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        <div className={styles.editActions}>
                                            <button type="submit" className={styles.saveButton}>
                                                <i className="fas fa-check"></i> Сохранить
                                            </button>
                                            <button 
                                                type="button" 
                                                className={styles.cancelButton}
                                                onClick={() => setEditingService(null)}
                                            >
                                                <i className="fas fa-times"></i> Отмена
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className={styles.serviceContent}>
                                            <div className={styles.serviceIcon}>
                                                <i className="fas fa-tools"></i>
                                            </div>
                                            <div>
                                                <h4 className={styles.serviceName}>{service.serviceName}</h4>
                                                <p className={styles.serviceDescription}>{service.description}</p>
                                                <div className={styles.servicePrice}>{service.price} ₽</div>
                                            </div>
                                        </div>
                                        <div className={styles.serviceActions}>
                                            <button
                                                className={styles.editButton}
                                                onClick={() => handleEditService(service)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteService(service.id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Services;