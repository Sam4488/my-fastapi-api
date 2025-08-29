from typing import List, Any, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import re

app = FastAPI(title="VIT BFHL API", version="1.0.0")

# CORS: in production, restrict to your frontend origin(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

# ---- Configuration (edit these to your info) ----
FULL_NAME = "john doe"   # must be lowercase per spec
DOB_DDMMYYYY = "17091999"
EMAIL = "john@xyz.com"
ROLL_NUMBER = "ABCD123"

class BFHLRequest(BaseModel):
    data: List[Any] = Field(..., description="Array of items: strings, numbers, or symbols")

_int_pattern = re.compile(r"^-?\d+$")
_alpha_pattern = re.compile(r"^[A-Za-z]+$")
_special_only_pattern = re.compile(r"^[^A-Za-z0-9]+$")

def is_int_str(s: str) -> bool:
    return bool(_int_pattern.match(s))

def is_alpha_str(s: str) -> bool:
    return bool(_alpha_pattern.match(s))

def is_special_only(s: str) -> bool:
    return bool(_special_only_pattern.match(s))

def build_user_id(full_name_lower: str, dob_ddmmyyyy: str) -> str:
    slug = "_".join(full_name_lower.strip().split())
    return f"{slug}_{dob_ddmmyyyy}"

def alternating_caps_reversed(letters: List[str]) -> str:
    # Reverse and apply alternating caps starting with UPPER
    out: List[str] = []
    for idx, ch in enumerate(reversed(letters)):
        out.append(ch.upper() if idx % 2 == 0 else ch.lower())
    return "".join(out)

@app.post("/bfhl")
def bfhl(payload: BFHLRequest) -> Dict[str, Any]:
    items = payload.data
    if not isinstance(items, list):
        raise HTTPException(status_code=400, detail="'data' must be an array")

    even_numbers: List[str] = []
    odd_numbers: List[str] = []
    alphabets: List[str] = []
    special_characters: List[str] = []
    sum_numbers = 0

    # Collect all letters from all tokens (for concat_string)
    all_alpha_chars: List[str] = []

    for item in items:
        token = str(item)

        # Collect letters for concat_string regardless of type category
        for ch in token:
            if ch.isalpha():
                all_alpha_chars.append(ch)

        if is_int_str(token):
            val = int(token)
            if val % 2 == 0:
                even_numbers.append(token)  # keep numbers as strings
            else:
                odd_numbers.append(token)
            sum_numbers += val
        elif is_alpha_str(token):
            alphabets.append(token.upper())
        elif is_special_only(token):
            special_characters.append(token)
        else:
            # Mixed tokens (alphanumeric, etc.) are ignored for number/alpha lists
            pass

    return {
        "is_success": True,
        "user_id": build_user_id(FULL_NAME, DOB_DDMMYYYY),
        "email": EMAIL,
        "roll_number": ROLL_NUMBER,
        "odd_numbers": odd_numbers,
        "even_numbers": even_numbers,
        "alphabets": alphabets,
        "special_characters": special_characters,
        "sum": str(sum_numbers),
        "concat_string": alternating_caps_reversed(all_alpha_chars),
    }
