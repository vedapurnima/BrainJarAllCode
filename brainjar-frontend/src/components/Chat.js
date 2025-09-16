import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './Chat.css';

const Chat = ({ user }) => {
  const location = useLocation();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(location.state?.selectedFriend || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch friends list on component mount
  useEffect(() => {
    fetchFriends();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages when a friend is selected
  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend.friend_id);
    }
  }, [selectedFriend]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:7000/api/friends', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriends(response.data.friends || []);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (friendId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/messages/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages.reverse() || []); // Reverse to show oldest first
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend || sending) return;

    setSending(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/messages/send', {
        receiver_id: selectedFriend.friend_id,
        message: newMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.message === "Message sent successfully") {
        // Add the new message to the local state immediately
        const tempMessage = {
          id: Date.now(), // temporary ID
          sender_id: user?.id,
          receiver_id: selectedFriend.friend_id,
          message: newMessage.trim(),
          created_at: new Date().toISOString(),
          sender_username: user?.username || 'You',
          is_read: false
        };
        
        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');
        
        // Refresh messages to get the actual message from server
        setTimeout(() => fetchMessages(selectedFriend.friend_id), 500);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      if (err.response?.status === 403) {
        setError('You can only message friends');
      } else {
        setError('Failed to send message');
      }
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    }
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const renderMessage = (message) => {
    const isOwn = message.sender_id === user?.id;
    return (
      <div key={message.id} className={`message ${isOwn ? 'own' : 'friend'}`}>
        <div className="message-content">
          <div className="message-text">{message.message}</div>
          <div className="message-time">{formatTime(message.created_at)}</div>
        </div>
        {!isOwn && (
          <div className="message-avatar">
            {getInitials(message.sender_username)}
          </div>
        )}
      </div>
    );
  };

  if (loading && !friends.length) {
    return (
      <div className="chat-container">
        <div className="loading-spinner">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1 className="chat-title">Chat</h1>
        <p className="chat-subtitle">Connect with your friends and discuss problems</p>
      </div>

      <div className="chat-layout">
        {/* Friends Sidebar */}
        <div className="friends-sidebar">
          <div className="sidebar-header">
            <h3><span className="friends-icon">👥</span> Friends</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search friends..."
                className="friend-search"
              />
            </div>
          </div>
          
          {friends.length === 0 ? (
            <div className="no-friends">
              <div className="no-friends-icon">👥</div>
              <p>No friends yet</p>
              <small>Add friends to start chatting</small>
            </div>
          ) : (
            <div className="friends-list">
              {friends.map(friend => (
                <div
                  key={friend.id}
                  className={`friend-item ${selectedFriend?.friend_id === friend.friend_id ? 'selected' : ''}`}
                  onClick={() => setSelectedFriend(friend)}
                >
                  <div className="friend-avatar">
                    {getInitials(friend.friend_username)}
                    <div className="online-indicator"></div>
                  </div>
                  <div className="friend-info">
                    <div className="friend-name">{friend.friend_username}</div>
                    <div className="friend-preview">Great job on that algorithm pr...</div>
                    <div className="friend-time">2 min ago</div>
                  </div>
                  <div className="friend-badge">1</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {!selectedFriend ? (
            <div className="no-chat-selected">
              <div className="no-chat-icon">💬</div>
              <h3>Select a friend to start chatting</h3>
              <p>Choose a friend from the sidebar to begin your conversation</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="chat-conversation-header">
                <div className="chat-friend-info">
                  <div className="chat-friend-avatar">
                    {getInitials(selectedFriend.friend_username)}
                    <div className="online-indicator large"></div>
                  </div>
                  <div>
                    <div className="chat-friend-name">{selectedFriend.friend_username}</div>
                    <div className="chat-friend-status">
                      <span className="status-dot"></span>
                      Online
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}
                
                {loading ? (
                  <div className="messages-loading">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="no-messages">
                    <div className="no-messages-icon">📝</div>
                    <p>No messages yet</p>
                    <small>Start a conversation with {selectedFriend.friend_username}</small>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map(renderMessage)}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form className="message-input-form" onSubmit={sendMessage}>
                <div className="message-input-container">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${selectedFriend.friend_username}...`}
                    className="message-input"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    className={`send-button ${sending ? 'sending' : ''}`}
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? '⏳' : '📤'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
