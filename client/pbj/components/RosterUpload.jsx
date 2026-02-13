import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import apiClient from '../services/apiClient';

export default function RosterUpload() {
    const [uploadResult,setUploadResult] = useState(null);
    const [error, setError] = useState();
    const onDrop =  useCallback( async (acceptedFiles) => {
        // Do something with the files
        const file = acceptedFiles[0];

        const formData = new FormData();
        formData.append('roster',file);

        try {
            setError(null);
            const response = await apiClient.post('/students/upload',formData)
            setUploadResult(response.data);
        } catch (error) {
            setError(error.response?.data?.error || 'Upload failed');
            setUploadResult(null);
        }
      }, [])

      const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
    
      return (
        <>
        <div className='dropzone-div' {...getRootProps()}>
          <input {...getInputProps()} />
          {
            isDragActive ?
              <p>Drop the files here ...</p> :
              <p>Drag 'n' drop some files here, or click to select files</p>
          }
         {uploadResult && (
            <>
                <p>Response:</p>
                <p>Inserted: { uploadResult.inserted }</p>
                <p>Updated: { uploadResult.updated }</p>
                <p>Failed: {uploadResult.failed} </p>


            </>

         )} 
        {error && (
            <p className='error'>Error: { error }</p>
        )}
        </div>
        </>
      )
    }
