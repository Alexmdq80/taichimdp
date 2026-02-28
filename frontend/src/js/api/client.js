const API_BASE_URL = 'http://localhost:3000/api'; // Or your backend API base URL

export const makeRequest = async (endpoint, method = 'GET', data = null, authenticate = false) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (authenticate) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            // If authentication is required but no token is found, throw an error or redirect to login
            throw new Error('No authentication token found. Please log in.');
        }
    }

    const config = {
        method,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // If the token is invalid or expired, and it's not the login/register endpoint,
    // we should probably redirect to the login page.
    if (response.status === 401 || response.status === 403) {
        if (!endpoint.startsWith('/auth')) { // Avoid redirect loops on auth endpoints
            localStorage.removeItem('token');
            window.location.href = '/login'; // Redirect to login page
        }
    }

    const responseData = await response.json();

    if (!response.ok) {
        // If the backend returns an error, it should be in the responseData
        const error = new Error(responseData.message || 'Something went wrong');
        error.details = responseData.details || null;
        error.status = response.status;
        throw error;
    }

    return responseData;
};

// Specific API functions for convenience
export const authApi = {
    register: (email, password) => makeRequest('/auth/register', 'POST', { email, password }),
    login: (email, password) => makeRequest('/auth/login', 'POST', { email, password }),
};

export const practicanteApi = {
    getAll: (search = '', page = 1, limit = 50) => makeRequest(`/practicantes?search=${search}&page=${page}&limit=${limit}`, 'GET', null, true),
    getById: (id) => makeRequest(`/practicantes/${id}`, 'GET', null, true),
    create: (data) => makeRequest('/practicantes', 'POST', data, true),
    update: (id, data) => makeRequest(`/practicantes/${id}`, 'PUT', data, true),
    delete: (id) => makeRequest(`/practicantes/${id}`, 'DELETE', null, true),
    };

    // Generic API client for other resources
    export const apiClient = {
    get: (endpoint, params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
        return makeRequest(url, 'GET', null, true);
    },
    post: (endpoint, data) => makeRequest(endpoint, 'POST', data, true),
    put: (endpoint, data) => makeRequest(endpoint, 'PUT', data, true),
    delete: (endpoint) => makeRequest(endpoint, 'DELETE', null, true)
    };