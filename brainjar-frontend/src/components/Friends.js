import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Friends.css';

const Friends = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('suggestions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [suggestions, setSuggestions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myFriends, setMyFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() && activeTab === 'suggestions') {
      searchUsers();
    } else if (!searchTerm.trim() && activeTab === 'suggestions') {
      fetchSuggestions();
    }
  }, [searchTerm, activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch all data simultaneously
      const [suggestionsRes, pendingRes, friendsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/users/suggestions', config),
        axios.get('http://localhost:8080/api/friend-request/pending', config),
        axios.get('http://localhost:8080/api/friends', config)
      ]);

      setSuggestions(suggestionsRes.data.users || []);
      setPendingRequests(pendingRes.data.requests || []);
      setMyFriends(friendsRes.data.friends || []);
    } catch (err) {
      console.error('Error fetching friends data:', err);
      setError('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/users/suggestions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(response.data.users || []);
      setSearchResults([]);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/users/search?q=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data.users || []);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const sendFriendRequest = async (receiverId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/friend-request/send', 
        { receiver_id: receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh suggestions to remove the user we sent request to
      fetchSuggestions();
      alert('Friend request sent successfully!');
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert('Failed to send friend request');
    }
  };

  const respondToRequest = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = action === 'accept' ? 'accept' : 'reject';
      
      await axios.post(`http://localhost:8080/api/friend-request/${endpoint}/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh all data after accepting/rejecting
      fetchAllData();
      alert(`Friend request ${action}ed successfully!`);
    } catch (err) {
      console.error(`Error ${action}ing friend request:`, err);
      alert(`Failed to ${action} friend request`);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const renderUserCard = (userInfo, showActions = true) => (
    <div key={userInfo.id} className="user-card">
      <div className="user-avatar">
        {getInitials(userInfo.username)}
      </div>
      <div className="user-info">
        <h3>{userInfo.username}</h3>
        <div className="user-email">{userInfo.email}</div>
        
        <div className="user-stats">
          <div className="stat-item">
            <span className="stat-icon">🔥</span>
            <span>{Math.floor(Math.random() * 30)} day streak</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <span>{Math.floor(Math.random() * 200)} problems</span>
          </div>
        </div>

        {showActions && (
          <div className="user-actions">
            <button 
              className="btn btn-primary"
              onClick={() => sendFriendRequest(userInfo.id)}
            >
              ➕ Add Friend
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderRequestCard = (request) => (
    <div key={request.id} className="user-card">
      <div className="user-avatar">
        {getInitials(request.username)}
      </div>
      <div className="user-info">
        <h3>{request.username}</h3>
        <div className="request-timestamp">
          Sent {formatTimeAgo(request.created_at)}
        </div>
        
        <div className="user-actions">
          <button 
            className="btn btn-success"
            onClick={() => respondToRequest(request.id, 'accept')}
          >
            ✓ Accept
          </button>
          <button 
            className="btn btn-danger"
            onClick={() => respondToRequest(request.id, 'reject')}
          >
            ✗ Decline
          </button>
        </div>
      </div>
    </div>
  );

  const renderFriendCard = (friend) => (
    <div key={friend.id} className="friend-card">
      <div className="friend-header">
        <div className="friend-avatar">
          {getInitials(friend.friend_username)}
        </div>
        <div className="friend-info">
          <div className="online-indicator">
            <div className="online-dot"></div>
            <span>Online</span>
          </div>
          <h3>{friend.friend_username}</h3>
          <div className="friend-email">{friend.friend_email}</div>
        </div>
      </div>
      
      <div className="user-stats">
        <div className="stat-item">
          <span className="stat-icon">🔥</span>
          <span>{Math.floor(Math.random() * 45)} day streak</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⭐</span>
          <span>{Math.floor(Math.random() * 312)} problems</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">👥</span>
          <span>{Math.floor(Math.random() * 5)} mutual friends</span>
        </div>
      </div>

      <div className="friend-actions">
        <button 
          className="chat-btn"
          onClick={() => navigate('/chat', { state: { selectedFriend: friend } })}
        >
          💬 Chat
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="friends-container">
        <div className="loading-spinner">
          Loading friends data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="friends-container">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="friends-container">
      <div className="friends-header">
        <h1 className="friends-title">Friends</h1>
        <p className="friends-subtitle">Connect with fellow learners and grow together</p>
      </div>

      <div className="friends-tabs">
        <button 
          className={`friends-tab ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          👥 Suggestions
        </button>
        <button 
          className={`friends-tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          📨 Requests
          {pendingRequests.length > 0 && (
            <span className="notification-badge">{pendingRequests.length}</span>
          )}
        </button>
        <button 
          className={`friends-tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          ✓ My Friends
        </button>
      </div>

      {activeTab === 'suggestions' && (
        <>
          <div className="search-section">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search for new friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="friends-content">
            {searchTerm ? (
              searchResults.length > 0 ? (
                <div className="user-grid">
                  {searchResults.map(user => renderUserCard(user))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <h3 className="empty-state-title">No users found</h3>
                  <p className="empty-state-description">
                    Try searching with a different username
                  </p>
                </div>
              )
            ) : suggestions.length > 0 ? (
              <>
                <p style={{ marginBottom: '20px', color: '#718096' }}>
                  Discover new friends to connect and learn with
                </p>
                <div className="user-grid">
                  {suggestions.map(user => renderUserCard(user))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <h3 className="empty-state-title">No suggestions available</h3>
                <p className="empty-state-description">
                  Check back later for new friend suggestions
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'requests' && (
        <div className="friends-content">
          {pendingRequests.length > 0 ? (
            <>
              <p style={{ marginBottom: '20px', color: '#718096' }}>
                Accept or decline friend requests
              </p>
              <div className="user-grid">
                {pendingRequests.map(request => renderRequestCard(request))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📨</div>
              <h3 className="empty-state-title">No pending requests</h3>
              <p className="empty-state-description">
                You don't have any friend requests at the moment
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'friends' && (
        <div className="friends-content">
          {myFriends.length > 0 ? (
            <>
              <p style={{ marginBottom: '20px', color: '#718096' }}>
                Your learning companions
              </p>
              <div className="friends-list">
                {myFriends.map(friend => renderFriendCard(friend))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3 className="empty-state-title">No friends yet</h3>
              <p className="empty-state-description">
                Start connecting with other learners to build your network
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Friends;
