import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import React, { useState } from 'react';
import Login from './Login'

function App() {

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
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <p>To get your stock details: </p><button onClick={getData}>Click me</button>
        {stockData && <div>
          <p>Stock name: {stockData.stock_name}</p>
          <p>Stock day high: {stockData.dayHigh}</p>
          <p>Stock past 1 month max close: {stockData.maxClose}</p>
        </div>}

      </header>
    </div>
  );
}

export default App;
