import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Problems.css';

const Problems = ({ user }) => {
  const [communityProblems, setCommunityProblems] = useState([]);
  const [myProblems, setMyProblems] = useState([]);
  const [activeTab, setActiveTab] = useState('community');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, category
  const [newProblem, setNewProblem] = useState({
    title: '',
    description: '',
    category: ''
  });
  
  // New state for solving problems and feedback
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showSolveModal, setShowSolveModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [problemResponses, setProblemResponses] = useState([]);
  const [feedback, setFeedback] = useState({
    rating: 5,
    feedback: '',
    is_helpful: true
  });
  const [solution, setSolution] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch all problems first
      const allProblemsResponse = await axios.get('http://localhost:8080/api/problems', { headers });
      const allProblems = allProblemsResponse.data || [];
      
      // Try to fetch community problems, fallback to all problems if community endpoint doesn't exist
      let communityData = [];
      try {
        const communityResponse = await axios.get('http://localhost:8080/api/problems/community', { headers });
        communityData = communityResponse.data || [];
      } catch (communityError) {
        console.log('Community endpoint not available, using all problems as community');
        // Use all problems as community problems if community endpoint doesn't exist
        communityData = allProblems;
      }
      
      // Set community problems (exclude user's own problems for community view)
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      const filteredCommunityProblems = communityData.filter(problem => problem.user_id !== userId);
      setCommunityProblems(sortProblems(filteredCommunityProblems, sortBy));
      
      // Set user's own problems
      const userProblems = allProblems.filter(problem => problem.user_id === userId);
      setMyProblems(sortProblems(userProblems, sortBy));
      
    } catch (error) {
      console.error('Error fetching problems:', error);
      // Set empty arrays on error
      setCommunityProblems([]);
      setMyProblems([]);
    } finally {
      setLoading(false);
    }
  };

  const sortProblems = (problems, sortType) => {
    const sorted = [...problems];
    switch (sortType) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'category':
        return sorted.sort((a, b) => a.category.localeCompare(b.category));
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  };

  // Update sorting when sortBy changes
  useEffect(() => {
    if (!loading) {
      setCommunityProblems(prev => sortProblems(prev, sortBy));
      setMyProblems(prev => sortProblems(prev, sortBy));
    }
  }, [sortBy, loading]);

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/problems', newProblem, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewProblem({ title: '', description: '', category: '' });
      setShowCreateForm(false);
      fetchProblems();
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

  // Function to handle marking a problem as solved
  const handleSolveProblem = async (problemId, solutionText = '') => {
    setIsSolving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8080/api/problems/${problemId}/solve`, 
        { solved: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowSolveModal(false);
      setSelectedProblem(null);
      setSolution('');
      alert('Congratulations! Problem marked as solved! 🎉');
      fetchProblems(); // Refresh the problems list
    } catch (error) {
      console.error('Error marking problem as solved:', error);
      alert('Failed to mark problem as solved');
    } finally {
      setIsSolving(false);
    }
  };

  // Function to submit feedback for a problem
  const handleSubmitFeedback = async (problemId) => {
    setIsSubmittingFeedback(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/api/problems/${problemId}/feedback`, 
        feedback,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowFeedbackModal(false);
      setSelectedProblem(null);
      setFeedback({ rating: 5, feedback: '', is_helpful: true });
      alert('Thank you for your feedback! 👍');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Function to fetch problem responses (for problem creators)
  const fetchProblemResponses = async (problemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/problems/${problemId}/responses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProblemResponses(response.data);
      setShowResponsesModal(true);
    } catch (error) {
      console.error('Error fetching problem responses:', error);
      alert('Failed to fetch responses');
    }
  };

  // Function to open solve modal
  const openSolveModal = (problem) => {
    setSelectedProblem(problem);
    setShowSolveModal(true);
  };

  // Function to open feedback modal  
  const openFeedbackModal = (problem) => {
    setSelectedProblem(problem);
    setShowFeedbackModal(true);
  };

  // Function to render star rating
  const renderStarRating = (rating, onRatingChange) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star ${star <= rating ? 'active' : ''}`}
            onClick={() => onRatingChange && onRatingChange(star)}
          >
            ⭐
          </button>
        ))}
      </div>
    );
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
        </div>
        
        <div className="tab-controls">
          <div className="tab-description">
            {activeTab === 'community' ? (
              <p>Solve problems created by the community</p>
            ) : (
              <p>Problems you've created and their responses</p>
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
            {communityProblems.map(problem => {
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
                        <span className="author-icon">$</span>
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
                      <span className="btn-icon">▶</span>
                      Solve
                    </button>
                    <button 
                      className="action-btn feedback-btn"
                      onClick={() => openFeedbackModal(problem)}
                    >
                      <span className="btn-icon">💬</span>
                      Feedback
                    </button>
                    <button className="action-btn rate-btn">
                      <span className="btn-icon">⭐</span>
                      Rate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="my-problems">
            {myProblems.map(problem => (
              <div key={problem.id} className="my-problem-card">
                <div className="problem-header">
                  <h3 className="problem-title">{problem.title}</h3>
                  <div className="problem-stats">
                    <div className="responses-badge">
                      0 responses
                    </div>
                    <div className="rating-badge">
                      ⭐ {problem.solved ? '5.0' : 'New'}
                    </div>
                  </div>
                </div>
                
                <p className="problem-description">{problem.description}</p>
                
                <div className="problem-meta">
                  <span className="problem-category">
                    <span className="category-icon">⚡</span>
                    {problem.category}
                  </span>
                  <span className="problem-date">
                    📅 {formatDate(problem.created_at)}
                  </span>
                  {problem.solved && (
                    <span className="problem-status">
                      ✅ Solved
                    </span>
                  )}
                </div>
                
                <div className="problem-actions">
                  <button 
                    className="action-btn view-responses-btn"
                    onClick={() => fetchProblemResponses(problem.id)}
                  >
                    <span className="btn-icon">💬</span>
                    View Responses (0)
                  </button>
                  <button className="action-btn edit-btn">
                    <span className="btn-icon">✏️</span>
                    Edit Problem
                  </button>
                </div>
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
                <label>Your Solution (Optional):</label>
                <textarea
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  rows="6"
                  placeholder="Describe your approach to solving this problem..."
                  className="solution-textarea"
                />
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
                  disabled={isSolving}
                >
                  {isSolving ? 'Marking as Solved...' : '✓ Mark as Solved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedProblem && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal-content feedback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Provide Feedback</h2>
              <button 
                className="close-btn"
                onClick={() => setShowFeedbackModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="problem-summary">
              <h4>{selectedProblem.title}</h4>
              <p>By: {getAuthorName(selectedProblem)}</p>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmitFeedback(selectedProblem.id);
            }}>
              <div className="form-group">
                <label>Rating:</label>
                <div className="rating-section">
                  {renderStarRating(feedback.rating, (rating) => 
                    setFeedback({...feedback, rating})
                  )}
                  <span className="rating-text">({feedback.rating}/5 stars)</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Feedback (Optional):</label>
                <textarea
                  value={feedback.feedback}
                  onChange={(e) => setFeedback({...feedback, feedback: e.target.value})}
                  rows="4"
                  placeholder="Share your thoughts about this problem..."
                  className="feedback-textarea"
                />
              </div>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={feedback.is_helpful}
                    onChange={(e) => setFeedback({...feedback, is_helpful: e.target.checked})}
                  />
                  <span className="checkmark"></span>
                  This problem was helpful
                </label>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowFeedbackModal(false)}
                  disabled={isSubmittingFeedback}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn feedback-submit-btn"
                  disabled={isSubmittingFeedback}
                >
                  {isSubmittingFeedback ? 'Submitting...' : '💬 Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Problem Responses Modal */}
      {showResponsesModal && (
        <div className="modal-overlay" onClick={() => setShowResponsesModal(false)}>
          <div className="modal-content responses-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Problem Responses</h2>
              <button 
                className="close-btn"
                onClick={() => setShowResponsesModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="responses-content">
              {problemResponses.feedback && problemResponses.feedback.length > 0 ? (
                <div className="feedback-responses">
                  <h3>Feedback ({problemResponses.feedback.length})</h3>
                  {problemResponses.feedback.map(response => (
                    <div key={response.id} className="response-item">
                      <div className="response-header">
                        <div className="user-info">
                          <div className="user-avatar">
                            {response.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-details">
                            <strong>{response.user_name}</strong>
                            <div className="response-date">
                              {formatDate(response.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="response-rating">
                          {renderStarRating(response.rating)}
                        </div>
                      </div>
                      
                      {response.feedback && (
                        <div className="response-feedback">
                          <p>{response.feedback}</p>
                        </div>
                      )}
                      
                      <div className="response-meta">
                        {response.is_helpful ? (
                          <span className="helpful-badge">✓ Helpful</span>
                        ) : (
                          <span className="not-helpful-badge">Not Helpful</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-responses">
                  <div className="empty-icon">💬</div>
                  <h3>No responses yet</h3>
                  <p>Be the first to provide feedback on this problem!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {((activeTab === 'community' && communityProblems.length === 0) || 
        (activeTab === 'my' && myProblems.length === 0)) && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No problems yet</h3>
          <p>
            {activeTab === 'community' 
              ? "No community problems available at the moment."
              : "Create your first problem to get started!"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Problems;
