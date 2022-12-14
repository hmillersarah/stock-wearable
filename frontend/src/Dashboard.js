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
    TextField,
    Card,
    CardActions,
    CardContent
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

    const [connectivityStatus, setConnectivityStatus] = useState('Waiting on Connection');

    const columns = [
        { field: 'stock', headerName: 'Stock', width: 70 },
        { field: 'freq', headerName: 'Baseline Comparison Date', type: "number", width: 250 },
        { field: 'past', headerName: 'Past Price', type: "number", width: 130 },
        { field: 'curr', headerName: 'Current Price', type: "number", width: 130 },
        { field: 'percent', headerName: 'Stock Price Percent Change', type: "number", width: 250 },
        { field: 'percentChangeForAlert', headerName: 'Percent Change for Alert', type: "number", width: 250 },
        { field: 'checkInterval', headerName: 'Check Interval', type: "number", width: 200 },
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

    const [openDeleteStock, setOpenDeleteStock] = React.useState(false);
    const handleClickOpenDelete = () => {
        setOpenDeleteStock(true);
    };
    const handleCloseDelete = () => {
        setOpenDeleteStock(false);
    };

    const [openEditStockBaseline, setopenEditStockBaseline] = React.useState(false);
    const handleClickOpenEditStockBaseline = () => {
        setopenEditStockBaseline(true);
    };
    const handleCloseEditStockBaseline = () => {
        setopenEditStockBaseline(false);
    };

    const [openEditMinPercentChg, setopenEditMinPercentChg] = React.useState(false);
    const handleClickOpenEditMinPercentChg = () => {
        setopenEditMinPercentChg(true);
    };
    const handleCloseEditMinPercentChg = () => {
        setopenEditMinPercentChg(false);
    };

    const [openEditCheckInt, setopenEditCheckInt] = React.useState(false);
    const handleClickOpenEditCheckInt = () => {
        setopenEditCheckInt(true);
    };
    const handleCloseEditCheckInt = () => {
        setopenEditCheckInt(false);
    };


    // const columns = [
    //     {field: 'stock', headerName:'Stock', width: 70},
    //     {field: 'pastPrice', headerName: 'Past Price', type: "number", width: 130},
    //     {field: 'currPrice', headerName: 'Current Price', type: "number", width: 130},
    //     {field: 'percentChg', headerName: 'Percent Change', type: "number", width: 70},
    // ]

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
        // await axios({
        //     method: "GET",
        //     url: `/device-status/${userID}`,
        // }).then((response) => {
        //     const res = response.data;
        //     console.log(res);
        //     setConnectivityStatus(res);
        // });
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

    async function connectToDevice(event) {
        const first = await axios({
            method: "GET",
            url: `/device-connect/${userID}/requesting`,
        }).then((response) => {
            const res = response.data;
        }).catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
        await axios({
            method: "GET",
            url: `/device-status/${userID}`,
        }).then((response) => {
            const res = response.data;
            console.log(res);
            setConnectivityStatus(res);
        });
        event.preventDefault();
    }

    async function disconnectFromDevice(event) {
        await axios({
            method: "GET",
            url: `/device-connect/${userID}/disconnecting`,
        }).then((response) => {
            const res = response.data;
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
    }, [stockTableFinished, connectivityStatus]);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        No Stocks Left Behind
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
                    <Typography variant="h5">
                        Connection Status: {connectivityStatus}
                    </Typography>
                </Grid>
                <Grid
                    container
                    spacing={2}
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                >
                    <Grid item xs={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">
                                    Add a Stock
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Add a stock to your portfolio to get alerts for price changes
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button variant="outlined" onClick={handleClickOpenAdd}>
                                    Add Stock
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
                                            variant="standard"
                                            type="text"
                                            helperText="Official abbreviation only"
                                            onChange={e => setNewStock(e.target.value)}
                                        />
                                        <TextField
                                            margin='dense'
                                            id='pastPrice'
                                            label='Baseline Comparison Date'
                                            fullWidth
                                            variant="standard"
                                            type="text"
                                            helperText="(1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)"
                                            onChange={e => setNewFrequency(e.target.value)}
                                        />
                                        <TextField
                                            margin='dense'
                                            id='priceCheckInterval'
                                            label='Minimum Percent Change for Alerts'
                                            fullWidth
                                            variant="standard"
                                            type="text"
                                            helperText="Price change to warrant alert on wearable device"
                                            onChange={e => setNewAlert(e.target.value)}
                                        />
                                        <TextField
                                            margin='dense'
                                            id='priceCheckInterval'
                                            label='Price Change Check Interval'
                                            fullWidth
                                            variant="standard"
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
                            </CardActions>
                        </Card>
                    </Grid>

                    <Grid item xs={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">
                                    Unfollow a Stock
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Remove a stock from your portfolio to make room for new ones
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button variant="outlined" onClick={handleClickOpenDelete}>
                                    Delete
                                </Button>
                                <Dialog open={openDeleteStock} onClose={handleCloseDelete}>
                                    <DialogTitle>Unfollow Stock</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Please confirm the stock you would like to remove from your portfolio:
                                        </DialogContentText>
                                        <TextField
                                            margin='dense'
                                            id='deleteStock'
                                            label='Stock Name'
                                            fullWidth
                                            variant="standard"
                                            type="text"
                                            helperText="Type the stock you would like to unfollow"
                                            onChange={e => setStockToDelete(e.target.value)}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseDelete}>Cancel</Button>
                                        <Button onClick={handleDelete}>Unfollow</Button>
                                    </DialogActions>
                                </Dialog>
                            </CardActions>
                        </Card>
                    </Grid>

                    <Grid item xs={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">
                                    Edit Baseline Date
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Change the starting point for price comparison to indicate significant price change
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button variant="outlined" onClick={handleClickOpenEditStockBaseline}>
                                    Edit Baseline Date
                                </Button>
                                <Dialog open={openEditStockBaseline} onClose={handleCloseEditStockBaseline}>
                                    <DialogTitle>Edit Baseline Date</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Update the baseline date of your stock
                                        </DialogContentText>
                                        <TextField
                                            margin='dense'
                                            id='baselinePriceStock'
                                            label='Stock Name'
                                            fullWidth
                                            variant="standard"
                                            type="text"
                                            helperText="Target Stock for New Baseline Comparison Date"
                                            onChange={e => setStockToEdit(e.target.value)}
                                        />
                                        <TextField
                                            margin='dense'
                                            id='baselinePrice'
                                            label='New Baseline Comparison Date'
                                            fullWidth
                                            variant="standard"
                                            type="text"
                                            helperText="(1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)"
                                            onChange={e => setNewFreqAfterEdit(e.target.value)}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseEditStockBaseline}>Cancel</Button>
                                        <Button onClick={handleEditFreq}>Edit</Button>
                                    </DialogActions>
                                </Dialog>
                            </CardActions>
                        </Card>
                    </Grid>

                    <Grid item xs={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">
                                    Edit Stock Percent Change
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Change the starting point for price comparison to indicate significant price change
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button variant="outlined" onClick={handleClickOpenEditMinPercentChg}>
                                    Edit Stock Percent Change
                                </Button>
                                <Dialog open={openEditMinPercentChg} onClose={handleCloseEditMinPercentChg}>
                                    <DialogTitle>Edit Stock Percent Change</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Update minimum stock percent change needed to warrant alert
                                        </DialogContentText>
                                        <TextField
                                            margin='dense'
                                            id='minPercentChgStock'
                                            label='Stock Name'
                                            fullWidth
                                            variant="standard"
                                            type="text"
                                            helperText="Target Stock for New Percent Change"
                                            onChange={e => setStockToEdit(e.target.value)}
                                        />
                                        <TextField
                                            margin='dense'
                                            id='minPercentChg'
                                            label='New Minimum Percent Change'
                                            fullWidth
                                            variant="standard"
                                            type="text"
                                            onChange={e => setNewPercentChangeAfterEdit(e.target.value)}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseEditMinPercentChg}>Cancel</Button>
                                        <Button onClick={handleEditPercentChange}>Edit</Button>
                                    </DialogActions>
                                </Dialog>
                            </CardActions>
                        </Card>
                    </Grid>

                    <Grid item xs={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">
                                    Edit Check Interval
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Update seconds interval at which stock price changes are checked
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button variant="outlined" onClick={handleClickOpenEditCheckInt}>
                                    Edit Check Interval
                                </Button>
                                <Dialog open={openEditCheckInt} onClose={handleCloseEditCheckInt}>
                                    <DialogTitle>Edit Price Check Interval</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Update interval at which stock price changes are checked
                                        </DialogContentText>
                                        <TextField
                                            margin='dense'
                                            id='checkIntStock'
                                            label='Stock Name'
                                            fullWidth
                                            variant="standard"
                                            type="text"
                                            helperText="Target Stock for New Price Change Check Interval"
                                            onChange={e => setStockToEdit(e.target.value)}
                                        />
                                        <TextField
                                            margin='dense'
                                            id='newCheckInt'
                                            label='New Price Change Check Interval'
                                            fullWidth
                                            variant="standard"
                                            type="text"
                                            onChange={e => setNewAlertAfterEdit(e.target.value)}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseEditCheckInt}>Cancel</Button>
                                        <Button onClick={handleEditAlert}>Edit</Button>
                                    </DialogActions>
                                </Dialog>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item xs={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">
                                    Connect to Device
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Connect or disconnect from your wearable device
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button variant="outlined" onClick={connectToDevice}>
                                    Connect
                                </Button>
                                <Button variant="outlined" onClick={disconnectFromDevice}>
                                    Disconnect
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>

                {/* <div>
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
                    </div> */}

            </Container>
            <Container>
                <Box style={{ marginTop: 30, padding: 10, backgroundColor: "#1976d3" }}>
                    <Typography variant="h4" component="div" color="white" sx={{ flexGrow: 1, paddingTop: 5, paddingLeft: 5 }}>
                        Stock Portfolio
                    </Typography>
                    <Typography variant="body1" color="white" sx={{ paddingLeft: 5 }}>
                        Please wait a few seconds to view stock details.
                    </Typography>
                </Box>
                {/* <p>Username was: {userID}</p>
                    <p>Password was: {userPass}</p> */}
                {/* <p>Username was: {userID}</p>
                    <p>Password was: {userPass}</p>
                    <h2>Stock Portfolio</h2> */}
                {/* <p>Wait a few seconds to view stock details.</p> */}
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
                        <div style={{ height: 400, width: '100%', padding: 10, overflow: 'auto', backgroundColor: "white" }}>
                            <DataGrid
                                getRowId={(row) => row.stock}
                                rows={stockTable}
                                columns={columns}
                                pageSize={5}
                                rowsPerPageOptions={[5]}
                            // checkboxSelection
                            // onSelectionModelChange={(newSelection) => {
                            //     setSelectionModel(newSelection.selectionModel);
                            // }}
                            // selectionModel={selectionModel}
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
                {/* <div>
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
                    </div> */}
                {/* <div>
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
                    </div> */}
                {/* <div>
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
                    </div> */}
                {/* <div>
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
                    </div> */}
                {/* 
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
                    </div> */}
                {/* <Header token={removeToken} /> */}
            </Container>
        </Box>
    );
}