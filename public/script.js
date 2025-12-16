const form = document.getElementById('note-form');
const noteInput = document.getElementById('note');
const resultContainer = document.getElementById('result-container');
const API_URL = '/api/notes/parse';



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
    parsedDataTable.innerHTML = html
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
        const record = await response.json();

        displayRecordsAsTable(record);
        noteInput.value = '';
    } catch (error) {
        console.error('Frontend Fetch Error:', error);
        parsedDataTable.innerHTML = `<p>Processing failed: ${error.message}</p>`;
    }

} )

