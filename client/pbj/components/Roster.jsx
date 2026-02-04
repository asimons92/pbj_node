import { useState } from "react"
import apiClient from '../services/apiClient';

export default function Roster() {

    const [students, getStudents] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] =  useState(false);


    const loadStudents = async (page,limit) => {
        setErrorMessage('');
        setLoading(true);
        try {
            const response = await apiClient.get('/students/my',
                params: {
                    page: page,
                    limit: limit
                }
            )
        } catch (error) {
            
        }
    }

    return (
        <>
        <h1>This is where the Roster logic will live.</h1>
        </>
    )
}