import { useState, useEffect } from 'react';
import { login, verifyToken, listResources, createResource, updateResource, deleteResource } from '../services/api';

function AdminPage() {
    const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [resources, setResources] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [formData, setFormData] = useState({
        title: '', authors: '', subject: '', publisher: '',
        publication_year: '', resource_type: 'book', isbn: '', url: '', description: '',
    });
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');

    useEffect(() => {
        if (token) {
            verifyToken(token).then((valid) => {
                if (valid) {
                    setIsAuthenticated(true);
                    loadResources(1);
                } else {
                    localStorage.removeItem('adminToken');
                    setToken('');
                }
            });
        }
    }, []);

    const loadResources = async (p = 1) => {
        setLoading(true);
        try {
            const data = await listResources(p, 15);
            setResources(data.results);
            setTotal(data.total);
            setPage(p);
        } catch (err) {
            setActionError('Failed to load resources.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            const data = await login(loginForm.username, loginForm.password);
            setToken(data.token);
            localStorage.setItem('adminToken', data.token);
            setIsAuthenticated(true);
            loadResources(1);
        } catch (err) {
            setLoginError(err.message);
        }
    };

    const handleLogout = () => {
        setToken('');
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
    };

    const openCreateModal = () => {
        setEditingResource(null);
        setFormData({ title: '', authors: '', subject: '', publisher: '', publication_year: '', resource_type: 'book', isbn: '', url: '', description: '' });
        setShowModal(true);
        setActionError('');
    };

    const openEditModal = (resource) => {
        setEditingResource(resource);
        setFormData({
            title: resource.title || '',
            authors: Array.isArray(resource.authors) ? resource.authors.join(', ') : resource.authors || '',
            subject: resource.subject || '',
            publisher: resource.publisher || '',
            publication_year: resource.publication_year || '',
            resource_type: resource.resource_type || 'book',
            isbn: resource.isbn || '',
            url: resource.url || '',
            description: resource.description || '',
        });
        setShowModal(true);
        setActionError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionError('');
        setActionSuccess('');
        const payload = {
            ...formData,
            authors: formData.authors.split(',').map(a => a.trim()).filter(Boolean),
            publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
        };
        try {
            if (editingResource) {
                await updateResource(editingResource.id, payload, token);
                setActionSuccess('Resource updated successfully!');
            } else {
                await createResource(payload, token);
                setActionSuccess('Resource created successfully!');
            }
            setShowModal(false);
            loadResources(page);
            setTimeout(() => setActionSuccess(''), 3000);
        } catch (err) {
            setActionError(err.message);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"?`)) return;
        setActionError('');
        try {
            await deleteResource(id, token);
            setActionSuccess('Resource deleted successfully!');
            loadResources(page);
            setTimeout(() => setActionSuccess(''), 3000);
        } catch (err) {
            setActionError(err.message);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-page">
                <div className="login-container">
                    <div className="login-card">
                        <div className="login-header">
                            <span className="login-icon">🔐</span>
                            <h2>Admin Login</h2>
                            <p>Sign in to manage library resources</p>
                        </div>
                        <form onSubmit={handleLogin}>
                            {loginError && <div className="error-message">{loginError}</div>}
                            <div className="form-group">
                                <label>Username</label>
                                <input type="text" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} placeholder="Enter username" required />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Enter password" required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full">Sign In</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    const typeBadgeClass = (type) => {
        const map = { book: 'badge-book', journal: 'badge-journal', digital: 'badge-digital' };
        return map[type] || 'badge-book';
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div className="admin-header-left">
                    <h1>📋 Resource Management</h1>
                    <span className="resource-count">{total} total resources</span>
                </div>
                <div className="admin-header-right">
                    <button className="btn btn-primary" onClick={openCreateModal}>+ Add Resource</button>
                    <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {actionSuccess && <div className="success-message">{actionSuccess}</div>}
            {actionError && <div className="error-message">{actionError}</div>}

            {loading ? (
                <div className="loading-container"><div className="spinner"></div><p>Loading resources...</p></div>
            ) : (
                <>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Authors</th>
                                    <th>Subject</th>
                                    <th>Type</th>
                                    <th>Year</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resources.map(r => (
                                    <tr key={r.id}>
                                        <td className="td-title">{r.title}</td>
                                        <td className="td-authors">{Array.isArray(r.authors) ? r.authors.join(', ') : r.authors}</td>
                                        <td>{r.subject}</td>
                                        <td><span className={`type-badge ${typeBadgeClass(r.resource_type)}`}>{r.resource_type}</span></td>
                                        <td>{r.publication_year}</td>
                                        <td className="td-actions">
                                            <button className="btn btn-sm btn-edit" onClick={() => openEditModal(r)}>Edit</button>
                                            <button className="btn btn-sm btn-delete" onClick={() => handleDelete(r.id, r.title)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {total > 15 && (
                        <div className="admin-pagination">
                            <button className="btn btn-sm" disabled={page <= 1} onClick={() => loadResources(page - 1)}>← Prev</button>
                            <span>Page {page} of {Math.ceil(total / 15)}</span>
                            <button className="btn btn-sm" disabled={page >= Math.ceil(total / 15)} onClick={() => loadResources(page + 1)}>Next →</button>
                        </div>
                    )}
                </>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingResource ? 'Edit Resource' : 'Add New Resource'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {actionError && <div className="error-message">{actionError}</div>}
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Title *</label>
                                    <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                                </div>
                                <div className="form-group full-width">
                                    <label>Authors (comma-separated)</label>
                                    <input type="text" value={formData.authors} onChange={e => setFormData({ ...formData, authors: e.target.value })} placeholder="Author 1, Author 2" />
                                </div>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <input type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Publisher</label>
                                    <input type="text" value={formData.publisher} onChange={e => setFormData({ ...formData, publisher: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Publication Year</label>
                                    <input type="number" value={formData.publication_year} onChange={e => setFormData({ ...formData, publication_year: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Resource Type</label>
                                    <select value={formData.resource_type} onChange={e => setFormData({ ...formData, resource_type: e.target.value })}>
                                        <option value="book">Book</option>
                                        <option value="journal">Journal</option>
                                        <option value="digital">Digital</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>ISBN</label>
                                    <input type="text" value={formData.isbn} onChange={e => setFormData({ ...formData, isbn: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>URL</label>
                                    <input type="url" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} />
                                </div>
                                <div className="form-group full-width">
                                    <label>Description</label>
                                    <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingResource ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPage;
