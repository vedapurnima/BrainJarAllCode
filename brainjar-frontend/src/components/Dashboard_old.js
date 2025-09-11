import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    streak: 0,
    problemsSolved: 0,
    friends: 0,
    globalRank: 0,
    streakProgress: 0,
    weeklyIncrease: 0,
    pendingRequests: 0,
    rankChange: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch real problems data to calculate stats
        const problemsResponse = await axios.get('http://localhost:8080/api/problems', { headers });
        const problems = problemsResponse.data || [];
        
        // Calculate real stats from problems data
        const solvedProblems = problems.filter(p => p.solved).length;
        const totalProblems = problems.length;
        
        // Try to fetch user streak data (if endpoint exists)
        let currentStreak = 7; // Default fallback
        try {
          const streakResponse = await axios.get('http://localhost:8080/api/streaks', { headers });
          if (streakResponse.data && streakResponse.data.length > 0) {
            currentStreak = streakResponse.data[0].current_streak || 7;
          }
        } catch (streakError) {
          console.log('Streak endpoint not available, using default');
        }

        setStats({
          problemsSolved: solvedProblems,
          totalProblems: totalProblems,
          currentStreak: currentStreak,
          bestStreak: Math.max(currentStreak, 15) // Fallback for best streak
        });

        // Set recent activity based on recent problems
        const recentProblemsActivity = problems
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
          .map(problem => ({
            id: problem.id,
            type: 'problem_created',
            description: `Created problem: ${problem.title}`,
            timestamp: problem.created_at
          }));

        setRecentActivity(recentProblemsActivity);

        // Set some default achievements
        setAchievements([
          { id: 1, title: 'Problem Creator', description: 'Created your first problem', icon: '🎯', unlocked: totalProblems > 0 },
          { id: 2, title: 'Problem Solver', description: 'Solved your first problem', icon: '✅', unlocked: solvedProblems > 0 },
          { id: 3, title: 'Week Warrior', description: 'Maintained a 7-day streak', icon: '🔥', unlocked: currentStreak >= 7 },
          { id: 4, title: 'Prolific Creator', description: 'Created 5+ problems', icon: '📚', unlocked: totalProblems >= 5 }
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default data on error
        setStats({
          problemsSolved: 0,
          totalProblems: 0,
          currentStreak: 0,
          bestStreak: 0
        });
        setRecentActivity([]);
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getTimeAgo = (dateString) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch real problems data to calculate stats
      const problemsResponse = await axios.get('http://localhost:8080/api/problems', { headers });
      const problems = problemsResponse.data || [];
      
      // Calculate real stats from problems data
      const solvedProblems = problems.filter(p => p.solved).length;
      const totalProblems = problems.length;
      
      // Try to fetch user streak data (if endpoint exists)
      let currentStreak = 7; // Default fallback
      try {
        const streakResponse = await axios.get('http://localhost:8080/api/streaks', { headers });
        if (streakResponse.data && streakResponse.data.length > 0) {
          currentStreak = streakResponse.data[0].current_streak || 7;
        }
      } catch (streakError) {
        console.log('Streak endpoint not available, using default');
      }

      setStats({
        streak: currentStreak,
        problemsSolved: solvedProblems,
        friends: 12, // This would come from friends API
        globalRank: 5, // This would come from leaderboard API
        streakProgress: Math.min((currentStreak / 10) * 100, 100),
        weeklyIncrease: Math.max(0, Math.floor(totalProblems * 0.1)),
        pendingRequests: 2, // This would come from friend requests API
        rankChange: 2 // This would come from rank tracking API
      });

      // Create recent activity from real problems data
      const recentProblems = problems
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 2);

      const activityItems = [
        ...recentProblems.map(problem => ({
          id: problem.id,
          type: 'problem',
          title: problem.solved ? `Solved: ${problem.title}` : `Created: ${problem.title}`,
          time: getTimeAgo(problem.created_at),
          points: problem.solved ? 50 : 25,
          icon: problem.solved ? '✅' : '�'
        })),
        {
          id: 'streak',
          type: 'streak',
          title: `${currentStreak}-day streak ${currentStreak >= 7 ? 'achieved!' : 'in progress'}`,
          time: 'Today',
          points: currentStreak >= 7 ? 100 : currentStreak * 10,
          icon: '🔥'
        }
      ];

      setRecentActivity(activityItems.slice(0, 3));

      setAchievements([
        { id: 1, name: 'First Step', icon: '🎯', unlocked: totalProblems > 0 },
        { id: 2, name: 'Problem Solver', icon: '🧩', unlocked: solvedProblems > 0 },
        { id: 3, name: 'Social Butterfly', icon: '🦋', unlocked: true }, // Would check friends
        { id: 4, name: 'Week Warrior', icon: '⚔️', unlocked: currentStreak >= 7 },
        { id: 5, name: 'Speed Demon', icon: '⚡', unlocked: solvedProblems >= 10 },
        { id: 6, name: 'Master Mind', icon: '🧠', unlocked: solvedProblems >= 50 }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to default values on error
      setStats({
        streak: 0,
        problemsSolved: 0,
        friends: 0,
        globalRank: 0,
        streakProgress: 0,
        weeklyIncrease: 0,
        pendingRequests: 0,
        rankChange: 0
      });
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const handleSolveRandomProblem = () => {
    // Navigate to problems page or show random problem
    window.location.href = '/problems';
  };

  const handleFindFriends = () => {
    window.location.href = '/friends';
  };

  const handleViewAchievements = () => {
    window.location.href = '/profile';
  };

  const handleDailyChallenge = () => {
    // Navigate to daily challenge
    window.location.href = '/problems?filter=daily';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="welcome-message">
          Welcome back, <span className="user-name">{user?.username || 'Alex'}</span>! 🎯
        </h1>
        <p className="dashboard-subtitle">
          Ready to solve some problems and expand your mind?
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card streak-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3 className="stat-title">Current Streak</h3>
            <div className="stat-value">{stats.streak} days</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${stats.streakProgress}%` }}
              ></div>
            </div>
            <p className="stat-subtitle">
              {10 - stats.streak} more days to reach 10-day milestone!
            </p>
          </div>
        </div>

        <div className="stat-card problems-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3 className="stat-title">Problems Solved</h3>
            <div className="stat-value">{stats.problemsSolved}</div>
            <div className="stat-change positive">
              📈 +{stats.weeklyIncrease} this week
            </div>
          </div>
        </div>

        <div className="stat-card friends-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3 className="stat-title">Friends</h3>
            <div className="stat-value">{stats.friends}</div>
            <div className="stat-subtitle">
              {stats.pendingRequests} pending requests
            </div>
          </div>
        </div>

        <div className="stat-card rank-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3 className="stat-title">Global Rank</h3>
            <div className="stat-value">#{stats.globalRank}</div>
            <div className="stat-change positive">
              🔥 Up {stats.rankChange} places
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-left">
          <div className="recent-activity-card">
            <h3 className="section-title">
              <span className="section-icon">🕐</span>
              Recent Activity
            </h3>
            <div className="activity-list">
              {recentActivity.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">{activity.icon}</div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                  <div className="activity-points">+{activity.points} pts</div>
                </div>
              ))}
            </div>
          </div>

          <div className="achievements-card">
            <h3 className="section-title">
              <span className="section-icon">🏆</span>
              Recent Achievements
            </h3>
            <p className="achievements-subtitle">
              Keep solving problems to unlock more badges!
            </p>
            <div className="achievements-grid">
              {achievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-icon">
                    {achievement.unlocked ? achievement.icon : '🔒'}
                  </div>
                  <div className="achievement-name">
                    {achievement.unlocked ? achievement.name : 'Locked'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="content-right">
          <div className="quick-actions-card">
            <h3 className="section-title">
              <span className="section-icon">🎯</span>
              Quick Actions
            </h3>
            <div className="quick-actions">
              <button 
                className="action-btn primary"
                onClick={handleSolveRandomProblem}
              >
                <span className="action-icon">⚡</span>
                Solve Random Problem
              </button>
              <button 
                className="action-btn secondary"
                onClick={handleFindFriends}
              >
                <span className="action-icon">👥</span>
                Find New Friends
              </button>
              <button 
                className="action-btn secondary"
                onClick={handleViewAchievements}
              >
                <span className="action-icon">🏆</span>
                View Achievements
              </button>
              <button 
                className="action-btn secondary"
                onClick={handleDailyChallenge}
              >
                <span className="action-icon">📅</span>
                Daily Challenge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
