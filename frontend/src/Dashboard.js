import axios from 'axios';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import useToken from './useToken';

export default function Dashboard(props) {

    const { token, removeToken, setToken } = useToken();
    const [stockData, setStockData] = useState(null);
    const prevData = useLocation();
    const userID = prevData.state.currUsername;
    const userPass = prevData.state.currPassword;

    function getData() {
        axios({
            method: "GET",
            url: `/get-stocks/${userID}`,
        }).then((response) => {
            const res = response.data;
            console.log(res);
            res.access_token && props.setToken(res.access_token);
            let sentence = '';
            for (let i = 0; i < res.length; i++) {
                sentence = sentence + res[i][0] + ' ' + res[i][1];
            }
            console.log(sentence)
            setStockData((
                sentence
            ))
        });
        // axios({
        //     method: "GET",
        //     url: "/stock",
        //     headers: {
        //         Authorization: 'Bearer ' + props.token
        //     }
        // }).then((response) => {
        //     const res = response.data;
        //     console.log(res);
        //     res.access_token && props.setToken(res.access_token);
        //     setStockData(({
        //         stock_name: res.longName,
        //         dayHigh: res.dayHigh
        //     }));

        // });

        // axios({
        //     method: "GET",
        //     url: "/market",
        // }).then((response) => {
        //     const res = response.data;
        //     res.access_token && props.setToken(res.access_token)
        //     setStockData(({
        //         maxClose: res
        //     }))
        // });
    }

    return (
        <div>
            <header>
                <h2>Dashboard</h2>
                <p>Username was: {userID}</p>
                <p>Password was: {userPass}</p>
                <p>To get your stock details: </p><button onClick={getData}>Click me</button>
                {stockData && <div>
                    {/* <p>Stock name: {stockData.stock_name}</p>
                    <p>Stock day high: {stockData.dayHigh}</p>
                    <p>Stock past 1 month max close: {stockData.maxClose}</p> */}
                    <p>Stock data: {stockData}</p>
                </div>}
                <Header token={removeToken} />
            </header>
        </div>
    );
}