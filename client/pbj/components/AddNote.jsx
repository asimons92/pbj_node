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

    const handleAddNote = async (e) => {
        e.preventDefault();
        setErrorMessage('')
        
        // use apiclient to send POST to backend with teacherNote
        setIsParsing(true);
        try {
            
            const response = await apiClient.post('/records',{teacherNotes: teacherNote});
            console.log('Note submitted: ',teacherNote);
            console.log('Axios response: ',response)
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
                <pre>
                    {JSON.stringify(parsedNote,null,2)}
                </pre>
            </div>
        }
        </>
    )
}