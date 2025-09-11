import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { submitSolution, getSolvedProblems, getProblemSolutions } from '../services/problemService';
import './Problems.css';

const Problems = ({ user }) => {
  const [allProblems, setAllProblems] = useState([]);
  const [communityProblems, setCommunityProblems] = useState([]);
  const [myProblems, setMyProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [activeTab, setActiveTab] = useState('community');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, category
  const [newProblem, setNewProblem] = useState({
    title: '',
    description: '',
    category: ''
  });
  
  // State for solving problems
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showSolveModal, setShowSolveModal] = useState(false);
  const [showSolutionDetailsModal, setShowSolutionDetailsModal] = useState(false);
  const [showProblemSolutionsModal, setShowProblemSolutionsModal] = useState(false);
  const [problemSolutions, setProblemSolutions] = useState([]);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [solution, setSolution] = useState('');
  const [isSolving, setIsSolving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const fetchCommunityProblems = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/problems/community', { headers });
        setCommunityProblems(response.data);
      } catch (error) {
        console.error('Error fetching community problems:', error);
      }
    };
    const fetchMyProblems = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/problems', { headers });
        setMyProblems(response.data);
      } catch (error) {
        console.error('Error fetching my problems:', error);
      }
    };
    const fetchSolvedProblems = async () => {
      try {
        const solvedData = await getSolvedProblems();
        setSolvedProblems(solvedData);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCommunityProblems(),
        fetchMyProblems(),
        fetchSolvedProblems()
      ]);
      setLoading(false);
    };
    loadData();
  }, [user]);

  useEffect(() => {
    if (!user || !user.id) return;
    // Community: problems not created by current user
    setCommunityProblems(
      allProblems.filter(p => p.created_by !== user.id)
    );
    // My Problems: problems created by current user
    setMyProblems(
      allProblems.filter(p => p.created_by === user.id)
    );
  }, [allProblems, user]);

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/problems', newProblem, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewProblem({ title: '', description: '', category: '' });
      setShowCreateForm(false);
      window.location.reload(); // Refresh to show new problem
    } catch (error) {
      console.error('Error creating problem:', error);
    }
  };

  const getDifficultyFromCategory = (category) => {
    // Map categories to difficulty levels (you can adjust this logic)
    const categoryDifficulty = {
      'Arrays': 'Medium',
      'Strings': 'Easy', 
      'Trees': 'Hard',
      'Mathematics': 'Medium',
      'Dynamic Programming': 'Hard',
      'Graphs': 'Hard',
      'Algorithms': 'Medium'
    };
    return categoryDifficulty[category] || 'Easy';
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return '#48bb78';
      case 'medium': return '#ed8936';
      case 'hard': return '#e53e3e';
      default: return '#667eea';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getAuthorName = (problem) => {
    // For community problems, try to get author info
    // This might need adjustment based on your backend response structure
    return problem.author || problem.user_name || problem.created_by || 'Anonymous';
  };

  // Function to handle solving a problem
  const handleSolveProblem = async (problemId, solutionText) => {
    if (!solutionText.trim()) {
      alert('Please provide a solution before submitting.');
      return;
    }
    
    setIsSolving(true);
    try {
      await submitSolution(problemId, solutionText);
      
      setShowSolveModal(false);
      setSelectedProblem(null);
      setSolution('');
      alert('Congratulations! Problem solved successfully! 🎉');
      window.location.reload(); // Refresh to update problem status
    } catch (error) {
      console.error('Error solving problem:', error);
      if (error.message === 'You have already submitted a solution for this problem') {
        alert('You have already submitted a solution for this problem!');
      } else {
        alert('Failed to submit solution. Please try again.');
      }
    } finally {
      setIsSolving(false);
    }
  };

  // Function to fetch solutions for a problem (for problem creators)
  const fetchProblemSolutions = async (problemId) => {
    try {
      const solutions = await getProblemSolutions(problemId);
      setProblemSolutions(solutions);
      setShowProblemSolutionsModal(true);
    } catch (error) {
      console.error('Error fetching problem solutions:', error);
      alert('Failed to fetch solutions');
    }
  };

  // Function to open solve modal
  const openSolveModal = (problem) => {
    setSelectedProblem(problem);
    setShowSolveModal(true);
  };

  // Function to view solution details
  const viewSolutionDetails = (solution) => {
    setSelectedSolution(solution);
    setShowSolutionDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="problems-loading">
        <div className="loading-spinner"></div>
        <p>Loading problems...</p>
      </div>
    );
  }

  return (
    <div className="problems-container">
      <div className="problems-header">
        <div className="problems-title-section">
          <h1>Problems</h1>
          <p className="problems-subtitle">Challenge yourself with coding and math problems</p>
        </div>
        <button 
          className="create-problem-btn"
          onClick={() => setShowCreateForm(true)}
        >
          <span className="create-icon">+</span>
          Create Problem
        </button>
      </div>

      <div className="problems-tabs">
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'community' ? 'active' : ''}`}
            onClick={() => setActiveTab('community')}
          >
            Community Problems
          </button>
          <button 
            className={`tab-button ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Problems
          </button>
          <button 
            className={`tab-button ${activeTab === 'solved' ? 'active' : ''}`}
            onClick={() => setActiveTab('solved')}
          >
            Solved Problems
          </button>
        </div>
        
        <div className="tab-controls">
          <div className="tab-description">
            {activeTab === 'community' ? (
              <p>Solve problems created by the community</p>
            ) : activeTab === 'my' ? (
              <p>Problems you've created and their solutions</p>
            ) : (
              <p>Problems you've successfully solved</p>
            )}
          </div>
          
          <div className="sort-controls">
            <label htmlFor="sort-select">Sort by:</label>
            <select 
              id="sort-select"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="category">Category</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </div>

      <div className="problems-content">
        {activeTab === 'community' ? (
          <div className="community-problems">
            {communityProblems
              .sort((a, b) => {
                if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
                if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
                if (sortBy === 'title') return a.title.localeCompare(b.title);
                if (sortBy === 'category') return a.category.localeCompare(b.category);
                return 0;
              })
              .map(problem => {
                const difficulty = getDifficultyFromCategory(problem.category);
                return (
                  <div key={problem.id} className="community-problem-card">
                    <div className="problem-header">
                      <h3 className="problem-title">{problem.title}</h3>
                      <div 
                        className="difficulty-badge"
                        style={{ backgroundColor: getDifficultyColor(difficulty) }}
                      >
                        {difficulty}
                      </div>
                    </div>
                    <p className="problem-description">{problem.description}</p>
                    <div className="problem-meta">
                      <div className="problem-info">
                        <span className="problem-author">
                          <span className="author-icon">👤</span>
                          {getAuthorName(problem)}
                        </span>
                        <span className="problem-category">
                          <span className="category-icon">📚</span>
                          {problem.category}
                        </span>
                        <span className="problem-date">
                          <span className="date-icon">📅</span>
                          {formatDate(problem.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="problem-actions">
                      <button 
                        className="action-btn solve-btn"
                        onClick={() => openSolveModal(problem)}
                      >
                        <span className="btn-icon">🚀</span>
                        Solve Problem
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : activeTab === 'my' ? (
          <div className="my-problems">
            {myProblems
              .sort((a, b) => {
                if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
                if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
                if (sortBy === 'title') return a.title.localeCompare(b.title);
                if (sortBy === 'category') return a.category.localeCompare(b.category);
                return 0;
              })
              .map(problem => {
                const responsesCount = problem.solutions ? problem.solutions.filter(s => s.solved_by !== user.id).length : 0;
                const rating = problem.rating || 0;
                return (
                  <div key={problem.id} className="my-problem-card">
                    <div className="problem-header">
                      <h3 className="problem-title">{problem.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                        <span className="responses-badge">{responsesCount} responses</span>
                        <span className="rating-badge">⭐ {rating}</span>
                        <button
                          className="action-btn delete-btn"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
                              try {
                                const token = localStorage.getItem('token');
                                await axios.delete(`http://localhost:8080/api/problems/${problem.id}`, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                setMyProblems(prev => prev.filter(p => p.id !== problem.id));
                              } catch (error) {
                                alert('Failed to delete problem.');
                              }
                            }
                          }}
                        >
                          <span className="btn-icon">🗑️</span> Delete
                        </button>
                      </div>
                    </div>
                    <p className="problem-description">{problem.description}</p>
                    <div className="problem-meta">
                      <span className="problem-category">
                        <span className="category-icon">📚</span>
                        {problem.category}
                      </span>
                      <span className="problem-date">
                        📅 {formatDate(problem.created_at)}
                      </span>
                      <span className="problem-difficulty">
                        <span className="difficulty-icon">🎯</span>
                        {getDifficultyFromCategory(problem.category)}
                      </span>
                    </div>
                    <div className="problem-actions">
                      <button
                        className="action-btn view-responses-btn"
                        onClick={() => fetchProblemSolutions(problem.id)}
                      >
                        <span className="btn-icon">💬</span> View Responses ({responsesCount})
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => {/* TODO: open edit modal/form for this problem */}}
                      >
                        <span className="btn-icon">✏️</span> Edit Problem
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="solved-problems">
            {solvedProblems
              .sort((a, b) => {
                if (sortBy === 'newest') return new Date(b.solved_at) - new Date(a.solved_at);
                if (sortBy === 'oldest') return new Date(a.solved_at) - new Date(b.solved_at);
                if (sortBy === 'title') return a.title.localeCompare(b.title);
                if (sortBy === 'category') return a.category.localeCompare(b.category);
                return 0;
              })
              .map(solved => (
                <div key={solved.solution_id || solved.id} className="solved-problem-card">
                  <div className="problem-header">
                    <h3 className="problem-title">{solved.title}</h3>
                    <div className="solved-badge">
                      <span role="img" aria-label="Solved">✔️</span> Solved
                    </div>
                  </div>
                  <p className="problem-description">{solved.description}</p>
                  <div className="problem-meta">
                    <span className="problem-category">
                      <span className="category-icon">�</span>
                      {solved.category}
                    </span>
                    <span className="problem-date">
                      <span className="date-icon">�</span>
                      {formatDate(solved.created_at)}
                    </span>
                    <span className="problem-difficulty">
                      <span className="difficulty-icon">🎯</span>
                      {getDifficultyFromCategory(solved.category)}
                    </span>
                    <span className="solved-date">
                      <span className="date-icon">✔️</span>
                      Solved: {formatDate(solved.solved_at)}
                    </span>
                  </div>
                  {/* Optionally show solution text or details here if needed */}
                </div>
              ))}
          </div>
        )}
      </div>

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Problem</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateProblem}>
              <div className="form-group">
                <label>Problem Title</label>
                <input
                  type="text"
                  value={newProblem.title}
                  onChange={(e) => setNewProblem({...newProblem, title: e.target.value})}
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newProblem.category}
                  onChange={(e) => setNewProblem({...newProblem, category: e.target.value})}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Arrays">Arrays</option>
                  <option value="Strings">Strings</option>
                  <option value="Trees">Trees</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Dynamic Programming">Dynamic Programming</option>
                  <option value="Graphs">Graphs</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Problem Description</label>
                <textarea
                  value={newProblem.description}
                  onChange={(e) => setNewProblem({...newProblem, description: e.target.value})}
                  rows="4"
                  placeholder="Describe the problem in detail..."
                  required
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Solve Problem Modal */}
      {showSolveModal && selectedProblem && (
        <div className="modal-overlay" onClick={() => setShowSolveModal(false)}>
          <div className="modal-content solve-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Solve Problem: {selectedProblem.title}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowSolveModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="problem-details">
              <div className="problem-description">
                <h4>Problem Description:</h4>
                <p>{selectedProblem.description}</p>
              </div>
              
              <div className="problem-category">
                <strong>Category:</strong> {selectedProblem.category}
              </div>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSolveProblem(selectedProblem.id, solution);
            }}>
              <div className="form-group">
                <label>Your Solution: *</label>
                <textarea
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  rows="8"
                  placeholder="Write your solution here... (code, explanation, or approach)"
                  className="solution-textarea"
                  required
                />
                <div className="form-hint">
                  Please provide your solution approach, code, or detailed explanation.
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowSolveModal(false)}
                  disabled={isSolving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn solve-submit-btn"
                  disabled={isSolving || !solution.trim()}
                >
                  {isSolving ? 'Submitting Solution...' : '🎯 Submit Solution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Solution Details Modal */}
      {showSolutionDetailsModal && selectedSolution && (
        <div className="modal-overlay" onClick={() => setShowSolutionDetailsModal(false)}>
          <div className="modal-content solution-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Your Solution: {selectedSolution.title}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowSolutionDetailsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="solution-details">
              <div className="solution-meta">
                <div className="solution-info">
                  <span className="solved-date">
                    <span className="date-icon">🎯</span>
                    Solved on: {formatDate(selectedSolution.solved_at)}
                  </span>
                  <span className="problem-category">
                    <span className="category-icon">📚</span>
                    Category: {selectedSolution.category}
                  </span>
                  <span className="problem-creator">
                    <span className="author-icon">👤</span>
                    Created by: {selectedSolution.problem_creator_username}
                  </span>
                </div>
              </div>
              
              <div className="problem-description-section">
                <h4>Problem Description:</h4>
                <p>{selectedSolution.description}</p>
              </div>
              
              <div className="solution-section">
                <h4>Your Solution:</h4>
                <div className="solution-text">
                  <pre>{selectedSolution.solution_text}</pre>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="close-details-btn"
                onClick={() => setShowSolutionDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Problem Solutions Modal (for problem creators) */}
      {showProblemSolutionsModal && (
        <div className="modal-overlay" onClick={() => setShowProblemSolutionsModal(false)}>
          <div className="modal-content problem-solutions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Solutions Submitted</h2>
              <button 
                className="close-btn"
                onClick={() => setShowProblemSolutionsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="solutions-content">
              {problemSolutions.length > 0 ? (
                <div className="solutions-list">
                  {problemSolutions.map(solution => (
                    <div key={solution.solution_id} className="solution-item">
                      <div className="solution-header">
                        <div className="user-info">
                          <div className="user-avatar">
                            {solution.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-details">
                            <strong>{solution.user_name}</strong>
                            <div className="solution-date">
                              Solved: {formatDate(solution.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="solution-content">
                        <h5>Solution:</h5>
                        <div className="solution-text">
                          <pre>{solution.solution_text}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-solutions">
                  <div className="empty-icon">💡</div>
                  <h3>No solutions yet</h3>
                  <p>No one has solved this problem yet. Be patient!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {((activeTab === 'community' && communityProblems.length === 0) || 
        (activeTab === 'my' && myProblems.length === 0) ||
        (activeTab === 'solved' && solvedProblems.length === 0)) && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No problems yet</h3>
          <p>
            {activeTab === 'community' 
              ? "No community problems available at the moment."
              : activeTab === 'my'
              ? "Create your first problem to get started!"
              : "You haven't solved any problems yet. Start solving!"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Problems;
