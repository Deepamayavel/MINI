const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const handleResponse = async (response) => {
  const contentType = response.headers.get('Content-Type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json() : null;

  if (response.ok) {
    return body;
  }

  const message = body?.message || body?.error || response.statusText || 'Request failed';
  throw new Error(message);
};

const buildHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const getDashboardSummary = async (token) => {
  const response = await fetch(`${BASE_URL}/api/dashboard/summary`, {
    headers: buildHeaders(token),
  });
  return handleResponse(response);
};

export const login = async ({ email, password }) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const register = async ({ name, email, password }) => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(response);
};

export const adminLogin = async ({ email, password, rememberMe }) => {
  const response = await fetch(`${BASE_URL}/api/auth/admin-login`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ email, password, rememberMe }),
  });
  return handleResponse(response);
};

export const logout = async (token) => {
  const response = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: buildHeaders(token),
  });
  return handleResponse(response);
};

export const search = async (token, symptomText, inputType = 'TEXT') => {
  const response = await fetch(`${BASE_URL}/api/search`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify({ symptomText, inputType }),
  });
  return handleResponse(response);
};

export const getHistory = async (token, page = 0, size = 10) => {
  const response = await fetch(`${BASE_URL}/api/history?page=${page}&size=${size}`, {
    headers: buildHeaders(token),
  });
  return handleResponse(response);
};

export const deleteHistory = async (token, queryId) => {
  const response = await fetch(`${BASE_URL}/api/history/${queryId}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });
  return handleResponse(response);
};

export const getHistoryDetail = async (token, queryId) => {
  const response = await fetch(`${BASE_URL}/api/history/${queryId}`, {
    headers: buildHeaders(token),
  });
  return handleResponse(response);
};

export const getRecommendations = async (token, page = 0, size = 10) => {
  const response = await fetch(`${BASE_URL}/api/recommendations?page=${page}&size=${size}`, {
    headers: buildHeaders(token),
  });
  return handleResponse(response);
};

export const getLatestRecommendation = async (token) => {
  const response = await fetch(`${BASE_URL}/api/recommendations/latest`, {
    headers: buildHeaders(token),
  });
  return handleResponse(response);
};

export const getRecommendationById = async (token, id) => {
  const response = await fetch(`${BASE_URL}/api/recommendations/${id}`, {
    headers: buildHeaders(token),
  });
  return handleResponse(response);
};

export const listAdminResources = async (token, resource, page = 0, size = 50) => {
  const response = await fetch(`${BASE_URL}/api/admin/${resource}?page=${page}&size=${size}`, {
    headers: buildHeaders(token),
  });
  return handleResponse(response);
};

export const createAdminResource = async (token, resource, body) => {
  const response = await fetch(`${BASE_URL}/api/admin/${resource}`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};

export const updateAdminResource = async (token, resource, id, body) => {
  const response = await fetch(`${BASE_URL}/api/admin/${resource}/${id}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};

export const deleteAdminResource = async (token, resource, id) => {
  const response = await fetch(`${BASE_URL}/api/admin/${resource}/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });
  return handleResponse(response);
};

export const getAdminAnalytics = async (token) => {
  const response = await fetch(`${BASE_URL}/api/admin/analytics`, {
    headers: buildHeaders(token),
  });
  return handleResponse(response);
};
