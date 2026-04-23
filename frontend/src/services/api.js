const API_BASE = 'http://localhost:5000/api';

export async function searchResources({ q, author, subject, year_from, year_to, type, page = 1, size = 10 }) {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (author) params.append('author', author);
    if (subject) params.append('subject', subject);
    if (year_from) params.append('year_from', year_from);
    if (year_to) params.append('year_to', year_to);
    if (type) params.append('type', type);
    params.append('page', page);
    params.append('size', size);

    const res = await fetch(`${API_BASE}/search?${params}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
}

export async function getSuggestions(q) {
    const res = await fetch(`${API_BASE}/search/suggestions?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Suggestions failed');
    return res.json();
}

export async function getFilters() {
    const res = await fetch(`${API_BASE}/search/filters`);
    if (!res.ok) throw new Error('Filters failed');
    return res.json();
}

export async function getResource(id) {
    const res = await fetch(`${API_BASE}/resources/${id}`);
    if (!res.ok) throw new Error('Resource not found');
    return res.json();
}

export async function listResources(page = 1, size = 20) {
    const res = await fetch(`${API_BASE}/resources?page=${page}&size=${size}`);
    if (!res.ok) throw new Error('Failed to list resources');
    return res.json();
}

export async function createResource(data, token) {
    const res = await fetch(`${API_BASE}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create resource');
    }
    return res.json();
}

export async function updateResource(id, data, token) {
    const res = await fetch(`${API_BASE}/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update resource');
    }
    return res.json();
}

export async function deleteResource(id, token) {
    const res = await fetch(`${API_BASE}/resources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete resource');
    }
    return res.json();
}

export async function login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
    }
    return res.json();
}

export async function verifyToken(token) {
    const res = await fetch(`${API_BASE}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid;
}
