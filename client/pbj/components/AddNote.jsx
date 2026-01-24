import { useState } from 'react';
import apiClient from '../services/apiClient';



// needs an onSubmit handler
// needs useStates for all form fields
// use the apiclient for POST request
// going to need "human in the loop" verification
// error handling for adding the note. 
// maybe add roster based fuzzy matching for name detection and redaction instead of the BERT NER model.

// Flow:
// User types a or pastes in a note (upload function later)
// This updates teacherNote state
// They click submit
// handleAddNote triggered
// HIL triggered, ask user to verify names someone for redaction (maybe even manually highlight)
// it tries a POST req to /records API route
// if it succeeds, show them the parsed note for another HIL catch
// fields of the parsed note should be editable and have a submit page
// another submit handler for final DB push? That will require some backend tweaks.
// success page / redirect

export default function AddNote(){
    const [teacherNote, setTeacherNote] = useState('');
    const [parsedNote, setParsedNote] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isParsing, setIsParsing] = useState(false);

    const formatDate = (dateString) => { // maybe factor out for reuse
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    const getSeverityColor = (severity) => {
        switch(severity) {
            case 'high': return '#dc3545';
            case 'moderate': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    }

    const handleAddNote = async (e) => {
        e.preventDefault();
        setErrorMessage('')
        
        // use apiclient to send POST to backend with teacherNote
        setIsParsing(true);
        try {
            
            const response = await apiClient.post('/records',{teacherNotes: teacherNote});
            console.log('Note submitted: ',teacherNote);
            console.log('Axios response: ',response);
            setParsedNote(response.data);
        } catch (error) {
            console.log('Hit catch error block of AddNote component: handleAddNote');
            if (error.response){
                setErrorMessage(error.response.data.error || 'Server error occured.');
            } else {
                setErrorMessage(error.message);
            }
        } finally {
            setIsParsing(false);
        }

    }


    return(
        <>
        <div className='note-submit-div'>
            <h1>Submit a Note</h1>
            <form className='note-submit-form' onSubmit={ handleAddNote }> 
                <input
                    className='note-submit-input'
                    type="text"
                    value={ teacherNote }
                    onChange={ (e) => setTeacherNote(e.target.value) }
                />
                <button className='submit-button' type='submit'>Submit</button>
            </form>
        </div>
        {isParsing && (
                <div className="parsing-overlay">
                    <div className="spinner"></div>
                    <p>Parsing notes with AI...</p>
                </div>
)}
        {parsedNote && 
            <div className='response-display'>
                <h1>Parsed Note</h1>

                <div className='records-list'>
                    {parsedNote.map((record) => {
                        const behavior = record.behavior || {};
                        const context = record.context || {};
                        const intervention = record.intervention || {};
                        // maybe make record cards themselves into components?
                        return(
                            <div key={record._id} className='record-card'>
                                <div
                                    className='record-card-header'
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className='record-card-main'>
                                        <h3>{record.student_name}</h3>
                                        <span className='record-date'>{formatDate(record.behavior_date || record.recording_timestamp)}</span>
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
                                </div>
                            </div>
                        )
                    })}
                </div>

            </div>
        }
        </>
    )
}