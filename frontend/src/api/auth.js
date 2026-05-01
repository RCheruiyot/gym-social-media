const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const postJson = async (path, body) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
};

export const signupUser = async ({ username, email, password, role }) =>
  postJson('/api/auth/signup', { username, email, password, role });

export const loginUser = async ({ email, password }) =>
  postJson('/api/auth/login', { email, password });
