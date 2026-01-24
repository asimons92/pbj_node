from fastapi import FastAPI
from pydantic import BaseModel
import spacy

nlp = spacy.load("en_core_web_sm")

app = FastAPI()

class redactRequest(BaseModel):
    text: str

@app.post("/redact")
async def redact_text(request: redactRequest):
    doc = nlp(request.text)
    redacted_text = request.text
    # Iterate through detected entities in reverse to keep indices correct
    for ent in reversed(doc.ents):
        if ent.label_ == "PERSON":
            redacted_text = redacted_text[:ent.start_char] + "[STUDENT_NAME]" + redacted_text[ent.end_char:]

            return {"original": request.text, "redacted": redacted_text}