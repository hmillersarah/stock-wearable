import logo from './logo.svg';
import axios from 'axios';
import React, { useState } from 'react';
// import Login from './Login'
import { BrowserRoute, BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login'
import Profile from './components/Profile'
import Header from './components/Header'
import useToken from './components/useToken'
import './App.css'

function App() {

  const { token, removeToken, setToken } = useToken();
  const [stockData, setStockData] = useState(null);

  function getData() {
    axios({
      method: "GET",
      url: "/stock",
    }).then((response) => {
      const res = response.data;
      console.log(res);
      setStockData(({
        stock_name: res.longName,
        dayHigh: res.dayHigh
      }));

    });

    axios({
      method: "GET",
      url: "/market",
    }).then((response) => {
      const res = response.data;
      setStockData(({
        maxClose: res
      }))
    });
  }

  return (
    <BrowserRouter>
      <div className="App">

        <Header token={removeToken}/>
        {!token && token!=="" &&token!== undefined?  
        <Login setToken={setToken} />
        :(
          <>
            <Routes>
              <Route exact path="/profile" element={<Profile token={token} setToken={setToken}/>}></Route>
            </Routes>
          </>
        )}

        {/* <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />

          <p>To get your stock details: </p><button onClick={getData}>Click me</button>
          {stockData && <div>
            <p>Stock name: {stockData.stock_name}</p>
            <p>Stock day high: {stockData.dayHigh}</p>
            <p>Stock past 1 month max close: {stockData.maxClose}</p>
          </div>}

        </header> */}
      </div>
    </BrowserRouter>
  );
}

export default App;
