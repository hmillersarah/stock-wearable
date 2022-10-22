import axios from 'axios';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function Dashboard() {

    const [stockData, setStockData] = useState(null);
    const prevData = useLocation();
    const userID = prevData.state.currUsername;
    const userPass = prevData.state.currPassword;

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
        <div>
            <header>
                <h2>Dashboard</h2>
                <p>Username was: {userID}</p>
                <p>Password was: {userPass}</p>
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