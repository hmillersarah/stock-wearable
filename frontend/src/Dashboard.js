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
    const [newPercentChange, setNewPercentChange] = useState();
    const [newAlert, setNewAlert] = useState();

    const [stockToEdit, setStockToEdit] = useState();
    const [newFreqAfterEdit, setNewFreqAfterEdit] = useState();
    const [newPercentChangeAfterEdit, setNewPercentChangeAfterEdit] = useState();
    const [newAlertAfterEdit, setNewAlertAfterEdit] = useState();

    const [stockToDelete, setStockToDelete] = useState();

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
            url: `/add-stock/${userID}/${newStock}/${newFrequency}/${newPercentChange}/${newAlert}`,
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

    async function handleEditFreq(event) {
        await axios({
            method: "PUT",
            url: `/update-stock/${userID}/${stockToEdit}/${newFreqAfterEdit}`,
        }).then((response) => {
            const res = response.data;
            res.access_token && props.setToken(res.access_token);
            window.confirm('Stock has been updated!');
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

    async function handleEditPercentChange(event) {
        await axios({
            method: "PUT",
            url: `/update-percent-change/${userID}/${stockToEdit}/${newPercentChangeAfterEdit}`,
        }).then((response) => {
            const res = response.data;
            res.access_token && props.setToken(res.access_token);
            window.confirm('Percent change has been updated!');
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

    async function handleEditAlert(event) {
        await axios({
            method: "PUT",
            url: `/update-alert/${userID}/${stockToEdit}/${newAlertAfterEdit}`,
        }).then((response) => {
            const res = response.data;
            res.access_token && props.setToken(res.access_token);
            window.confirm('Alert has been updated!');
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

    async function handleDelete(event) {
        await axios({
            method: "DELETE",
            url: `/delete-stock/${userID}/${stockToDelete}`,
        }).then((response) => {
            const res = response.data;
            res.access_token && props.setToken(res.access_token);
            window.confirm('Stock has been deleted!');
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
                            <p>Stock Name (Official Abbreviation)</p>
                            <input type="text" onChange={e => setNewStock(e.target.value)} />
                        </label>
                        <label>
                            <p>Baseline Comparison Date (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)</p>
                            <input type="text" onChange={e => setNewFrequency(e.target.value)} />
                        </label>
                        <label>
                            <p>Minimum Percent Change to Warrant an Alert</p>
                            <input type="text" onChange={e => setNewPercentChange(e.target.value)} />
                        </label>
                        <label>
                            <p>Alert Interval (seconds)</p>
                            <input type="text" onChange={e => setNewAlert(e.target.value)} />
                        </label>
                        <div>
                            <button type="button" onClick={handleClick}>Add Stock</button>
                        </div>
                    </form>
                </div>
                <div>
                    <h2>Edit Stock Baseline Comparison Date</h2>
                    <div>
                        <form>
                            <label>
                                <p>Stock Whose Baseline Comparison Date You Want to Change</p>
                                <input type="text" onChange={e => setStockToEdit(e.target.value)} />
                            </label>
                            <label>
                                <p>New Baseline Comparison Date</p>
                                <input type="text" onChange={e => setNewFreqAfterEdit(e.target.value)} />
                            </label>
                            <div>
                                <button type="button" onClick={handleEditFreq}>Edit Baseline Comparison Date</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div>
                    <h2>Edit Stock Minimum Percent Change to Warrant an Alert</h2>
                    <div>
                        <form>
                            <label>
                                <p>Stock Whose Minimum Percent Change to Warrant an Alert You Want to Change</p>
                                <input type="text" onChange={e => setStockToEdit(e.target.value)} />
                            </label>
                            <label>
                                <p>New Minimum Percent Change to Warrant an Alert</p>
                                <input type="text" onChange={e => setNewPercentChangeAfterEdit(e.target.value)} />
                            </label>
                            <div>
                                <button type="button" onClick={handleEditPercentChange}>Edit Percent Change to Warrant Alert</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div>
                    <h2>Edit Stock Alert Interval</h2>
                    <div>
                        <form>
                            <label>
                                <p>Stock Whose Alert Interval You Want to Change</p>
                                <input type="text" onChange={e => setStockToEdit(e.target.value)} />
                            </label>
                            <label>
                                <p>New Alert Interval</p>
                                <input type="text" onChange={e => setNewAlertAfterEdit(e.target.value)} />
                            </label>
                            <div>
                                <button type="button" onClick={handleEditAlert}>Edit Alert Interval</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div>
                    <h2>Stop Following a Stock</h2>
                    <div>
                        <form>
                            <label>
                                <p>Stock to Unfollow</p>
                                <input type="text" onChange={e => setStockToDelete(e.target.value)} />
                            </label>
                            <div>
                                <button type="button" onClick={handleDelete}>Unfollow Stock</button>
                            </div>
                        </form>
                    </div>
                </div>
                <Header token={removeToken} />
            </header >
        </div >
    );
}