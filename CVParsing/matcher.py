import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient

# ----------------------------
# Helper functions
# ----------------------------

def clean_text(text):
    """Basic text cleaning."""
    text = text.lower()
    text = re.sub(r'[^a-z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def combine_cv_sections(cv):
    """Combine relevant text fields from the CV document."""
    personal = " ".join(cv.get("personal_info", {}).values())
    work = cv.get("work_experience", "")
    edu = cv.get("education_and_training", "")
    skills = cv.get("skills", "")
    return f"{personal} {work} {edu} {skills}"


# ----------------------------
# Connect to MongoDB
# ----------------------------

import json, sys

client = MongoClient("mongodb://localhost:27017/")
db = client["cv_database"]
collection = db["profiles"]

def compute_similarity(jd_text:str, cv_text:str)->float:
    vec = TfidfVectorizer(stop_words="english")
    tf = vec.fit_transform([jd_text, cv_text])
    return cosine_similarity(tf[0:1], tf[1:2])[0][0]

# ----------------------------
# Programmatic JSON mode
# ----------------------------
if not sys.stdin.isatty():
    try:
        payload = json.load(sys.stdin)
        jd = payload.get("jd", "")
        cv = payload.get("cv", "")
        print(compute_similarity(jd, cv))
    except Exception as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)
    sys.exit(0)

# ----------------------------
# Interactive CLI mode below
# ----------------------------

# Fetch all CVs from MongoDB
cvs = list(collection.find())

if not cvs:
    print("⚠️ No CVs found in the database. Run parser.py first.")
    exit(0)

# ----------------------------
# Get Job Description
# ----------------------------
print("📄 Please paste the job description below (press Enter twice when done):\n")
lines = []
while True:
    line = input()
    if not line.strip():
        break
    lines.append(line)
job_description = " ".join(lines)

if not job_description.strip():
    print("⚠️ No job description provided. Exiting.")
    exit(0)

clean_jd = clean_text(job_description)

# ----------------------------
# Compute Similarity
# ----------------------------

vectorizer = TfidfVectorizer()

for cv in cvs:
    cv_text = combine_cv_sections(cv)
    clean_cv = clean_text(cv_text)
    vectors = vectorizer.fit_transform([clean_jd, clean_cv])
    similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0] * 100

    print("\n--------------------------------------------")
    print(f"👤 Name: {cv.get('personal_info', {}).get('Name', 'N/A')}")
    print(f"📊 Match Score: {similarity:.2f}%")
    print(f"📧 Email: {cv.get('personal_info', {}).get('Email', 'N/A')}")
    print(f"📍 Address: {cv.get('personal_info', {}).get('Address', 'N/A')}")
    print("--------------------------------------------")

print("\n✅ Keyword matching completed successfully!")
