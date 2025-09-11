import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const statIcons = {
  streak: <span className="stat-icon" style={{background:'#f59e0b1a',color:'#f59e0b',padding:'10px',borderRadius:'12px'}}>&#128293;</span>,
  solved: <span className="stat-icon" style={{background:'#3b82f61a',color:'#3b82f6',padding:'10px',borderRadius:'12px'}}>&#128218;</span>,
  friends: <span className="stat-icon" style={{background:'#22c55e1a',color:'#22c55e',padding:'10px',borderRadius:'12px'}}>&#128101;</span>,
  rank: <span className="stat-icon" style={{background:'#fde68a',color:'#eab308',padding:'10px',borderRadius:'12px'}}>&#127942;</span>,
};

const Dashboard = ({ user }) => {

  const [stats, setStats] = useState({
    streak: 7,
    problemsSolved: 23,
    friends: 12,
    globalRank: 5,
    streakProgress: 0.7,
    weeklyIncrease: 3,
    pendingRequests: 2,
    rankChange: 2,
  });

  // Add missing state hooks
  const [recentActivity, setRecentActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Add missing achievementIcons object
  const achievementIcons = {
    step: <span className="achievement-icon" style={{background:'#f59e0b1a',color:'#f59e0b',padding:'8px',borderRadius:'10px'}}>&#128095;</span>,
    solver: <span className="achievement-icon" style={{background:'#3b82f61a',color:'#3b82f6',padding:'8px',borderRadius:'10px'}}>&#128161;</span>,
    butterfly: <span className="achievement-icon" style={{background:'#22c55e1a',color:'#22c55e',padding:'8px',borderRadius:'10px'}}>&#129419;</span>,
    warrior: <span className="achievement-icon" style={{background:'#fde68a',color:'#eab308',padding:'8px',borderRadius:'10px'}}>&#128170;</span>,
    speed: <span className="achievement-icon" style={{background:'#f43f5e1a',color:'#f43f5e',padding:'8px',borderRadius:'10px'}}>&#128640;</span>,
    mind: <span className="achievement-icon" style={{background:'#6366f11a',color:'#6366f1',padding:'8px',borderRadius:'10px'}}>&#129504;</span>,
  };

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

        // Update recent activity with real data
        const recentProblemsActivity = problems
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
          .map(problem => ({
            id: problem.id,
            type: 'problem',
            title: problem.title,
            time: new Date(problem.created_at).toLocaleString(),
            points: 10 // Default points, adjust as necessary
          }));

        setRecentActivity(recentProblemsActivity);

        // Set achievements based on real data
        setAchievements([
          { id: 1, name: 'First Step', icon: achievementIcons.step, unlocked: totalProblems > 0 },
          { id: 2, name: 'Problem Solver', icon: achievementIcons.solver, unlocked: solvedProblems > 0 },
          { id: 3, name: 'Social Butterfly', icon: achievementIcons.butterfly, unlocked: true },
          { id: 4, name: 'Week Warrior', icon: achievementIcons.warrior, unlocked: currentStreak >= 7 },
          { id: 5, name: 'Speed Demon', icon: achievementIcons.speed, unlocked: false },
          { id: 6, name: 'Master Mind', icon: achievementIcons.mind, unlocked: false },
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default data on error
        setRecentActivity([]);
        setAchievements([]);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="welcome-message">
          Welcome back, <span className="user-name">Alex! <span role="img" aria-label="target">🎯</span></span>
        </h1>
        <div className="dashboard-subtitle">Ready to solve some problems and expand your mind?</div>
      </div>
      <div className="stats-grid">
        {/* Current Streak Card */}
        <div className="stat-card streak-card">
          <div className="stat-icon-bg streak-bg">🔥</div>
          <div className="stat-title">Current Streak</div>
          <div className="stat-value"><b>{stats.streak} days</b></div>
          <div className="progress-bar"><div className="progress-fill" style={{width: `${stats.streakProgress*100}%`}}></div></div>
          <div className="stat-subtitle">3 more days to reach 10-day milestone!</div>
        </div>
        {/* Problems Solved Card */}
        <div className="stat-card problems-card">
          <div className="stat-icon-bg problems-bg">📖</div>
          <div className="stat-title">Problems Solved</div>
          <div className="stat-value"><b>{stats.problemsSolved}</b></div>
          <div className="stat-subtitle stat-green">&#8599; +{stats.weeklyIncrease} this week</div>
        </div>
        {/* Friends Card */}
        <div className="stat-card friends-card">
          <div className="stat-icon-bg friends-bg">👥</div>
          <div className="stat-title">Friends</div>
          <div className="stat-value"><b>{stats.friends}</b></div>
          <div className="stat-subtitle">{stats.pendingRequests} pending requests</div>
        </div>
        {/* Global Rank Card */}
        <div className="stat-card rank-card">
          <div className="stat-icon-bg rank-bg">🏆</div>
          <div className="stat-title">Global Rank</div>
          <div className="stat-value"><b>#{stats.globalRank}</b></div>
          <div className="stat-subtitle stat-green">&#8599; Up {stats.rankChange} places</div>
        </div>
      </div>

      {/* Lower dashboard sections */}
      <div className="dashboard-content">
        <div className="content-left">
          <div className="recent-activity-card">
            <div className="section-title"><span className="section-icon">🕒</span>Recent Activity</div>
            <div className="activity-list">
              {recentActivity.length === 0 ? (
                <div className="activity-item">No recent activity yet.</div>
              ) : (
                recentActivity.map((item) => (
                  <div className="activity-item" key={item.id}>
                    <span className="activity-icon">📖</span>
                    <div className="activity-content">
                      <div className="activity-title">{item.title}</div>
                      <div className="activity-time">{item.time}</div>
                    </div>
                    <span className="activity-points">+{item.points} pts</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="content-right">
          <div className="quick-actions-card">
            <div className="section-title"><span className="section-icon">🎯</span>Quick Actions</div>
            <div className="quick-actions">
              <button className="action-btn primary"><span className="action-icon">⚡</span>Solve Random Problem</button>
              <button className="action-btn secondary"><span className="action-icon">👥</span>Find New Friends</button>
              <button className="action-btn secondary"><span className="action-icon">🏆</span>View Achievements</button>
              <button className="action-btn secondary"><span className="action-icon">📅</span>Daily Challenge</button>
            </div>
          </div>
        </div>
      </div>
      <div className="achievements-card">
        <div className="section-title"><span className="section-icon">🏅</span>Recent Achievements</div>
        <div className="achievements-subtitle">Keep solving problems to unlock more badges!</div>
        <div className="achievements-grid">
          {achievements.map((ach) => (
            <div className={`achievement-badge ${ach.unlocked ? 'unlocked' : 'locked'}`} key={ach.id}>
              {ach.icon}
              <div className="achievement-name">{ach.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
