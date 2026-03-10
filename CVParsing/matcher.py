import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient

# ----------------------------
# Common Technical Skills Database
# ----------------------------
TECH_SKILLS = {
    # Programming Languages
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 'golang',
    'rust', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'sql', 'bash',
    # Web Development
    'html', 'html5', 'css', 'css3', 'sass', 'less', 'react', 'reactjs', 'react.js',
    'angular', 'angularjs', 'vue', 'vuejs', 'vue.js', 'svelte', 'nextjs', 'next.js',
    'nuxt', 'gatsby', 'jquery', 'bootstrap', 'tailwind', 'tailwindcss', 'material-ui',
    # Backend & Frameworks
    'node', 'nodejs', 'node.js', 'express', 'expressjs', 'django', 'flask', 'fastapi',
    'spring', 'springboot', 'spring boot', 'rails', 'laravel', 'asp.net', '.net', 'dotnet',
    # Databases
    'mongodb', 'mysql', 'postgresql', 'postgres', 'sqlite', 'redis', 'elasticsearch',
    'cassandra', 'dynamodb', 'firebase', 'firestore', 'oracle', 'sql server', 'mariadb',
    # Cloud & DevOps
    'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes',
    'k8s', 'jenkins', 'terraform', 'ansible', 'ci/cd', 'cicd', 'git', 'github', 'gitlab',
    'bitbucket', 'linux', 'unix', 'nginx', 'apache',
    # Data Science & AI
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'scikit-learn',
    'pandas', 'numpy', 'nlp', 'natural language processing', 'computer vision', 'opencv',
    'data analysis', 'data science', 'big data', 'hadoop', 'spark', 'tableau', 'power bi',
    # Mobile Development
    'android', 'ios', 'react native', 'flutter', 'xamarin', 'swift', 'objective-c',
    # Tools & Methodologies
    'agile', 'scrum', 'kanban', 'jira', 'confluence', 'rest', 'restful', 'api', 'graphql',
    'microservices', 'oop', 'design patterns', 'tdd', 'unit testing', 'testing',
    # Soft Skills
    'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
    'project management', 'time management', 'presentation', 'critical thinking'
}

# ----------------------------
# Helper functions
# ----------------------------

def clean_text(text):
    """Basic text cleaning."""
    if not text:
        return ""
    text = str(text).lower()
    text = re.sub(r'[^a-z0-9\s\.\+\#]', ' ', text)  # Keep . + # for tech terms like C++, .NET
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def combine_cv_sections(cv):
    """Combine relevant text fields from the CV document."""
    personal = " ".join(str(v) for v in cv.get("personal_info", {}).values() if v)
    work = str(cv.get("work_experience", "") or "")
    edu = str(cv.get("education_and_training", "") or "")
    skills = str(cv.get("skills", "") or "")
    return f"{personal} {work} {edu} {skills}"


def extract_skills_from_text(text):
    """Extract recognized skills from text."""
    text_lower = clean_text(text)
    found_skills = set()
    
    for skill in TECH_SKILLS:
        # Use word boundary matching for better accuracy
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill)
    
    return found_skills


def compute_enhanced_similarity(jd_text: str, cv_text: str) -> float:
    """
    Enhanced similarity computation using multiple methods:
    1. TF-IDF cosine similarity (30% weight)
    2. Skills-based matching (50% weight)
    3. Keyword overlap bonus (20% weight)
    """
    # Clean texts
    jd_clean = clean_text(jd_text)
    cv_clean = clean_text(cv_text)
    
    # Handle empty texts - return 0 for empty CV (should not be saved)
    if not cv_clean:
        return 0.0
    
    # If JD is empty, we can't match meaningfully
    if not jd_clean:
        return 0.0
    
    # Very short texts get 0 - these shouldn't be saved as candidates
    if len(cv_clean) < 20:
        return 0.0
    
    # 1. TF-IDF Cosine Similarity (0-1 scale)
    try:
        vec = TfidfVectorizer(stop_words="english", min_df=1, max_df=0.95)
        tf = vec.fit_transform([jd_clean, cv_clean])
        tfidf_score = cosine_similarity(tf[0:1], tf[1:2])[0][0]
    except Exception:
        tfidf_score = 0.0
    
    # 2. Skills-based Matching (0-1 scale)
    jd_skills = extract_skills_from_text(jd_text)
    cv_skills = extract_skills_from_text(cv_text)
    
    if jd_skills:
        matched_skills = jd_skills.intersection(cv_skills)
        skill_score = len(matched_skills) / len(jd_skills)
    else:
        skill_score = 0.5  # Neutral if no skills identified in JD
    
    # 3. Keyword overlap (extract important words)
    jd_words = set(jd_clean.split())
    cv_words = set(cv_clean.split())
    
    # Filter to meaningful words (length > 3)
    jd_keywords = {w for w in jd_words if len(w) > 3}
    cv_keywords = {w for w in cv_words if len(w) > 3}
    
    if jd_keywords:
        keyword_overlap = len(jd_keywords.intersection(cv_keywords)) / len(jd_keywords)
    else:
        keyword_overlap = 0.0
    
    # Weighted combination
    final_score = (tfidf_score * 0.30) + (skill_score * 0.50) + (keyword_overlap * 0.20)
    
    # Scale up and ensure meaningful range (15-95%)
    scaled_score = min(0.95, max(0.15, final_score * 1.5 + 0.15))
    
    return scaled_score


# ----------------------------
# Connect to MongoDB
# ----------------------------

import json, sys

client = MongoClient("mongodb://localhost:27017/")
db = client["cv_database"]
collection = db["profiles"]

def compute_similarity(jd_text:str, cv_text:str)->float:
    """Use the enhanced similarity algorithm for better accuracy."""
    return compute_enhanced_similarity(jd_text, cv_text)

# ----------------------------
# Programmatic JSON mode
# ----------------------------
if not sys.stdin.isatty():
    try:
        payload = json.load(sys.stdin)
        jd = payload.get("jd", "")
        cv = payload.get("cv", "")
        score = compute_similarity(jd, cv)
        # Ensure we always output a valid number
        if score is None or not isinstance(score, (int, float)):
            score = 0.15  # Minimum fallback score
        print(float(score))
    except Exception as e:
        print(f"error: {e}", file=sys.stderr)
        print(0.15)  # Output minimum score on error instead of failing
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
