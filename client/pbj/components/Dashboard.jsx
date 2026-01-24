import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';


export default function Dashboard(){
    // useEffect to get all users records on load
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] =  useState(false);
    const [records, setRecords] = useState([]);
    const [expandedRecordId, setExpandedRecordId] = useState(null);
    const [page,setPage] = useState(1);
    const limit = 5;
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [totalPages, setTotalPages] = useState(1); 



    const loadRecords = async (page,limit) => {
        setErrorMessage('')
        setLoading(true);

        try {
            const response = await apiClient.get('/records/my', {
                params: {
                    page: page,
                    limit: limit
                }
            });
            setHasPrevPage(response.data.pagination.hasPrevPage);
            setHasNextPage(response.data.pagination.hasNextPage);
            setTotalPages(response.data.pagination.totalPages);
            const recordsData = response.data.records || response.data;
            setRecords(Array.isArray(recordsData) ? recordsData : []);
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Failed to load records');
            console.error('Error loading records:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRecords(page,limit);
    }, [page]);

    const toggleExpand = (recordId) => {
        setExpandedRecordId(expandedRecordId === recordId ? null : recordId);
    }

    const formatDate = (dateString) => { // maybe factor out for reuse
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    const getSeverityColor = (severity) => { //maybe factor out for reuse
        switch(severity) {
            case 'high': return '#dc3545';
            case 'moderate': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    }

    const handleNextPage = () => {
        setPage(prev => prev + 1)
    };

    const handlePrevPage = () => {
        setPage(prev => prev -1)
    }

    // use Recharts for dashboarding
    // conditionally render if GET response is not null

    return(
        <>
            <div className='dashboard-div'>
                <h1>Dashboard</h1>
                <p>This is where the datadashboard will live</p>
            </div>
            <div className='records-div'>
                {loading && <p>Loading records...</p>}
                {errorMessage && <p className='error-message'>{errorMessage}</p>}
                
                {!loading && !errorMessage && records.length === 0 && (
                    <p>No records found. Start by adding a note!</p>
                )}

                {!loading && !errorMessage && records.length > 0 && (
                    <div className='records-list'>
                        {records.map((record) => {
                            const isExpanded = expandedRecordId === record._id;
                            const behavior = record.behavior || {};
                            const context = record.context || {};
                            const intervention = record.intervention || {};
                            
                            return (
                                <div key={record._id} className='record-card'>
                                    <div 
                                        className='record-card-header'
                                        onClick={() => toggleExpand(record._id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className='record-card-main'>
                                            <h3>{record.student_name}</h3>
                                            <span className='record-date'>
                                                {formatDate(record.behavior_date || record.recording_timestamp)}
                                            </span>
                                        </div>
                                        <div className='record-card-badges'>
                                            <span 
                                                className='severity-badge'
                                                style={{ backgroundColor: getSeverityColor(behavior.severity) }}
                                            >
                                                {behavior.severity || 'N/A'}
                                            </span>
                                            <span className='category-badge'>
                                                {behavior.category || 'N/A'}
                                            </span>
                                            {behavior.is_positive && (
                                                <span className='positive-badge'>Positive</span>
                                            )}
                                            {behavior.needs_followup && (
                                                <span className='followup-badge'>Follow-up</span>
                                            )}
                                        </div>
                                        <span className='expand-icon'>
                                            {isExpanded ? '▼' : '▶'}
                                        </span>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div className='record-card-details'>
                                            <div className='detail-section'>
                                                <h4>Behavior Details</h4>
                                                <p><strong>Description:</strong> {behavior.description || 'N/A'}</p>
                                                {behavior.tags && behavior.tags.length > 0 && (
                                                    <p><strong>Tags:</strong> {behavior.tags.join(', ')}</p>
                                                )}
                                            </div>
                                            
                                            {(context.class_name || context.teacher || context.activity) && (
                                                <div className='detail-section'>
                                                    <h4>Context</h4>
                                                    {context.class_name && <p><strong>Class:</strong> {context.class_name}</p>}
                                                    {context.teacher && <p><strong>Teacher:</strong> {context.teacher}</p>}
                                                    {context.activity && <p><strong>Activity:</strong> {context.activity}</p>}
                                                    {context.location && <p><strong>Location:</strong> {context.location}</p>}
                                                </div>
                                            )}
                                            
                                            {intervention.status && intervention.status !== 'none' && (
                                                <div className='detail-section'>
                                                    <h4>Intervention</h4>
                                                    <p><strong>Status:</strong> {intervention.status}</p>
                                                    {intervention.type && <p><strong>Type:</strong> {intervention.type}</p>}
                                                    {intervention.tier && <p><strong>Tier:</strong> {intervention.tier}</p>}
                                                    {intervention.notes && <p><strong>Notes:</strong> {intervention.notes}</p>}
                                                </div>
                                            )}
                                            
                                            <div className='detail-section'>
                                                <h4>Original Note</h4>
                                                <p className='original-text'>{record.originalText}</p>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className='pagination-div'>
                
                <button className='page-button' onClick={handlePrevPage} disabled={!hasPrevPage}>
                    Prev
                </button>
                
                <span>Page {page} of {totalPages} </span>
                
                <button className='page-button' onClick={handleNextPage} disabled={!hasNextPage}>
                    Next
                </button>
            </div>
        </>
    )
}