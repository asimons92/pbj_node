import { useState } from 'react';
import apiClient from '../services/apiClient';



// needs an onSubmit handler
// needs useStates for all form fields
// use the apiclient for POST request
// going to need "human in the loop" verification
// error handling for adding the note. 

export default function AddNote(){
    const [teacherNote, setTeacherNote] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleAddNote = async (e) => {
        e.preventDefault();
        setError('')
        
        // use apiclient to send POST to backend with teacherNote
        try {
            const response = await apiClient.post('records',teacherNote);
            console.log('Note submitted: ',teacherNote);
            console.log('Axios response: ',response)
        } catch (error) {
            console.log('Hit catch error block of AddNote component: handleAddNote');
            if (error.response){
                const errorMessage = error.response.data.error;
                setError(errorMessage);
            } else {
                const errorMessage = error.message;
                setError(errorMessage);
            }
        }

    }


    return(
        <div>
            <form onSubmit={ handleAddNote }> 
                <input
                    type="text"
                    value={ teacherNote }
                    onChange={ (e) => setTeacherNote(e.target.value) }
                />
                <button type='submit'>Submit</button>
            </form>
        </div>
    )
}