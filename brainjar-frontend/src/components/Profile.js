import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import './Profile.css';

const Profile = ({ user }) => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || 'Passionate about algorithms and problem-solving. Always learning something new!'
      });
    }
  }, [user]);

  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveChanges = () => {
    // Here you would typically make an API call to save the changes
    console.log('Saving profile changes:', editData);
    setIsEditing(false);
    // Show success message
  };

  const handleCancel = () => {
    // Reset to original data
    setEditData({
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || 'Passionate about algorithms and problem-solving. Always learning something new!'
    });
    setIsEditing(false);
  };

  // Mock data for achievements and statistics
  const stats = [
    { icon: '📚', value: 23, label: 'Problems Solved' },
    { icon: '👥', value: 12, label: 'Friends' },
    { icon: '🎯', value: 1540, label: 'Total Points' },
    { icon: '📈', value: 15, label: 'Best Streak' }
  ];

  const achievements = [
    { icon: '🎯', name: 'First Step', desc: 'Solved your first problem', unlocked: true },
    { icon: '🧩', name: 'Problem Solver', desc: 'Solved 10 problems', unlocked: true },
    { icon: '🦋', name: 'Social Butterfly', desc: 'Made 5 friends', unlocked: true },
    { icon: '⚔️', name: 'Week Warrior', desc: '7-day streak', unlocked: true },
    { icon: '⚡', name: 'Speed Demon', desc: 'Solve 5 problems in one day', unlocked: false },
    { icon: '🧠', name: 'Master Mind', desc: 'Solve 100 problems', unlocked: false }
  ];

  const recentActivity = [
    { date: '2024-01-20', problems: 3 },
    { date: '2024-01-19', problems: 2 },
    { date: '2024-01-18', problems: 1 },
    { date: '2024-01-17', problems: 4 },
    { date: '2024-01-16', problems: 0 },
    { date: '2024-01-15', problems: 2 },
    { date: '2024-01-14', problems: 1 }
  ];

  return (
    <div className={`profile-container ${theme}`}>
      <div className="profile-header">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">Track your progress and achievements</p>
      </div>

      {/* Main Profile Card */}
      <div className="profile-main-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {getInitials(user?.username)}
            <div className="avatar-badge">📷</div>
          </div>
        </div>

        <div className="profile-info">
          {!isEditing ? (
            <div className="profile-view">
              <h2 className="profile-name">{editData.username}</h2>
              <p className="profile-email">{editData.email}</p>
              <p className="profile-join-date">
                Joined {formatJoinDate(user?.created_at)}
              </p>
              <p className="profile-bio">{editData.bio}</p>
              <button className="edit-profile-btn" onClick={handleEditToggle}>
                ✏️ Edit Profile
              </button>
            </div>
          ) : (
            <form className="edit-form active">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={editData.username}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  name="bio"
                  value={editData.bio}
                  onChange={handleInputChange}
                  className="form-input form-textarea"
                />
              </div>
              <div className="form-buttons">
                <button type="button" className="save-btn" onClick={handleSaveChanges}>
                  Save Changes
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-stats-mini">
          <div className="stat-item-mini">
            <div className="stat-icon-mini">🔥</div>
            <div className="stat-value-mini">7</div>
            <div className="stat-label-mini">Day Streak</div>
          </div>
          <div className="stat-item-mini">
            <div className="stat-icon-mini">🏆</div>
            <div className="stat-value-mini">#5</div>
            <div className="stat-label-mini">Global Rank</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="profile-stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <span className="stat-icon">{stat.icon}</span>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom Sections */}
      <div className="profile-bottom">
        {/* Achievements Section */}
        <div className="profile-section">
          <div className="section-header">
            <h3 className="section-title">🏆 Achievements</h3>
          </div>
          <p className="section-subtitle">Unlock badges by reaching milestones</p>
          <div className="achievements-grid">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              >
                <span className="achievement-icon">{achievement.icon}</span>
                <div className="achievement-name">{achievement.name}</div>
                <div className="achievement-desc">{achievement.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="profile-section">
          <div className="section-header">
            <h3 className="section-title">📅 Recent Activity</h3>
          </div>
          <p className="section-subtitle">Your problem-solving activity over the past week</p>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-dot ${activity.problems > 0 ? 'solved' : 'no-activity'}`}></div>
                <div className="activity-content">
                  <div className="activity-date">{activity.date}</div>
                  <div className="activity-desc">
                    {activity.problems > 0 ? (
                      <>
                        {activity.problems} problems 🔥
                      </>
                    ) : (
                      '0 problems'
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
