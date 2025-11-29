import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventDetails from './pages/EventDetails';
import Requests from './pages/Requests';
import { storage } from './services/storage';

function PrivateRoute({ children }) {
  const user = storage.getCurrentUser();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="app">
      <Toaster position="top-right" />
      <NavBar />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/events/:id" element={<PrivateRoute><EventDetails /></PrivateRoute>} />
          <Route path="/events/:id/requests" element={<PrivateRoute><Requests /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}