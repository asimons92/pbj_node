import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';


export default function Dashboard(){
    // useEffect to get all users records on load
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] =  useState(false);
    const [records, setRecords] = useState(null);

    const loadRecords = async () => {
        setErrorMessage('')
        setLoading(true);

        try {
            const response = await apiClient.get('/records/my');
            setRecords(response.data);
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Failed to load records');
            console.error('Error loading records:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRecords();
    }, []);

    // use Recharts for dashboarding
    // conditionally render if GET response is not null



    return(
        <>
            <div className='dashboard-div'>
            <h1>Dashboard</h1>
            <p>This is where the datadashboard will live</p>
            </div>

        </>

    )
}