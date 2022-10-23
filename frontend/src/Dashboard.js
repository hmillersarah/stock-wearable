import axios from 'axios';
import './Dashboard.css';
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import useToken from './useToken';
import Box from '@mui/material/Box';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Container, 
    Grid, 
    Dialog, 
    Button, 
    DialogTitle, 
    DialogContent, 
    DialogContentText, 
    DialogActions, 
    TextField 
} from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

export default function Dashboard(props) {

    const navigate = useNavigate();

    const { token, removeToken, setToken } = useToken();

    const [stockTable, setStockTable] = useState([]);
    const [buttonClicked, setButtonClicked] = useState(false);

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

    const [open, setOpen] = React.useState(false);

    const handleClickOpenAdd = () => {
        setOpen(true);
    };
    
    const handleCloseAdd = () => {
        setOpen(false);
    };

    // const columns = [
    //     {field: 'stock', headerName:'Stock', width: 70},
    //     {field: 'pastPrice', headerName: 'Past Price', type: "number", width: 130},
    //     {field: 'currPrice', headerName: 'Current Price', type: "number", width: 130},
    //     {field: 'percentChg', headerName: 'Percent Change', type: "number", width: 70},
    // ]

    async function getData() {
        setButtonClicked(true);
        let tempStockTable = [];
        const first = await axios({
            method: "GET",
            url: `/get-stocks/${userID}`,
        }).then((response) => {
            const res = response.data;
            res.access_token && props.setToken(res.access_token);
            for (let i = 0; i < res.length; i++) {
                tempStockTable.push({ "stock": res[i][0], "freq": res[i][1], "past": 0, "curr": 0, "percent": 0 });
            }
            console.log(tempStockTable);
            return res;
        });
        let tempPrices = [];
        let tempCurrPrices = [];
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
                const pastInd = tempStockTable.findIndex(object => { return object.stock === currStock; });
                tempStockTable[pastInd].past = res.toFixed(2);
            });
            const third = await axios({
                method: "GET",
                url: `/stock/${currStock}`,
            }).then((response) => {
                const res = response.data;
                res.access_token && props.setToken(res.access_token);
                tempCurrPrices.push([currStock, res.toFixed(2)]);
                const currInd = tempStockTable.findIndex(object => { return object.stock === currStock; });
                tempStockTable[currInd].curr = res.toFixed(2);
            });
        }
        let tempPriceChange = [];
        for (let i = 0; i < tempCurrPrices.length; i++) {
            let percent = (tempCurrPrices[i][1] - tempPrices[i][1]) / tempPrices[i][1] * 100;
            tempPriceChange.push([tempCurrPrices[i][0], percent.toFixed(2)]);

            const percentChangeInd = tempStockTable.findIndex(object => { return object.stock === tempCurrPrices[i][0]; });
            tempStockTable[percentChangeInd].percent = percent.toFixed(2);
            setStockTable(tempStockTable);
            // const fourth = await axios({
            //     method: "PUT",
            //     url: `/update-stock-price-percent-change/${userID}/${tempCurrPrices[i][0]}/${percent.toFixed(3)}`
            // });
        }
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
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Wearable Stock Portfolio
                    </Typography>
                    {/* <Button color="inherit">Login</Button> */}
                    <Header token={removeToken} />
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg">
                <Grid item xs={8} sx={{
                    padding: 5
                }}>
                    <Typography variant="h2">
                        Welcome, {userID}
                    </Typography>
                </Grid>
                <div>
                    <Button variant="outlined" onClick={handleClickOpenAdd}>
                        Open
                    </Button>
                    <Dialog open={open} onClose={handleCloseAdd}>
                        <DialogTitle>Subscribe to a Stock</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Add a new stock to your portfolio...
                            </DialogContentText>
                            <TextField
                                margin='dense'
                                id='stockName'
                                label='Stock Name'
                                fullWidth
                                variant="outlined"
                                type="text"
                                helperText="Official abbreviation only"
                                onChange={e => setNewStock(e.target.value)}
                            />
                            <TextField
                                margin='dense'
                                id='pastPrice'
                                label='Baseline Comparison Date'
                                fullWidth
                                variant="outlined"
                                type="text"
                                helperText="(1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)"
                                onChange={e => setNewFrequency(e.target.value)}
                            />
                            <TextField
                                margin='dense'
                                id='priceCheckInterval'
                                label='Minimum Percent Change for Alerts'
                                fullWidth
                                variant="outlined"
                                type="text"
                                helperText="Price change to warrant alert on wearable device"
                                onChange={e => setNewAlert(e.target.value)}
                            />
                            <TextField
                                margin='dense'
                                id='priceCheckInterval'
                                label='Price Change Check Interval'
                                fullWidth
                                variant="outlined"
                                type="text"
                                helperText="(seconds)"
                                onChange={e => setNewPercentChange(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={handleCloseAdd}>Cancel</Button>
                        <Button onClick={handleClick}>Subscribe</Button>
        </DialogActions>
                    </Dialog>
                </div>

            </Container>
            <div className="center">
                <header>
                    {/* <p>Username was: {userID}</p>
                    <p>Password was: {userPass}</p> */}
                    <p>Username was: {userID}</p>
                    <p>Password was: {userPass}</p>
                    <h2>Stock Portfolio</h2>
                    <p>To get your stock details: </p><button onClick={getData}>Click me</button>
                    {buttonClicked && <div>
                        <div>
                            <table class="center">
                                <thead>
                                    <tr>
                                        <th>Stock</th>
                                        <th>Baseline Comparison Date</th>
                                        <th>Past Price</th>
                                        <th>Current Price</th>
                                        <th>Percent Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stockTable.map(item => {
                                        return (
                                            <tr key={item.stock}>
                                                <td>{item.stock}</td>
                                                <td>{item.freq}</td>
                                                <td>{item.past}</td>
                                                <td>{item.curr}</td>
                                                <td>{item.percent}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>}
                    {/* <h2>Stock Portfolio</h2>
                    <p>To get your stock details: </p><button onClick={getData}>Click me</button>
                    {stockData && <div>
                        <p>Stocks for {userID}: {stockData}</p>
                        <p>Past stock price: {stockPrice}</p>
                        <p>Current stock price: {currStockPrice}</p>
                        <p>Percent change: {priceChange}</p>
                    </div>} */}
                    {/* <div>
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
                    </div> */}
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
                    <h2>Edit Stock Check Interval</h2>                        
                        <form>
                            <label>
                                <p>Stock Whose Check Interval You Want to Change</p>
                                <input type="text" onChange={e => setStockToEdit(e.target.value)} />
                            </label>
                            <label>
                                <p>New Check Interval</p>
                                <input type="text" onChange={e => setNewAlertAfterEdit(e.target.value)} />
                            </label>
                            <div>
                                <button type="button" onClick={handleEditAlert}>Edit Check Interval</button>
                            </div>
                        </form>
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
                    {/* <Header token={removeToken} /> */}
                </header >
            </div >
        </Box>
    );
}