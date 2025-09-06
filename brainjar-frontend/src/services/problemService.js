import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Get auth headers with token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Submit a solution to a problem
export const solveProblem = async (problemId, payload) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/problems/${problemId}/solve`,
      payload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error('You have already solved this problem');
    }
    throw error;
  }
};

// Get problems solved by the current user
export const getSolvedProblems = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/users/me/solved`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all solutions for a specific problem (for problem owners)
export const getProblemSolutions = async (problemId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/problems/${problemId}/solutions`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get community problems (including solved status)
export const getCommunityProblems = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/problems/community`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user's own problems
export const getUserProblems = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/problems`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new problem
export const createProblem = async (problemData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/problems`,
      problemData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
