import axios from 'axios';

const API_BASE_URL = 'http://localhost:7000/api';

// Get auth headers with token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Get current user's streak information
export const getUserStreak = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/streaks`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
