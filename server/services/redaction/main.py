from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, List, Any
from presidio_analyzer import AnalyzerEngine
import re

app = FastAPI()

class RedactRequest(BaseModel):
    text: str

class RedactResponse(BaseModel):
    redacted_text: str
    name_mapping: Dict[str, str]  # Maps alias (PERSON_1) to original name

def normalize_name(name: str) -> str:
    """Normalize name for comparison (lowercase, strip whitespace)"""
    return name.lower().strip()

def names_match(name1: str, name2: str) -> bool:
    """
    Check if two names likely refer to the same person.
    Handles cases like "Jimmy John" matching "Jimmy"
    """
    n1 = normalize_name(name1)
    n2 = normalize_name(name2)
    
    # Exact match
    if n1 == n2:
        return True
    
    # One name contains the other (e.g., "Jimmy" in "Jimmy John")
    if n1 in n2 or n2 in n1:
        return True
    
    # Check if they share a significant word (first or last name)
    words1 = set(n1.split())
    words2 = set(n2.split())
    if words1 & words2:  # Intersection - they share at least one word
        return True
    
    return False

def group_names_by_person(analyzer_results: List[Any], text: str) -> Dict[str, List[Any]]:
    """
    Group detected names that refer to the same person.
    Returns a dict mapping a canonical name to all its occurrences.
    """
    groups = {}
    
    for result in analyzer_results:
        detected_name = text[result.start:result.end]
        matched_group = None
        
        # Check if this name matches any existing group
        for canonical_name, group_results in groups.items():
            if names_match(detected_name, canonical_name):
                matched_group = canonical_name
                break
        
        # If no match, create a new group
        if matched_group is None:
            groups[detected_name] = [result]
        else:
            # Add to existing group
            groups[matched_group].append(result)
            # Update canonical name if this one is longer/more complete
            if len(detected_name) > len(matched_group):
                # Move all results to new canonical name
                groups[detected_name] = groups.pop(matched_group)
    
    return groups

def redact_with_aliases(text: str) -> RedactResponse:
    """
    Redact person names with unique aliases (PERSON_1, PERSON_2, etc.)
    Returns redacted text and mapping for de-anonymization.
    """
    analyzer = AnalyzerEngine()
    analyzer_results = analyzer.analyze(text=text, entities=["PERSON"], language='en')
    
    if not analyzer_results:
        return RedactResponse(redacted_text=text, name_mapping={})
    
    # Group names by person
    name_groups = group_names_by_person(analyzer_results, text)
    
    # Create alias mapping: canonical_name -> alias
    alias_counter = 1
    name_to_alias = {}
    alias_to_name = {}
    
    for canonical_name in sorted(name_groups.keys()):  # Sort for consistent ordering
        alias = f"PERSON_{alias_counter}"
        name_to_alias[canonical_name] = alias
        alias_to_name[alias] = canonical_name
        alias_counter += 1
    
    # Build list of all replacements, sorted by position (reverse order for safe replacement)
    all_replacements = []
    for canonical_name, results in name_groups.items():
        alias = name_to_alias[canonical_name]
        for result in results:
            all_replacements.append({
                'start': result.start,
                'end': result.end,
                'alias': alias,
                'original': text[result.start:result.end]
            })
    
    # Sort by start position in reverse order (so we can replace from end to start)
    all_replacements.sort(key=lambda x: x['start'], reverse=True)
    
    # Perform replacements
    redacted_text = text
    for replacement in all_replacements:
        redacted_text = (
            redacted_text[:replacement['start']] +
            replacement['alias'] +
            redacted_text[replacement['end']:]
        )
    
    return RedactResponse(
        redacted_text=redacted_text,
        name_mapping=alias_to_name
    )

def deanonymize_text(text: str, name_mapping: Dict[str, str]) -> str:
    """
    Replace aliases back with original names.
    """
    deanonymized = text
    for alias, original_name in name_mapping.items():
        deanonymized = deanonymized.replace(alias, original_name)
    return deanonymized

@app.post("/redact", response_model=RedactResponse)
async def redact_text(request: RedactRequest):
    """Redact person names with unique aliases"""
    return redact_with_aliases(request.text)

@app.post("/deanonymize")
async def deanonymize(request: RedactRequest, name_mapping: Dict[str, str]):
    """De-anonymize text using the name mapping"""
    return {"text": deanonymize_text(request.text, name_mapping)}

# Test endpoint for development
@app.get("/test")
async def test():
    test_text = "Jimmy John and Chucky Cheese were messing around playing games in class. Jimmy had already been warned and will be referred to admin. Chucky got a warning."
    result = redact_with_aliases(test_text)
    return {
        "original": test_text,
        "redacted": result.redacted_text,
        "mapping": result.name_mapping
    }