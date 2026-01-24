# Redaction Service

This service redacts person names from text before sending to LLM APIs for FERPA compliance, then de-anonymizes the results before database storage.

## How It Works

1. **Name Detection**: Uses Presidio Analyzer to detect person names in text
2. **Name Grouping**: Intelligently groups names that refer to the same person (e.g., "Jimmy John" and "Jimmy")
3. **Aliasing**: Assigns unique aliases (PERSON_1, PERSON_2, etc.) to each unique person
4. **Redaction**: Replaces all occurrences of a person's name with their unique alias
5. **De-anonymization**: After LLM processing, aliases are replaced back with original names

## Running the Service

The redaction service is a FastAPI application. To run it:

```bash
cd server/services/redaction
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Or if you prefer using Python directly:
```bash
python -m uvicorn main:app --reload --port 8000
```

## Configuration

Set the `REDACTION_SERVICE_URL` environment variable in your `.env` file:
```
REDACTION_SERVICE_URL=http://localhost:8000
```

If not set, it defaults to `http://localhost:8000`.

## API Endpoints

### POST /redact
Redacts person names in text.

**Request:**
```json
{
  "text": "Jimmy John and Chucky Cheese were messing around."
}
```

**Response:**
```json
{
  "redacted_text": "PERSON_1 and PERSON_2 were messing around.",
  "name_mapping": {
    "PERSON_1": "Jimmy John",
    "PERSON_2": "Chucky Cheese"
  }
}
```

### POST /deanonymize
De-anonymizes text using a name mapping (for testing).

### GET /test
Test endpoint that demonstrates the redaction on sample text.

## Integration

The service is automatically called by the Node.js backend before sending text to the LLM, and results are de-anonymized before saving to the database. If the redaction service is unavailable, the system will log a warning and continue without redaction (graceful degradation).

## Name Matching Logic

The service uses intelligent name matching to group variations:
- Exact matches (case-insensitive)
- Substring matches (e.g., "Jimmy" matches "Jimmy John")
- Shared word matches (e.g., names sharing a first or last name)

This ensures that "Jimmy John" and "Jimmy" are recognized as the same person and get the same alias.

