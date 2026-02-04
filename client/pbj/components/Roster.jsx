import { useState, useEffect } from "react"
import apiClient from '../services/apiClient';

export default function Roster() {

    const [students, setStudents] = useState([]);
    const [displayedStudents, setDisplayedStudents] = useState([]); // same logic as Dashboard, prevent flicker on loading.
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] =  useState(false);
    const [page, setPage] = useState(1);
    const limit = 5;
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [totalPages, setTotalPages] = useState(1);


    const loadStudents = async (page,limit) => {
        setErrorMessage('');
        setLoading(true);
        try {
            const response = await apiClient.get('/students/my',{
                params: {
                    page: page,
                    limit: limit
                }
        });

        setHasPrevPage(response.data.pagination.hasPrevPage);
        setHasNextPage(response.data.pagination.hasNextPage);
        setTotalPages(response.data.pagination.totalPages);
        const studentsData = response.data.students || response.data;
        const newStudents = Array.isArray(studentsData) ? studentsData : [];

        setStudents(newStudents);
        setLoading(false);


        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Failed to load students');
            console.error('Error loading students:', error);
            setLoading(false);
        }
    }

    useEffect(() => {
        loadStudents(page,limit);
    }, [page]);

    useEffect(() => {
        if (!loading && students.length >= 0) {
            setDisplayedStudents(students);
        }
    }, [loading, students]);

    const handleNextPage = () => {
        setPage(prev => prev + 1)
    };

    const handlePrevPage = () => {
        setPage(prev => prev -1)
    }

    return (
        <>
        <h1>This is where the Roster logic will live.</h1>
        </>
    )
}