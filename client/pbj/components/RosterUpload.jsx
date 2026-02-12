import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import apiClient from '../services/apiClient';

export default function RosterUpload() {
    const [uploadResult,setUploadResult] = useState(null);
    const onDrop =  useCallback( async (acceptedFiles) => {
        // Do something with the files
        const file = acceptedFiles[0];

        const formData = new FormData();
        formData.append('roster',file);

        const response = await apiClient.post('/students/upload',formData)

        setUploadResult(response.data);

      }, [])

      const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
    
      return (
        <>
        <div {...getRootProps()}>
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

        </div>
        </>
      )
    }
