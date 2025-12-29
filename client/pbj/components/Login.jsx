import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import apiClient from '../services/apiClient';


export default function Login() {
    const { login } = useAuth();
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [error,setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('')
        

        const credentials = {
            email : email,
            password : password
        }

        try {
            console.log('Hit try block of handleSubmit in Login.jsx')

            const response = await apiClient.post('/auth/login', credentials);

            console.log(`API response for Login.jsx login was ${response}`)

            const token = response.data.token

            login(token)


        } catch (error) {
            console.log('hit catch error block of handleSubmit in Login.jsx')
            if (error.response) {
                const errorMessage = error.response.data.error;
                setError(errorMessage)
            } else {
                const errorMessage = error.message;
                setError(errorMessage)
            }
        }
    }


    return(
        <div>
            <form onSubmit={ handleSubmit }>
                <input
                    type="email"
                    value={ email }
                    onChange={ (e) => setEmail(e.target.value) }
                />
                <input
                    type="password"
                    value={ password }
                    onChange={ (e) => setPassword(e.target.value) }
                />
                <button type='submit'>Login</button>
            </form>
            { error && (
                <div>Login error: {error} </div>
            )}
        </div>
        
    )
}


