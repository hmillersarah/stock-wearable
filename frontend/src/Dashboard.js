import axios from 'axios';
import './Dashboard.css';
import React, { useState, useEffect } from 'react';
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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';

export default function Dashboard(props) {

    const navigate = useNavigate();

    const { token, removeToken, setToken } = useToken();

    const [selectionModel, setSelectionModel] = useState();
    const columns = [
        { field: 'stock', headerName: 'Stock', width: 70 },
        { field: 'freq', headerName: 'Baseline Comparison Date', type: "number", width: 300 },
        { field: 'past', headerName: 'Past Price', type: "number", width: 130 },
        { field: 'curr', headerName: 'Current Price', type: "number", width: 130 },
        { field: 'percent', headerName: 'Stock Price Percent Change', type: "number", width: 300 },
        { field: 'percentChangeForAlert', headerName: 'Percent Change for Alert', type: "number", width: 350 },
        { field: 'checkInterval', headerName: 'Check Interval', type: "number", width: 250 },
    ]

    const [stockTable, setStockTable] = useState([]);
    const [stockTableFinished, setStockTableFinished] = useState(false);

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

    async function getData() {
        let tempStockTable = [];
        const first = await axios({
            method: "GET",
            url: `/get-stocks/${userID}`,
        }).then((response) => {
            const res = response.data;
            res.access_token && props.setToken(res.access_token);
            for (let i = 0; i < res.length; i++) {
                tempStockTable.push({ "stock": res[i][0], "freq": res[i][1], "past": 0, "curr": 0, "percent": 0, "percentChangeForAlert": res[i][2], "checkInterval": res[i][3] });
            }
            console.log(res);
            //console.log(tempStockTable);
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
            setStockTableFinished(true);
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

    useEffect(() => {
        getData();
    }, [stockTableFinished]);

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
                    <h2>Stock Portfolio</h2>
                    <p>Wait a few seconds to view stock details.</p>
                    <div>
                        <div>
                            {/* <TableContainer component={Paper}>
                                <Table sx={{ width: 3 / 4 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Stock</TableCell>
                                            <TableCell>Baseline Comparison Date</TableCell>
                                            <TableCell>Past Price</TableCell>
                                            <TableCell>Current Price</TableCell>
                                            <TableCell>Percent Change</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stockTable.map((row) => (
                                            <TableRow
                                                key={row.stock}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    {row.stock}
                                                </TableCell>
                                                <TableCell>{row.freq}</TableCell>
                                                <TableCell>{row.past}</TableCell>
                                                <TableCell>{row.curr}</TableCell>
                                                <TableCell>{row.percent}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer> */}
                            <div style={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    getRowId={(row) => row.stock}
                                    rows={stockTable}
                                    columns={columns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5]}
                                    checkboxSelection
                                    onSelectionModelChange={(newSelection) => {
                                        setSelectionModel(newSelection.selectionModel);
                                    }}
                                    selectionModel={selectionModel}
                                />
                            </div>
                            {/* {selectionModel.map(val => <h1>{val}</h1>)} */}
                        </div>
                    </div>
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