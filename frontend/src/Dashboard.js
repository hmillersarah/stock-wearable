import axios from 'axios';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import useToken from './useToken';

export default function Dashboard(props) {

    const { token, removeToken, setToken } = useToken();
    const [stockData, setStockData] = useState(null);
    const [stockPrice, setStockPrice] = useState([]);
    const [currStockPrice, setCurrStockPrice] = useState([]);
    const [priceChange, setPriceChange] = useState();
    const prevData = useLocation();
    const userID = prevData.state.currUsername;
    const userPass = prevData.state.currPassword;

    async function getData() {
        const first = await axios({
            method: "GET",
            url: `/get-stocks/${userID}`,
        }).then((response) => {
            const res = response.data;
            res.access_token && props.setToken(res.access_token);
            let sentence = '';
            for (let i = 0; i < res.length; i++) {
                sentence = sentence + res[i][0] + ' ' + res[i][1] + ' ';
            }
            setStockData((sentence));
            return res;
        });
        let tempPrices = [];
        let tempPriceSentence = '';
        let tempCurrPrices = [];
        let tempCurrPriceSentence = '';
        for (let i = 0; i < first.length; i++) {
            let currStock = first[i][0];
            let currFreq = first[i][1];
            const second = await axios({
                method: "GET",
                url: `/market/${currStock}/${currFreq}`,
            }).then((response) => {
                const res = response.data;
                res.access_token && props.setToken(res.access_token);
                tempPrices.push([currStock, res.toFixed(2)]);
                tempPriceSentence += currStock + ': ' + res.toFixed(2) + ' ';
            });
            const third = await axios({
                method: "GET",
                url: `/stock/${currStock}`,
            }).then((response) => {
                const res = response.data;
                res.access_token && props.setToken(res.access_token);
                tempCurrPrices.push([currStock, res.toFixed(2)]);
                tempCurrPriceSentence += currStock + ': ' + res.toFixed(2) + ' ';
            })
        }
        //console.log(tempPrices);
        setStockPrice(tempPriceSentence);
        setCurrStockPrice(tempCurrPriceSentence);
        let tempPriceChange = [];
        let tempPriceChangeSentence = '';
        for (let i = 0; i < tempCurrPrices.length; i++) {
            let percent = (tempCurrPrices[i][1] - tempPrices[i][1]) / tempPrices[i][1] * 100;
            tempPriceChange.push([tempCurrPrices[i][0], percent.toFixed(2)]);
            tempPriceChangeSentence += tempCurrPrices[i][0] + ': ' + percent.toFixed(2) + ' ';
        }
        setPriceChange(tempPriceChangeSentence);
    }

    return (
        <div>
            <header>
                <h2>Dashboard</h2>
                <p>Username was: {userID}</p>
                <p>Password was: {userPass}</p>
                <p>To get your stock details: </p><button onClick={getData}>Click me</button>
                {stockData && <div>
                    <p>Stocks for {userID}: {stockData}</p>
                    <p>Past stock price: {stockPrice}</p>
                    <p>Current stock price: {currStockPrice}</p>
                    <p>Percent change: {priceChange}</p>
                </div>}
                <Header token={removeToken} />
            </header>
        </div>
    );
}