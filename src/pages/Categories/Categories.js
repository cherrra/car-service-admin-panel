// src/pages/Categories/Categories.js
import React, { useState, useEffect } from 'react';
import * as api from '../../api/apiService';
import { useNavigate } from 'react-router-dom';
import styles from './Categories.module.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.getCategories();
            setCategories(response.data);
        } catch (err) {
            console.error('Ошибка при получении категорий:', err);
            setError('Не удалось загрузить категории. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setError('');
        if (!newCategoryName.trim()) {
            setError('Название категории не может быть пустым');
            return;
        }
        try {
            await api.createCategory(newCategoryName);
            setNewCategoryName('');
            fetchCategories();
        } catch (err) {
            console.error('Ошибка при добавлении категории:', err);
            setError('Не удалось добавить категорию. Пожалуйста, попробуйте позже.');
        }
    };

    const handleEditCategory = (category, e) => {
        e.stopPropagation();
        setEditingCategory(category);
        setEditCategoryName(category.category_name || '');
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        setError('');
        if (!editCategoryName.trim()) {
            setError('Название категории не может быть пустым');
            return;
        }
        if (!editingCategory) return;

        try {
            await api.updateCategory(editingCategory.id_category, editCategoryName);
            setEditingCategory(null);
            setEditCategoryName('');
            fetchCategories();
        } catch (err) {
            console.error('Ошибка при обновлении категории:', err);
            setError('Не удалось обновить категорию. Пожалуйста, попробуйте позже.');
        }
    };

    const handleDeleteCategory = async (categoryId, e) => {
        e.stopPropagation();
        if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
            try {
                await api.deleteCategory(categoryId);
                fetchCategories();
            } catch (err) {
                console.error('Ошибка при удалении категории:', err);
                setError('Не удалось удалить категорию. Пожалуйста, попробуйте позже.');
            }
        }
    };

    const handleCategoryClick = (categoryId) => {
        navigate(`/admin/services?id_category=${categoryId}`);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Загрузка категорий...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Управление категориями</h2>
                <p>Создавайте и управляйте категориями ваших услуг</p>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>Добавить новую категорию</h3>
                <form onSubmit={handleAddCategory} className={styles.addForm}>
                    <input
                        type="text"
                        placeholder="Введите название категории"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <button type="submit" className={styles.addButton}>
                        <i className="fas fa-plus"></i> Добавить
                    </button>
                </form>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Список категорий</h3>
                    <span className={styles.badge}>{categories.length} категорий</span>
                </div>

                {categories.length === 0 ? (
                    <div className={styles.emptyState}>
                        <i className="fas fa-folder-open"></i>
                        <p>Категории не найдены</p>
                    </div>
                ) : (
                    <div className={styles.categoriesGrid}>
                        {categories.map((category) => (
                            <div 
                                key={category.id_category} 
                                className={styles.categoryCard}
                                onClick={() => handleCategoryClick(category.id_category)}
                            >
                                {editingCategory && editingCategory.id_category === category.id_category ? (
                                    <form onSubmit={handleUpdateCategory} className={styles.editForm}>
                                        <input
                                            type="text"
                                            value={editCategoryName}
                                            onChange={(e) => setEditCategoryName(e.target.value)}
                                            className={styles.input}
                                            autoFocus
                                            required
                                        />
                                        <div className={styles.editActions}>
                                            <button type="submit" className={styles.saveButton}>
                                                <i className="fas fa-check"></i>
                                            </button>
                                            <button 
                                                type="button" 
                                                className={styles.cancelButton}
                                                onClick={() => setEditingCategory(null)}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className={styles.categoryContent}>
                                            <div className={styles.categoryIcon}>
                                                <i className="fas fa-folder"></i>
                                            </div>
                                            <h4 className={styles.categoryName}>{category.category_name}</h4>
                                        </div>
                                        <div className={styles.categoryActions}>
                                            <button
                                                className={styles.editButton}
                                                onClick={(e) => handleEditCategory(category, e)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={(e) => handleDeleteCategory(category.id_category, e)}
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

export default Categories;