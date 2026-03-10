from pdfminer.high_level import extract_text
from pdfminer.layout import LAParams
import re
from pymongo import MongoClient
from typing import Dict, Tuple, List
import sys, os, glob, json
import unicodedata 
import bson
import logging

# Mute pdfminer logs
logging.getLogger("pdfminer").setLevel(logging.ERROR)

# --- 1. TEXT CLEANING ---
def clean_text_block(s: str) -> str:
    s = unicodedata.normalize('NFKD', s)
    s = s.encode('ascii', 'ignore').decode('utf-8')
    s = re.sub(r'\r', '\n', s)
    s = re.sub(r'\n{2,}', '\n', s)
    s = s.strip()
    s = re.sub(r'[ \t]{2,}', ' ', s)
    return s

def extract_text_from_pdf(pdf_path: str) -> str:
    return extract_text(pdf_path, laparams=LAParams())

# --- 2. HELPERS ---
def find_heading_matches(text: str, patterns: List[str]) -> List[Tuple[int,int,str]]:
    matches = []
    for pat in patterns:
        for m in re.finditer(r'\b' + re.escape(pat) + r'\b', text, flags=re.IGNORECASE):
            before = text[max(0, m.start()-2):m.start()]
            after = text[m.end(): m.end()+2]
            snippet = text[m.start():m.end()]
            if before.strip() == "" or after.strip() == "" or after.startswith(":") or snippet.upper() == snippet:
                matches.append((m.start(), m.end(), m.group(0).lower()))
            else:
                matches.append((m.start(), m.end(), m.group(0).lower()))
    matches = sorted(matches, key=lambda x: x[0])
    return matches

def slice_section_between_headings(text: str, start_heading_variants: List[str], end_heading_variants: List[str]) -> str:
    start_re = re.compile(r'\b(?:' + '|'.join(re.escape(h) for h in start_heading_variants) + r')\b', re.I)
    m_start = start_re.search(text)
    if not m_start:
        return ""
    start_pos = m_start.end()
    end_re = re.compile(r'\b(?:' + '|'.join(re.escape(h) for h in end_heading_variants) + r')\b', re.I)
    m_end = end_re.search(text, start_pos)
    end_pos = m_end.start() if m_end else len(text)
    content = text[start_pos:end_pos].strip()
    return clean_text_block(content)

def remove_contact_and_urls(s: str) -> str:
    s = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '', s)
    s = re.sub(r'https?://\S+', '', s)
    s = re.sub(r'\b(Home|LinkedIn|Github|GitHub|Email|Phone|Telephone)\b[:\-]?\s*\S*', '', s, flags=re.I)
    s = re.sub(r'\n{2,}', '\n', s)
    return s.strip()

# --- 3. ADDRESS CLEANING LOGIC (FINAL FIX) ---
def final_clean_address(addr: str) -> str:
    if not addr: return ""
    
    # 1. Start-of-String Scrubber
    # Removes "Home", "Address", "Permanent Address" if they appear at the very start
    addr = re.sub(r'^(?:Home|Address|Residence|Location|Contact|Mobile|Ph|Res|Permanent|Current|Postal)\s*[:\-\.]?\s*', '', addr, flags=re.IGNORECASE)
    # Double check for "Address" again in case of "Permanent Address" residue
    addr = re.sub(r'^(?:Address)\s*[:\-\.]?\s*', '', addr, flags=re.IGNORECASE)

    # 2. Middle-of-String Scrubber (Added "Address" back here!)
    # Removes labels that might be stuck in the middle (e.g. "Email: ... Address: ...")
    garbage_labels = ["Phone", "Mobile", "Email", "Address", "Date of Birth", "DOB", "Nationality", "Gender", "Cnic"]
    for label in garbage_labels:
        addr = re.sub(fr'\b{label}\b\s*[:\-\.]?\s*', '', addr, flags=re.IGNORECASE)

    # 3. Trailing Label Remover (e.g. "...Pakistan (Home)")
    addr = re.sub(r'\s*\((?:Home|Res|Residence|Office|Mobile)\)\s*$', '', addr, flags=re.IGNORECASE)
    
    # 4. General Cleanup
    addr = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '', addr)
    addr = re.sub(r'\b(id|cnic|passport|no\.)\s*[:\-]?\s*[\d\w-]+\b', '', addr, flags=re.I)
    addr = re.sub(r'[^\w\s\-,\.#/]', ' ', addr)
    
    # 5. Deduplicate Words (Fixes "Islamabad ... Islamabad")
    words = addr.split()
    seen = set()
    clean_words = []
    for w in words:
        w_norm = re.sub(r'[^\w]', '', w.lower())
        if not w_norm: 
            clean_words.append(w)
            continue
        if w_norm not in seen:
            clean_words.append(w)
            # Only track meaningful words (len > 2 and not just numbers) to avoid deleting "Street 1 ... Street 2"
            if len(w_norm) > 2 and not w_norm.isdigit():
                seen.add(w_norm)
    
    return ' '.join(clean_words).strip()

# --- 4. PERSONAL INFO EXTRACTION ---
def extract_personal_info_from_top(text: str, first_heading_pos: int = None) -> Dict[str, str]:
    top = text if first_heading_pos is None else text[:first_heading_pos]
    top = clean_text_block(top)
    
    # --- A. Email ---
    email = ""
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', top)
    if email_match:
        email = email_match.group(0)
        top = top.replace(email, "")

    # --- B. Phone ---
    phone = ""
    phone_pattern = r'(?:\(?\+?\d{1,4}\)?[\s.-]?)?(?:\(?\d{3,5}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}'
    candidates = re.finditer(phone_pattern, top)
    for match in candidates:
        cand = match.group(0).strip()
        start_idx = match.start()
        context_start = max(0, start_idx - 30)
        preceding_text = top[context_start:start_idx].lower()
        if re.search(r'\b(id|cnic|passport|nid|identity|license|no\.)\b', preceding_text): continue
        digits_only = re.sub(r'\D', '', cand)
        if len(digits_only) < 10 or len(digits_only) > 15: continue
        phone = cand
        if '+' in cand or re.search(r'\b(mob|ph|cell|tel|call|whatsapp)\b', preceding_text): break
    if phone: top = top.replace(phone, "")

    # --- C. Name ---
    lines = [ln.strip() for ln in top.splitlines() if ln.strip()]
    name = "Unnamed Candidate" 
    # Only match these as WHOLE WORDS, not substrings
    forbidden_words = ["resume", "curriculum", "vitae", "cv", "bio", "profile", "summary", "objective", "about", "myself", "contact", "info", "information", "address", "location", "email", "phone", "mobile", "personal", "details", "page", "confidential", "applicant", "candidate", "application"]

    def is_likely_name(line):
        """Check if a line looks like a person's name."""
        clean_line = ' '.join(line.split())
        words = clean_line.split()
        
        # Must have 1-5 words
        if not (1 <= len(words) <= 5):
            return False
        
        # Skip if contains forbidden words (as WHOLE WORDS only, not substrings)
        line_lower = line.lower()
        for bad in forbidden_words:
            # Use word boundary matching to avoid false positives like "Ahmed" matching "me"
            if re.search(r'\b' + re.escape(bad) + r'\b', line_lower):
                return False
        
        # Skip if contains numbers, emails, URLs
        if re.search(r'(@|www\.|http|\.com|\.org|\d{3,})', line, flags=re.I):
            return False
        
        # Skip if too short (likely abbreviations) or too long
        if len(clean_line) < 3 or len(clean_line) > 50:
            return False
        
        # Check various name patterns
        # Pattern 1: Title Case (John Smith, Mary Jane Watson)
        is_title_case = all(
            re.match(r'^[A-Z][a-z]+\.?$', w) or  # Normal word: John, Smith
            re.match(r'^[A-Z]\.$', w) or          # Initial: J.
            re.match(r'^[A-Z][a-z]*-[A-Z][a-z]+$', w) or  # Hyphenated: Mary-Jane
            re.match(r"^[A-Z][a-z]+'[a-z]+$", w)  # Apostrophe: O'Brien
            for w in words
        )
        
        # Pattern 2: ALL CAPS (JOHN SMITH)
        is_all_caps = all(
            re.match(r'^[A-Z]+\.?$', w) or        # JOHN, SMITH
            re.match(r'^[A-Z]\.$', w) or          # J.
            re.match(r'^[A-Z]+-[A-Z]+$', w)       # MARY-JANE
            for w in words
        ) and len(clean_line) > 3  # Avoid matching single letters
        
        # Pattern 3: Mixed case common in some regions (McDonald, DeVito)
        is_mixed = all(
            re.match(r'^[A-Z][a-zA-Z\'\-\.]+$', w)
            for w in words
        ) and any(c.isupper() for c in clean_line[1:])  # Has uppercase after first char
        
        # Pattern 4: Single name (common in some cultures)
        is_single_name = len(words) == 1 and re.match(r'^[A-Z][a-z]{2,15}$', words[0])
        
        return is_title_case or is_all_caps or is_mixed or is_single_name

    # Try to find name in first 15 lines
    for ln in lines[:15]:
        if is_likely_name(ln):
            name = ' '.join(ln.split())
            break
    
    # If still unnamed, try more aggressive search - look for "Name:" label
    if name == "Unnamed Candidate":
        for ln in lines[:20]:
            match = re.match(r'^(?:Name|Full Name|Applicant Name)\s*[:\-]?\s*(.+)$', ln, re.I)
            if match:
                potential_name = match.group(1).strip()
                if len(potential_name) > 2 and not re.search(r'\d{3,}|@', potential_name):
                    name = potential_name
                    break
                
    # --- D. Address (UPDATED) ---
    address = ""
    addr_indicators = ["address", "location", "residence", "home", "domicile", "postal"]
    
    # Loop through lines to find the address start
    for i, line in enumerate(lines):
        if address: break 
        
        # --- SKIP PLACE OF BIRTH ---
        if re.match(r'^(?:Place of Birth|Birth Place|POB|Date of Birth|DOB)', line, re.I):
            continue

        is_addr_start = False
        
        # Check Strategy 1: Has Indicator "Address: ..."
        for ind in addr_indicators:
            if re.search(fr'\b{ind}\b', line, re.I): # Changed from match (start) to search (anywhere)
                # Ensure it's not just "Email Address"
                if ind.lower() == "address" and "email" in line.lower():
                    continue
                is_addr_start = True
                break
        
        # Check Strategy 2: Looks like an address without indicator
        if not is_addr_start:
             if line == name: continue
             if re.search(r'\b(cnic|id|passport|gender|marital|religion)\b', line, re.I): continue
             if any(w in line.lower() for w in ["resume", "curriculum", "vitae", "summary", "profile", "about"]): continue
             
             if re.search(r'\d+.*(?:street|st\.|road|rd\.|ave|avenue|blvd|lane|house|sector|block)', line, re.I):
                 is_addr_start = True
             elif re.search(r'\b[A-Z]-\d{1,2}/\d{1}\b', line):
                 is_addr_start = True
        
        # --- MERGING LOGIC ---
        if is_addr_start:
            current_addr = line
            
            # Check NEXT line for City/Country/Zip to merge
            if i + 1 < len(lines):
                next_line = lines[i+1]
                if re.search(r'\b(pakistan|islamabad|rawalpindi|lahore|karachi|peshawar|quetta|multan|faisalabad)\b', next_line, re.I) or re.search(r'\b\d{5}\b', next_line):
                    current_addr += " " + next_line
            
            address = current_addr
            break 

    address = final_clean_address(address)

    return {
        "Name": name.strip(),
        "Email": email.strip(),
        "Phone": phone.strip(),
        "Address": address.strip()
    }

# --- 5. SKILLS & MAIN LOGIC ---
def extract_skills_clean(text: str) -> str:
    anchors = ["language skills", "skills", "personal skills", "competences", "digital skills"]
    for anchor in anchors:
        block = slice_section_between_headings(text, [anchor], [
            "work experience", "professional experience",
            "education and training", "education",
            "additional information", "projects", "references", "publications", "certificates"
        ])
        if not block: continue
        block = remove_contact_and_urls(block)
        block = block.strip()
        if not block: continue
        
        first_100 = block[:200].lower()
        if re.search(r'\b(i |i\'m|i am|aim to|objective|about myself)\b', first_100):
            m = re.search(r'(languages?\s*[:\-]?)', block, flags=re.I)
            if m:
                start = m.start()
                block = block[start:]
            else:
                tech_keywords = ['python','java','react','javascript','c++','sql','aws','django','flask','node','express','react.js','tailwind','typescript','mongodb','postgres']
                lines = [ln.strip() for ln in block.splitlines() if ln.strip()]
                idx = None
                for i,ln in enumerate(lines):
                    ln_low = ln.lower()
                    if any(k in ln_low for k in tech_keywords) or ln.count(',')>=2 or '/' in ln:
                        idx = i
                        break
                if idx is not None:
                    block = "\n".join(lines[idx:])
        
        block = re.sub(r'(work experience|education and training|education|language skills|skills|competences)', '', block, flags=re.I)
        block = re.sub(r'\n{2,}', '\n', block).strip()
        return block
    return ""

def parse_europass_pdf(pdf_path: str) -> Dict:
    raw_text = extract_text_from_pdf(pdf_path)
    text = clean_text_block(raw_text)
    heading_candidates = [
        "work experience", "professional experience",
        "education and training", "education",
        "skills", "competences", "personal skills",
        "language skills", "languages"
    ]
    matches = find_heading_matches(text, heading_candidates)
    first_heading_pos = matches[0][0] if matches else None
    
    personal = extract_personal_info_from_top(text, first_heading_pos)
    work = slice_section_between_headings(text, ["work experience", "professional experience"], ["education and training", "education", "skills", "competences", "language skills", "languages"])
    work = remove_contact_and_urls(work)
    education = slice_section_between_headings(text, ["education and training", "education"], ["skills", "competences", "language skills", "languages", "work experience", "professional experience"])
    education = remove_contact_and_urls(education)
    skills = extract_skills_clean(text)
    skills = remove_contact_and_urls(skills)
    
    result = {"personal_info": personal, "work_experience": work, "education_and_training": education, "skills": skills}
    return result

def save_to_mongodb(doc: Dict):
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["cv_database"]
        collection = db["profiles"]
        collection.insert_one(doc)
        sys.stderr.write("✅ Saved to MongoDB.\n")
    except Exception as e:
        sys.stderr.write(f"❌ MongoDB Error: {e}\n")

def process_single_cv(pdf_path: str, cv_number: int = 1):
    sys.stderr.write(f"\n{'='*60}\nPROCESSING CV #{cv_number}: {os.path.basename(pdf_path)}\n{'='*60}\n")
    raw_text = extract_text_from_pdf(pdf_path)
    if not raw_text.strip():
        sys.stderr.write("❌ No text extracted.\n")
        return
    parsed = parse_europass_pdf(pdf_path)
    sys.stderr.write("\n--- PERSONAL INFO ---\n")
    sys.stderr.write(str(parsed["personal_info"]) + "\n")
    save_to_mongodb(parsed)
    return parsed

def process_multiple_cvs(pdf_paths: List[str]):
    results = []
    for i, path in enumerate(pdf_paths, 1):
        if not os.path.isfile(path):
            sys.stderr.write(f"❌ File not found: {path}\n")
            continue
        res = process_single_cv(path, i)
        if res: results.append(res)
    return results

if __name__ == "__main__":
    input_paths = sys.argv[1:]
    if not input_paths: input_paths = sorted(glob.glob("*.pdf"))
    if not input_paths:
        sys.stderr.write("No PDF files supplied or found.\n")
        sys.exit(0)
    results = process_multiple_cvs(input_paths)
    def safe_json(obj):
        if isinstance(obj, list): return [safe_json(i) for i in obj]
        elif isinstance(obj, dict): return {k: safe_json(v) for k, v in obj.items()}
        elif isinstance(obj, bson.ObjectId): return str(obj)
        else: return obj
    sys.stderr.write("\n✅ Finished processing all CVs.\n")
    json_output = json.dumps(safe_json(results), ensure_ascii=False)
    sys.stdout.write(json_output)
    sys.stdout.flush()