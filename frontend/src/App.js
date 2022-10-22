import './App.css';
import React, { useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './Login';

function App() {

  const navigate = useNavigate();

  return (
    <div>
      <h1>Stock Wearable App</h1>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
