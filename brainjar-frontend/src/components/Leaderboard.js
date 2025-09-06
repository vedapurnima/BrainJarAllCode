import React from 'react';

const Leaderboard = ({ user }) => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px', color: '#1a202c' }}>Leaderboard</h1>
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '16px', 
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
        <h3 style={{ color: '#4a5568', marginBottom: '8px' }}>Leaderboard</h3>
        <p style={{ color: '#718096' }}>See where you rank among all BrainJar users!</p>
      </div>
    </div>
  );
};

export default Leaderboard;
