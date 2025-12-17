const form = document.getElementById('note-form');
const noteInput = document.getElementById('note');
const resultContainer = document.getElementById('result-container');
const API_URL = '/api/notes/parse';
const GET_RECORDS_URL = '/api/records'
const recordsList = document.getElementById('records-list');


function displayRecordsAsTable(record) {
    let parsedDataTable = document.querySelector('.parsed-data-table');
    if (!parsedDataTable) {
        // If element doesn't exist, create it instead of replacing the container
        parsedDataTable = document.createElement('div');
        parsedDataTable.className = 'parsed-data-table';
        resultContainer.appendChild(parsedDataTable);
    }
    
    let html = `
        <table class="parsed-record-table">
            <thead>
                <tr><th colspan="2">Behavior Record: ${record.student_name}</th></tr>
            </thead>
            <tbody>
                <tr><td>Student Name</td><td>${record.student_name}</td></tr>
                <tr><td>Behavior Date</td><td>${new Date(record.behavior_date || record.recording_timestamp).toLocaleDateString()}</td></tr>
                <tr><td>Original Note</td><td>${record.originalText.substring(0, 100)}...</td></tr>
            </tbody>
        </table>
    `
    const behavior = record.behavior || {};
    html += `
        <table class="behavior-details-table">
            <thead>
                <tr><th colspan="2">Behavior Details</th></tr>
            </thead>
            <tbody>
                <tr><td>Category</td><td><strong>${behavior.category}</strong></td></tr>
                <tr><td>Severity</td><td>${behavior.severity}</td></tr>
                <tr><td>Positive?</td><td>${behavior.is_positive ? 'Yes' : 'No'}</td></tr>
                <tr><td>Follow-up Needed?</td><td>${behavior.needs_followup ? 'YES' : 'No'}</td></tr>
                <tr><td>Description</td><td>${behavior.description}</td></tr>
                <tr><td>Tags</td><td>${behavior.tags ? behavior.tags.join(', ') : 'N/A'}</td></tr>
            </tbody>
        </table>
    `;
    parsedDataTable.innerHTML += html;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    let parsedDataTable = document.querySelector('.parsed-data-table');
    if (!parsedDataTable) {
        // Ensure the element always exists
        parsedDataTable = document.createElement('div');
        parsedDataTable.className = 'parsed-data-table';
        resultContainer.appendChild(parsedDataTable);
    }
    parsedDataTable.innerHTML = '<p>Processing note...please wait.</p>';
    const teacherNotes = noteInput.value.trim();
    if (!teacherNotes) {
        parsedDataTable.innerHTML = '<p>Error: Please enter a note!</p>';
        return;
    }
    try {
        const response = await fetch(API_URL,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ teacherNotes })
        });
        if (!response.ok) {
            // Throw an error that the catch block will handle
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
        }

        const response_array = await response.json();
        parsedDataTable.innerHTML = ''; // Clear the "Processing..." message
        response_array.forEach( (record) => {
            displayRecordsAsTable(record)
         });
        noteInput.value = '';
    } catch (error) {
        console.error('Frontend Fetch Error:', error);
        parsedDataTable.innerHTML = `<p>Processing failed: ${error.message}</p>`;
    }
});

function displayHistoricalRecordsAsTable(record) {

    if (!recordsList) {
        // If element doesn't exist, create it instead of replacing the container
        recordsList = document.createElement('div');
        recordsList.className = 'records-list';
        recordsList.appendChild(recordsList);
    }
    
    const behavior = record.behavior || {};
    let html = `
        <div class="record-card">
            <div class="card-header">
                <h3>${record.student_name}</h3>
                <span class="card-date">${new Date(record.behavior_date || record.recording_timestamp).toLocaleDateString()}</span>
            </div>
            <div class="card-body">
                <div class="card-field">
                    <span class="field-label">Category:</span>
                    <span class="field-value">${behavior.category || 'N/A'}</span>
                </div>
                <div class="card-field">
                    <span class="field-label">Severity:</span>
                    <span class="field-value">${behavior.severity || 'N/A'}</span>
                </div>
                <div class="card-field">
                    <span class="field-label">Positive?</span>
                    <span class="field-value">${behavior.is_positive ? 'Yes' : 'No'}</span>
                </div>
                <div class="card-field">
                    <span class="field-label">Follow-up Needed?</span>
                    <span class="field-value">${behavior.needs_followup ? 'Yes' : 'No'}</span>
                </div>
                <div class="card-field">
                    <span class="field-label">Description:</span>
                    <span class="field-value">${behavior.description || 'N/A'}</span>
                </div>
                <div class="card-field">
                    <span class="field-label">Tags:</span>
                    <span class="field-value">${behavior.tags ? behavior.tags.join(', ') : 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
    recordsList.innerHTML += html;
}

async function loadHistoricalRecords() {
    try{
        const response = await fetch(GET_RECORDS_URL,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
                if (!response.ok) {
            // Throw an error that the catch block will handle
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
        }
        const parsed_records = await response.json();
        recordsList.innerHTML = '';
        parsed_records.forEach( (record) => {
            displayHistoricalRecordsAsTable(record);
        })
    } catch (error) {
        console.error('Error fetching historical records:', error);
        recordsList.innerHTML = `<p> Record fetch failed: ${error.message}</p>`;
    }

}

loadHistoricalRecords();