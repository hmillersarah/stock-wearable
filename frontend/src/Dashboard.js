import axios from 'axios';
import './Dashboard.css';
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import useToken from './useToken';

export default function Dashboard(props) {

    const navigate = useNavigate();

    const { token, removeToken, setToken } = useToken();
    const [stockData, setStockData] = useState(null);
    const [stockPrice, setStockPrice] = useState([]);
    const [currStockPrice, setCurrStockPrice] = useState([]);
    const [priceChange, setPriceChange] = useState();

    const prevData = useLocation();
    const userID = prevData.state.currUsername;
    const userPass = prevData.state.currPassword;

    const [newStock, setNewStock] = useState();
    const [newFrequency, setNewFrequency] = useState();

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
            console.log(res);
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
            });
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

    async function handleClick(event) {
        await axios({
            method: "POST",
            url: `/add-stock/${userID}/${newStock}/${newFrequency}`,
        }).then((response) => {
            const res = response.data;
            res.access_token && props.setToken(res.access_token);
            window.confirm('Stock has been added!');
            window.location.reload();
        }).catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
        event.preventDefault();
    }

    return (
        <div className="center">
            <header>
                <p>Username was: {userID}</p>
                <p>Password was: {userPass}</p>
                <h2>Stock Portfolio</h2>
                <p>To get your stock details: </p><button onClick={getData}>Click me</button>
                {stockData && <div>
                    <p>Stocks for {userID}: {stockData}</p>
                    <p>Past stock price: {stockPrice}</p>
                    <p>Current stock price: {currStockPrice}</p>
                    <p>Percent change: {priceChange}</p>
                </div>}
                <div>
                    <h2>Add Another Stock to Follow</h2>
                    <form>
                        <label>
                            <p>Stock Name (4 Letter Abbreviation)</p>
                            <input type="text" onChange={e => setNewStock(e.target.value)} />
                        </label>
                        <label>
                            <p>Frequency (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)</p>
                            <input type="text" onChange={e => setNewFrequency(e.target.value)} />
                        </label>
                        <div>
                            <button type="button" onClick={handleClick}>Add Stock</button>
                        </div>
                    </form>
                </div>
                <div>
                    <h2>Edit Stock Name or Frequency</h2>

                </div>
                <div>
                    <h2>Stop Following a Stock</h2>

                </div>
                <Header token={removeToken} />
            </header>
        </div>
    );
}