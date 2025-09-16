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

// Get all problems (community + user's own problems)
export const getAllProblems = async () => {
  try {
    const [communityResponse, userResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/problems/community`, { headers: getAuthHeaders() }),
      axios.get(`${API_BASE_URL}/problems`, { headers: getAuthHeaders() })
    ]);
    
    return {
      community: communityResponse.data,
      user: userResponse.data,
      all: [...communityResponse.data, ...userResponse.data]
    };
  } catch (error) {
    throw error;
  }
};

// Get community problems (problems created by other users)
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

// Get problems solved by the current user
export const getSolvedProblems = async () => {
  try {
    console.log('Fetching solved problems...');
    const response = await axios.get(
      `${API_BASE_URL}/problems/solved`,
      { headers: getAuthHeaders() }
    );
    console.log('Solved problems response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching solved problems:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

// Submit a solution to a problem
export const submitSolution = async (problemId, solutionText) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/problems/${problemId}/solution`,
      { solution_text: solutionText },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.includes('already submitted')) {
      throw new Error('You have already submitted a solution for this problem');
    }
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

// Update an existing problem
export const updateProblem = async (problemId, problemData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/problems/${problemId}`,
      problemData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a problem
export const deleteProblem = async (problemId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/problems/${problemId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
