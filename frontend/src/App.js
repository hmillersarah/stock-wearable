import './App.css';
import React, { useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './Login';
import useToken from './useToken';

function App() {
  const { token, removeToken, setToken } = useToken();
  const navigate = useNavigate();

  return (
    <div>
      {/* <h1>Stock Wearable App</h1> */}
      <Routes>
        <Route exact path="/" element={<Login setToken={setToken} />} />
        <Route exact path="/dashboard" element={<Dashboard token={token} setToken={setToken} />} />
      </Routes>
    </div>
  );
}

export default App;
