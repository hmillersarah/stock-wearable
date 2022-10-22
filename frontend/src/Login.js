import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState();
    const [password, setPassword] = useState();

    async function handleClick() {
        const currUsername = username;
        const currPassword = password;
        // navigate.push({
        //     pathname: '/dashboard',
        //     state: { username: currUsername, password: currPassword }
        // });
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