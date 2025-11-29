import React from 'react';

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <p>No user</p>;
  return (
    <div className="form-container">
      <h2>Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
    </div>
  );
}