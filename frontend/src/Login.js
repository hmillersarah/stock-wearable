import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

export default function Login(props) {

    const navigate = useNavigate();

    const [username, setUsername] = useState();
    const [password, setPassword] = useState();

    async function handleClick(event) {
        const currUsername = username;
        const currPassword = password;
        // navigate.push({
        //     pathname: '/dashboard',
        //     state: { username: currUsername, password: currPassword }
        // });
        axios({
            method: "POST",
            url: "/token",
            data: {
                email: currUsername,
                password: currPassword
            }
        })
            .then((response) => {
                props.setToken(response.data.access_token)
            }).catch((error) => {
                if (error.response) {
                    console.log(error.response)
                    console.log(error.response.status)
                    console.log(error.response.headers)
                }
            })
        navigate('/dashboard', { state: { currUsername, currPassword } });
    }

    return (
        <div class="login-wrapper">
            <h1>Please Log In</h1>
            <form>
                <label>
                    <p>Username</p>
                    <input type="text" onChange={e => setUsername(e.target.value)} />
                </label>
                <label>
                    <p>Password</p>
                    <input type="password" onChange={e => setPassword(e.target.value)} />
                </label>
                <div>
                    <button type="submit" onClick={handleClick}>Submit</button>
                </div>
            </form>
        </div>
    )
}