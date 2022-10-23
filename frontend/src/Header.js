import axios from "axios";
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { Button } from '@mui/material';

function Header(props) {

    const navigate = useNavigate();

    function logMeOut() {
        axios({
            method: "POST",
            url: "/logout",
        })
            .then((response) => {
                props.token();
                navigate('/');
            }).catch((error) => {
                if (error.response) {
                    console.log(error.response)
                    console.log(error.response.status)
                    console.log(error.response.headers)
                }
            })
    }

    return (
        <header>
            <Button color="inherit" onClick={logMeOut}>Logout</Button>
            {/* <button onClick={logMeOut}>
                Logout
            </button> */}
        </header>
    )
}

export default Header;