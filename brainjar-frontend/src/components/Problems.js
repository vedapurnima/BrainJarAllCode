import React, { useState, useEffect } from 'react';
import { 
  getCommunityProblems, 
  getUserProblems, 
  getSolvedProblems, 
  submitSolution, 
  getProblemSolutions,
  createProblem,
  updateProblem,
  deleteProblem
} from '../services/problemService';
import './Problems.css';

const Problems = ({ user }) => {
  const [communityProblems, setCommunityProblems] = useState([]);
  const [myProblems, setMyProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [activeTab, setActiveTab] = useState('community');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSolveModal, setShowSolveModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [editingProblem, setEditingProblem] = useState(null);
  
  // Form states
  const [newProblem, setNewProblem] = useState({
    title: '',
    description: '',
    difficulty: 1,
    tags: []
  });
  const [solution, setSolution] = useState('');
  const [isSolving, setIsSolving] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    try {
      // Load community problems (public problems)
      const communityData = await getCommunityProblems();
      setCommunityProblems(Array.isArray(communityData) ? communityData : []);
      
      // Load user's own problems
      const myData = await getUserProblems();
      setMyProblems(Array.isArray(myData) ? myData : []);
      
      // Load solved problems
      try {
        const solvedData = await getSolvedProblems();
        console.log('Raw solved problems data:', solvedData);
        setSolvedProblems(Array.isArray(solvedData) ? solvedData : []);
        console.log('Processed solved problems:', Array.isArray(solvedData) ? solvedData : []);
      } catch (error) {
        console.warn('Solved problems endpoint not available:', error);
        setSolvedProblems([]);
      }
    } catch (error) {
      console.error('Error loading problems data:', error);
      // Set empty arrays on error
      setCommunityProblems([]);
      setMyProblems([]);
      setSolvedProblems([]);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyFromCategory = (category) => {
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

  const getDifficultyLevel = (difficulty) => {
    if (typeof difficulty === 'number') {
      if (difficulty === 1) return 'easy';
      if (difficulty === 2) return 'medium';
      if (difficulty === 3) return 'hard';
      return 'easy';
    }
    return difficulty?.toLowerCase() || 'easy';
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
    return problem.author || problem.user_name || problem.created_by || 'Anonymous';
  };

  const openSolveModal = (problem) => {
    setSelectedProblem(problem);
    setShowSolveModal(true);
  };

  const openEditModal = (problem) => {
    setEditingProblem(problem);
    setNewProblem({
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty || 1,
      tags: problem.tags || []
    });
    setShowEditModal(true);
  };

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProblem(problemId);
      // Refresh the data to show updated list
      loadAllData();
    } catch (error) {
      console.error('Error deleting problem:', error);
      alert('Failed to delete problem. Please try again.');
    }
  };

  const handleCreateProblem = async (problemData) => {
    try {
      await createProblem(problemData);
      setShowCreateModal(false);
      setNewProblem({ title: '', description: '', difficulty: 1, tags: [] });
      loadAllData(); // Refresh data
      alert('Problem created successfully!');
    } catch (error) {
      console.error('Error creating problem:', error);
      alert(error.message || 'Failed to create problem');
    }
  };

  const handleUpdateProblem = async (problemData) => {
    try {
      await updateProblem(editingProblem.id, problemData);
      setShowEditModal(false);
      setNewProblem({ title: '', description: '', difficulty: 1, tags: [] });
      setEditingProblem(null);
      loadAllData(); // Refresh data
      alert('Problem updated successfully!');
    } catch (error) {
      console.error('Error updating problem:', error);
      alert(error.message || 'Failed to update problem');
    }
  };

  const handleSubmitSolution = async (problemId, solutionText) => {
    try {
      await submitSolution(problemId, solutionText);
    } catch (error) {
      throw new Error(error.message || 'Failed to submit solution');
    }
  };

  const viewSolution = async (problem) => {
    try {
      const solutions = await getProblemSolutions(problem.id);
      // Find the user's solution
      const userSolution = solutions.find(sol => sol.user_id === user.id);
      if (userSolution) {
        alert(`Your solution:\n\n${userSolution.solution_text || userSolution.content}`);
      } else {
        alert('Solution not found.');
      }
    } catch (error) {
      console.error('Error viewing solution:', error);
      alert('Failed to load solution. Please try again.');
    }
  };

  const sortProblems = (problems, sortBy) => {
    return [...problems].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at || b.solved_at) - new Date(a.created_at || a.solved_at);
      if (sortBy === 'oldest') return new Date(a.created_at || a.solved_at) - new Date(b.created_at || b.solved_at);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return 0;
    });
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
          onClick={() => setShowCreateModal(true)}
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
            <span className="tab-count">({communityProblems.length})</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Problems
            <span className="tab-count">({myProblems.length})</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'solved' ? 'active' : ''}`}
            onClick={() => setActiveTab('solved')}
          >
            Solved Problems
            <span className="tab-count">({solvedProblems.length})</span>
          </button>
        </div>
        
        <div className="tab-controls">
          <div className="tab-description">
            {activeTab === 'community' ? (
              <p>Solve problems created by the community</p>
            ) : activeTab === 'my' ? (
              <p>Manage problems you've created</p>
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
        {activeTab === 'community' && (
          <div className="community-problems">
            {sortProblems(communityProblems, sortBy).map(problem => {
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
        )}

        {activeTab === 'my' && (
          <div className="my-problems">
            <div className="problems-header">
              <h3>My Problems</h3>
              <button className="create-btn" onClick={() => setShowCreateModal(true)}>
                <span className="btn-icon">➕</span>
                Create Problem
              </button>
            </div>
            
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading your problems...</p>
              </div>
            ) : (
              <div className="problems-list">
                {sortProblems(myProblems, sortBy).map((problem) => {
                  return (
                    <div key={`my-${problem.id}`} className="problem-card">
                      <div className="problem-header">
                        <div className="problem-title-section">
                          <h3 className="problem-title">{problem.title}</h3>
                          <div className="problem-meta">
                            <span className={`difficulty-badge ${getDifficultyLevel(problem.difficulty)}`}>
                              {getDifficultyLevel(problem.difficulty)}
                            </span>
                            <span className="problem-date">
                              Created {formatDate(problem.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="problem-content">
                        <p className="problem-description">{problem.description}</p>
                        <div className="problem-tags">
                          {problem.tags && problem.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="problem-actions">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => openEditModal(problem)}
                        >
                          <span className="btn-icon">✏️</span>
                          Edit
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteProblem(problem.id)}
                        >
                          <span className="btn-icon">🗑️</span>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'solved' && (
          <div className="solved-problems">
            <div className="problems-header">
              <h3>Solved Problems</h3>
              <div className="solved-stats">
                <span className="solved-count">{solvedProblems.length} Solved</span>
              </div>
            </div>
            
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading solved problems...</p>
              </div>
            ) : (
              <div className="problems-list">
                {sortProblems(solvedProblems, sortBy).map((problem) => {
                  return (
                    <div key={`solved-${problem.problem_id || problem.id}`} className="problem-card solved-card">
                      <div className="problem-header">
                        <div className="problem-title-section">
                          <h3 className="problem-title">{problem.title}</h3>
                          <div className="problem-meta">
                            <span className={`difficulty-badge ${getDifficultyLevel(problem.difficulty)}`}>
                              {getDifficultyLevel(problem.difficulty)}
                            </span>
                            <span className="solved-badge">
                              ✓ Solved
                            </span>
                            <span className="problem-date">
                              Solved {formatDate(problem.solved_at || problem.date_solved)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="problem-content">
                        <p className="problem-description">{problem.description}</p>
                        <div className="problem-meta">
                          <span className="problem-category">
                            📂 {problem.category}
                          </span>
                          <span className="problem-author">
                            👤 Created by {problem.problem_creator_username || 'Unknown'}
                          </span>
                        </div>
                        <div className="solved-info">
                          <div className="solution-time">
                            <span className="time-label">Solution Date:</span>
                            <span className="time-value">{formatDate(problem.solved_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="problem-actions">
                        <button 
                          className="action-btn view-solution-btn"
                          onClick={() => {
                            // Show solution details in a modal or alert for now
                            alert(`Your solution:\n\n${problem.solution_text || 'No solution text available'}`);
                          }}
                        >
                          <span className="btn-icon">👁️</span>
                          View Solution
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
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

      {/* Create Problem Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Problem</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateProblem(newProblem);
            }}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newProblem.title}
                  onChange={(e) => setNewProblem({...newProblem, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newProblem.description}
                  onChange={(e) => setNewProblem({...newProblem, description: e.target.value})}
                  rows="5"
                  required
                />
              </div>
              <div className="form-group">
                <label>Difficulty</label>
                <select
                  value={newProblem.difficulty}
                  onChange={(e) => setNewProblem({...newProblem, difficulty: parseInt(e.target.value)})}
                >
                  <option value={1}>Easy</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Hard</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit">Create Problem</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Problem Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Problem</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateProblem(newProblem);
            }}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newProblem.title}
                  onChange={(e) => setNewProblem({...newProblem, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newProblem.description}
                  onChange={(e) => setNewProblem({...newProblem, description: e.target.value})}
                  rows="5"
                  required
                />
              </div>
              <div className="form-group">
                <label>Difficulty</label>
                <select
                  value={newProblem.difficulty}
                  onChange={(e) => setNewProblem({...newProblem, difficulty: parseInt(e.target.value)})}
                >
                  <option value={1}>Easy</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Hard</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit">Update Problem</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Solve Problem Modal */}
      {showSolveModal && selectedProblem && (
        <div className="modal-overlay" onClick={() => setShowSolveModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Solve: {selectedProblem.title}</h3>
              <button className="modal-close" onClick={() => setShowSolveModal(false)}>×</button>
            </div>
            <div className="problem-details">
              <p>{selectedProblem.description}</p>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSolving(true);
              try {
                await handleSubmitSolution(selectedProblem.id, solution);
                alert('Solution submitted successfully!');
                setShowSolveModal(false);
                setSolution('');
                loadAllData(); // Refresh data
              } catch (error) {
                alert(error.message || 'Failed to submit solution');
              } finally {
                setIsSolving(false);
              }
            }}>
              <div className="form-group">
                <label>Your Solution</label>
                <textarea
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Enter your solution here..."
                  rows="10"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowSolveModal(false)}>Cancel</button>
                <button type="submit" disabled={isSolving}>
                  {isSolving ? 'Submitting...' : 'Submit Solution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Problems;