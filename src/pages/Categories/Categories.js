// src/pages/Categories/Categories.js
import React, { useState, useEffect } from 'react';
import * as api from '../../api/apiService';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import './Categories.module.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate(); // Инициализируем хук навигации

    useEffect(() => {
        console.log('Categories компонент смонтирован. Запускаю fetchCategories...');
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Начинаю запрос к API для получения категорий...');
            const response = await api.getCategories();
            console.log('Ответ API для категорий:', response.data); 
            setCategories(response.data);
        } catch (err) {
            console.error('Ошибка при получении категорий (полный объект ошибки):', err);
            console.error('Сообщение об ошибке:', err.message);
            if (err.response) {
                console.error('Статус ответа API:', err.response.status);
                console.error('Данные ответа API:', err.response.data);
            }
            setError('Не удалось загрузить категории. Проверьте консоль для деталей.');
        } finally {
            setLoading(false);
            console.log('Завершение fetchCategories.');
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setError('');
        if (!newCategoryName.trim()) {
            setError('Название категории не может быть пустым.');
            return;
        }
        try {
            console.log('Попытка добавить категорию:', newCategoryName);
            await api.createCategory(newCategoryName); 
            setNewCategoryName('');
            fetchCategories();
            console.log('Категория успешно добавлена.');
        } catch (err) {
            console.error('Ошибка при добавлении категории (полный объект ошибки):', err);
            setError('Не удалось добавить категорию. Проверьте консоль для деталей.');
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setEditCategoryName(category.category_name || ''); 
        console.log('Редактирование категории:', category);
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        setError('');
        if (!editCategoryName.trim()) {
            setError('Название категории не может быть пустым.');
            return;
        }
        if (!editingCategory) return;

        try {
            console.log('Попытка обновить категорию:', editingCategory.id_category, editCategoryName);
            await api.updateCategory(editingCategory.id_category, editCategoryName);
            setEditingCategory(null);
            setEditCategoryName('');
            fetchCategories();
            console.log('Категория успешно обновлена.');
        } catch (err) {
            console.error('Ошибка при обновлении категории (полный объект ошибки):', err);
            setError('Не удалось обновить категорию. Проверьте консоль для деталей.');
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        setError('');
        if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
            try {
                console.log('Попытка удалить категорию:', categoryId);
                await api.deleteCategory(categoryId);
                fetchCategories();
                console.log('Категория успешно удалена.');
            } catch (err) {
                console.error('Ошибка при удалении категории (полный объект ошибки):', err);
                setError('Не удалось удалить категорию. Проверьте консоль для деталей.');
            }
        }
    };

    // НОВАЯ ФУНКЦИЯ: Обработчик клика по категории для перехода на страницу услуг
    const handleCategoryClick = (categoryId) => {
        // Переходим на страницу услуг, передавая id_category как параметр запроса
        navigate(`/admin/services?id_category=${categoryId}`);
    };

    if (loading) {
        return <div className="loading">Загрузка категорий...</div>;
    }

    return (
        <div className="categories-container">
            <h2>Управление категориями</h2>

            {error && <p className="error-message">{error}</p>}

            <div className="add-category-section">
                <h3>Добавить новую категорию</h3>
                <form onSubmit={handleAddCategory} className="add-category-form">
                    <input
                        type="text"
                        placeholder="Название категории"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        required
                    />
                    <button type="submit">Добавить категорию</button>
                </form>
            </div>

            <div className="categories-list">
                <h3>Существующие категории</h3>
                {categories.length === 0 ? (
                    <p>Категории не найдены.</p>
                ) : (
                    <ul>
                        {categories.map((category) => (
                            <li 
                                key={category.id_category} 
                                className="category-item"
                                // ДОБАВЛЕНО: Обработчик клика для всей карточки категории
                                onClick={() => handleCategoryClick(category.id_category)}
                            >
                                {editingCategory && editingCategory.id_category === category.id_category ? (
                                    <form onSubmit={handleUpdateCategory} className="edit-category-form">
                                        <input
                                            type="text"
                                            value={editCategoryName}
                                            onChange={(e) => setEditCategoryName(e.target.value)}
                                            required
                                        />
                                        <button type="submit">Сохранить</button>
                                        <button type="button" onClick={() => setEditingCategory(null)}>
                                            Отмена
                                        </button>
                                    </form>
                                ) : (
                                    <>
                                        <span>{category.category_name}</span> 
                                        <div className="category-actions">
                                            <button
                                                className="edit-button"
                                                // ДОБАВЛЕНО: Предотвращаем всплытие события, чтобы не срабатывал клик по li
                                                onClick={(e) => { e.stopPropagation(); handleEditCategory(category); }}
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                className="delete-button"
                                                // ДОБАВЛЕНО: Предотвращаем всплытие события
                                                onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id_category); }}
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

export default Categories;
