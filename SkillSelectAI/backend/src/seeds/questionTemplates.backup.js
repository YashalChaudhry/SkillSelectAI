export const COMPREHENSIVE_TEMPLATES = [
  // ===== MACHINE LEARNING ENGINEERING =====
  { text: "Explain {concept} in {technology}", type: "Conceptual", difficulty: "Easy", category: "Machine Learning Engineering", skill: "ML" },
  { text: "How would you implement {feature} using {technology}?", type: "Technical", difficulty: "Medium", category: "Machine Learning Engineering", skill: "ML" },
  { text: "What are the best practices for {concept} in {technology}?", type: "Behavioral", difficulty: "Medium", category: "Machine Learning Engineering", skill: "ML" },
  { text: "Describe how you {action} {concept} in {technology}", type: "Scenario", difficulty: "Hard", category: "Machine Learning Engineering", skill: "ML" },
  { text: "Compare {concept1} vs {concept2} in {technology}", type: "Conceptual", difficulty: "Hard", category: "Machine Learning Engineering", skill: "ML" },
  { text: "What challenges did you face with {concept}?", type: "Behavioral", difficulty: "Easy", category: "Machine Learning Engineering", skill: "ML" },

  // ===== MOBILE DEVELOPMENT =====
  { text: "Explain {concept} in {technology}", type: "Conceptual", difficulty: "Easy", category: "Mobile Development", skill: "Mobile" },
  { text: "How would you build {feature} for {technology}?", type: "Technical", difficulty: "Medium", category: "Mobile Development", skill: "Mobile" },
  { text: "What are best practices for {concept} in mobile apps?", type: "Behavioral", difficulty: "Medium", category: "Mobile Development", skill: "Mobile" },
  { text: "Describe a {scenario} you handled in a mobile app", type: "Scenario", difficulty: "Hard", category: "Mobile Development", skill: "Mobile" },
  { text: "Compare {concept1} vs {concept2} for mobile development", type: "Conceptual", difficulty: "Hard", category: "Mobile Development", skill: "Mobile" },

  // ===== ANDROID DEVELOPMENT =====
  { text: "Explain {concept} in Android development", type: "Conceptual", difficulty: "Easy", category: "Android Development", skill: "Android" },
  { text: "How would you implement {feature} in {technology}?", type: "Technical", difficulty: "Medium", category: "Android Development", skill: "Android" },
  { text: "What patterns work best for {concept} in Android?", type: "Behavioral", difficulty: "Medium", category: "Android Development", skill: "Android" },
  { text: "Describe debugging a {scenario} in Android", type: "Scenario", difficulty: "Hard", category: "Android Development", skill: "Android" },

  // ===== iOS DEVELOPMENT =====
  { text: "Explain {concept} in iOS development", type: "Conceptual", difficulty: "Easy", category: "iOS Development", skill: "iOS" },
  { text: "How would you build {feature} using {technology}?", type: "Technical", difficulty: "Medium", category: "iOS Development", skill: "iOS" },
  { text: "What are Apple's guidelines for {concept}?", type: "Behavioral", difficulty: "Medium", category: "iOS Development", skill: "iOS" },
  { text: "Walk through resolving a {scenario} in iOS", type: "Scenario", difficulty: "Hard", category: "iOS Development", skill: "iOS" },

  // ===== WEB DEVELOPMENT =====
  { text: "Explain {concept} in web development", type: "Conceptual", difficulty: "Easy", category: "Web Development", skill: "Web" },
  { text: "How would you build {feature} with {technology}?", type: "Technical", difficulty: "Medium", category: "Web Development", skill: "Web" },
  { text: "What are best practices for {concept} in {technology}?", type: "Behavioral", difficulty: "Medium", category: "Web Development", skill: "Web" },
  { text: "Describe a {scenario} you debugged in a web app", type: "Scenario", difficulty: "Hard", category: "Web Development", skill: "Web" },

  // ===== BACKEND DEVELOPMENT =====
  { text: "Explain {concept} in backend systems", type: "Conceptual", difficulty: "Easy", category: "Backend Development", skill: "Backend" },
  { text: "How would you design {feature} in {technology}?", type: "Technical", difficulty: "Medium", category: "Backend Development", skill: "Backend" },
  { text: "What patterns apply to {concept} in {technology}?", type: "Behavioral", difficulty: "Medium", category: "Backend Development", skill: "Backend" },
  { text: "Walk us through implementing {feature}", type: "Scenario", difficulty: "Hard", category: "Backend Development", skill: "Backend" },
  { text: "Compare {concept1} vs {concept2} for backend systems", type: "Conceptual", difficulty: "Hard", category: "Backend Development", skill: "Backend" },

  // ===== FRONTEND DEVELOPMENT =====
  { text: "Explain {concept} in frontend development", type: "Conceptual", difficulty: "Easy", category: "Frontend Development", skill: "Frontend" },
  { text: "How would you build {feature} with {technology}?", type: "Technical", difficulty: "Medium", category: "Frontend Development", skill: "Frontend" },
  { text: "What patterns apply to {concept}?", type: "Behavioral", difficulty: "Medium", category: "Frontend Development", skill: "Frontend" },
  { text: "Describe a {scenario} you fixed in the UI", type: "Scenario", difficulty: "Hard", category: "Frontend Development", skill: "Frontend" },
  { text: "Compare {concept1} vs {concept2} for frontend", type: "Conceptual", difficulty: "Hard", category: "Frontend Development", skill: "Frontend" },

  // ===== FULL STACK DEVELOPMENT =====
  { text: "Explain {concept} in full stack applications", type: "Conceptual", difficulty: "Easy", category: "Full Stack Development", skill: "Full Stack" },
  { text: "How would you architect {feature} end-to-end?", type: "Technical", difficulty: "Medium", category: "Full Stack Development", skill: "Full Stack" },
  { text: "What are your strategies for {concept} across the stack?", type: "Behavioral", difficulty: "Medium", category: "Full Stack Development", skill: "Full Stack" },
  { text: "Describe building {feature} from frontend to backend", type: "Scenario", difficulty: "Hard", category: "Full Stack Development", skill: "Full Stack" },

  // ===== DEVOPS =====
  { text: "Explain {concept} in DevOps", type: "Conceptual", difficulty: "Easy", category: "DevOps", skill: "DevOps" },
  { text: "How would you deploy {feature} using {technology}?", type: "Technical", difficulty: "Medium", category: "DevOps", skill: "DevOps" },
  { text: "What best practices apply to {concept}?", type: "Behavioral", difficulty: "Medium", category: "DevOps", skill: "DevOps" },
  { text: "Describe handling a {scenario} in production", type: "Scenario", difficulty: "Hard", category: "DevOps", skill: "DevOps" },
  { text: "Compare {concept1} vs {concept2} for CI/CD", type: "Conceptual", difficulty: "Hard", category: "DevOps", skill: "DevOps" },

  // ===== CLOUD ENGINEERING =====
  { text: "Explain {concept} in cloud architecture", type: "Conceptual", difficulty: "Easy", category: "Cloud Engineering", skill: "Cloud" },
  { text: "How would you implement {feature} on {technology}?", type: "Technical", difficulty: "Medium", category: "Cloud Engineering", skill: "Cloud" },
  { text: "What are cloud best practices for {concept}?", type: "Behavioral", difficulty: "Medium", category: "Cloud Engineering", skill: "Cloud" },
  { text: "Describe migrating {feature} to the cloud", type: "Scenario", difficulty: "Hard", category: "Cloud Engineering", skill: "Cloud" },

  // ===== SITE RELIABILITY ENGINEERING =====
  { text: "Explain {concept} in SRE context", type: "Conceptual", difficulty: "Easy", category: "Site Reliability Engineering", skill: "SRE" },
  { text: "How would you ensure {concept} using {technology}?", type: "Technical", difficulty: "Medium", category: "Site Reliability Engineering", skill: "SRE" },
  { text: "What are your strategies for {concept} reliability?", type: "Behavioral", difficulty: "Medium", category: "Site Reliability Engineering", skill: "SRE" },
  { text: "Describe handling a {scenario} affecting uptime", type: "Scenario", difficulty: "Hard", category: "Site Reliability Engineering", skill: "SRE" },

  // ===== DATA ENGINEERING =====
  { text: "Explain {concept} in data pipelines", type: "Conceptual", difficulty: "Easy", category: "Data Engineering", skill: "Data" },
  { text: "How would you process {feature} with {technology}?", type: "Technical", difficulty: "Medium", category: "Data Engineering", skill: "Data" },
  { text: "What patterns work for {concept} in data systems?", type: "Behavioral", difficulty: "Medium", category: "Data Engineering", skill: "Data" },
  { text: "Describe building a {feature} data pipeline", type: "Scenario", difficulty: "Hard", category: "Data Engineering", skill: "Data" },

  // ===== DATA SCIENCE =====
  { text: "Explain {concept} in data science", type: "Conceptual", difficulty: "Easy", category: "Data Science", skill: "Data Science" },
  { text: "How would you apply {feature} with {technology}?", type: "Technical", difficulty: "Medium", category: "Data Science", skill: "Data Science" },
  { text: "What techniques work for {concept}?", type: "Behavioral", difficulty: "Medium", category: "Data Science", skill: "Data Science" },
  { text: "Walk us through analyzing {feature}", type: "Scenario", difficulty: "Hard", category: "Data Science", skill: "Data Science" },

  // ===== SECURITY ENGINEERING =====
  { text: "Explain {concept} in application security", type: "Conceptual", difficulty: "Easy", category: "Security Engineering", skill: "Security" },
  { text: "How would you implement {feature} securely?", type: "Technical", difficulty: "Medium", category: "Security Engineering", skill: "Security" },
  { text: "What security practices apply to {concept}?", type: "Behavioral", difficulty: "Medium", category: "Security Engineering", skill: "Security" },
  { text: "Describe finding and fixing a {scenario}", type: "Scenario", difficulty: "Hard", category: "Security Engineering", skill: "Security" },

  // ===== QUALITY ASSURANCE =====
  { text: "Explain {concept} in software testing", type: "Conceptual", difficulty: "Easy", category: "Quality Assurance", skill: "QA" },
  { text: "How would you test {feature} using {technology}?", type: "Technical", difficulty: "Medium", category: "Quality Assurance", skill: "QA" },
  { text: "What testing strategies work for {concept}?", type: "Behavioral", difficulty: "Medium", category: "Quality Assurance", skill: "QA" },
  { text: "Describe catching a {scenario} during testing", type: "Scenario", difficulty: "Hard", category: "Quality Assurance", skill: "QA" },

  // ===== SOFTWARE ARCHITECTURE =====
  { text: "Explain {concept} in system architecture", type: "Conceptual", difficulty: "Easy", category: "Software Architecture", skill: "Architecture" },
  { text: "How would you architect {feature} for scalability?", type: "Technical", difficulty: "Medium", category: "Software Architecture", skill: "Architecture" },
  { text: "What architectural patterns suit {concept}?", type: "Behavioral", difficulty: "Medium", category: "Software Architecture", skill: "Architecture" },
  { text: "Walk through designing {feature} architecture", type: "Scenario", difficulty: "Hard", category: "Software Architecture", skill: "Architecture" },

  // ===== TECHNICAL LEADERSHIP =====
  { text: "Explain your approach to {concept} as a tech lead", type: "Conceptual", difficulty: "Easy", category: "Technical Leadership", skill: "Leadership" },
  { text: "How would you guide your team on {concept}?", type: "Technical", difficulty: "Medium", category: "Technical Leadership", skill: "Leadership" },
  { text: "What leadership practices work for {scenario}?", type: "Behavioral", difficulty: "Medium", category: "Technical Leadership", skill: "Leadership" },
  { text: "Describe leading a team through {scenario}", type: "Scenario", difficulty: "Hard", category: "Technical Leadership", skill: "Leadership" },

  // ===== API ENGINEERING =====
  { text: "Explain {concept} in API design", type: "Conceptual", difficulty: "Easy", category: "API Engineering", skill: "API" },
  { text: "How would you design {feature} API using {technology}?", type: "Technical", difficulty: "Medium", category: "API Engineering", skill: "API" },
  { text: "What are API best practices for {concept}?", type: "Behavioral", difficulty: "Medium", category: "API Engineering", skill: "API" },
  { text: "Describe versioning an API with {scenario}", type: "Scenario", difficulty: "Hard", category: "API Engineering", skill: "API" },

  // ===== BLOCKCHAIN DEVELOPMENT =====
  { text: "Explain {concept} in blockchain", type: "Conceptual", difficulty: "Easy", category: "Blockchain Development", skill: "Blockchain" },
  { text: "How would you implement {feature} on {technology}?", type: "Technical", difficulty: "Medium", category: "Blockchain Development", skill: "Blockchain" },
  { text: "What patterns work for {concept} in smart contracts?", type: "Behavioral", difficulty: "Medium", category: "Blockchain Development", skill: "Blockchain" },
  { text: "Describe building {feature} on blockchain", type: "Scenario", difficulty: "Hard", category: "Blockchain Development", skill: "Blockchain" },

  // ===== AR/VR DEVELOPMENT =====
  { text: "Explain {concept} in AR/VR development", type: "Conceptual", difficulty: "Easy", category: "AR/VR Development", skill: "AR/VR" },
  { text: "How would you implement {feature} using {technology}?", type: "Technical", difficulty: "Medium", category: "AR/VR Development", skill: "AR/VR" },
  { text: "What techniques work for {concept} in immersive apps?", type: "Behavioral", difficulty: "Medium", category: "AR/VR Development", skill: "AR/VR" },
  { text: "Describe optimizing {feature} for VR performance", type: "Scenario", difficulty: "Hard", category: "AR/VR Development", skill: "AR/VR" },

  // ===== ENGINEERING MANAGEMENT =====
  { text: "Explain your approach to {concept} as an engineering manager", type: "Conceptual", difficulty: "Easy", category: "Engineering Management", skill: "Management" },
  { text: "How would you handle {scenario} with your team?", type: "Technical", difficulty: "Medium", category: "Engineering Management", skill: "Management" },
  { text: "What management practices work for {concept}?", type: "Behavioral", difficulty: "Medium", category: "Engineering Management", skill: "Management" },
  { text: "Describe managing a team through {scenario}", type: "Scenario", difficulty: "Hard", category: "Engineering Management", skill: "Management" },

  // ===== TECHNICAL PROGRAM MANAGEMENT =====
  { text: "Explain {concept} in technical program management", type: "Conceptual", difficulty: "Easy", category: "Technical Program Management", skill: "TPM" },
  { text: "How would you coordinate {feature} across teams?", type: "Technical", difficulty: "Medium", category: "Technical Program Management", skill: "TPM" },
  { text: "What strategies work for {scenario}?", type: "Behavioral", difficulty: "Medium", category: "Technical Program Management", skill: "TPM" },
  { text: "Describe managing {feature} program delivery", type: "Scenario", difficulty: "Hard", category: "Technical Program Management", skill: "TPM" },

  // ===== PRODUCT ENGINEERING =====
  { text: "Explain {concept} in product engineering", type: "Conceptual", difficulty: "Easy", category: "Product Engineering", skill: "Product" },
  { text: "How would you build {feature} with product thinking?", type: "Technical", difficulty: "Medium", category: "Product Engineering", skill: "Product" },
  { text: "What product principles guide {concept}?", type: "Behavioral", difficulty: "Medium", category: "Product Engineering", skill: "Product" },
  { text: "Describe shipping {feature} end-to-end", type: "Scenario", difficulty: "Hard", category: "Product Engineering", skill: "Product" },

  // ===== DEVELOPER EXPERIENCE =====
  { text: "Explain {concept} for developer experience", type: "Conceptual", difficulty: "Easy", category: "Developer Experience", skill: "DX" },
  { text: "How would you improve {feature} for developers?", type: "Technical", difficulty: "Medium", category: "Developer Experience", skill: "DX" },
  { text: "What practices enhance {concept} for engineers?", type: "Behavioral", difficulty: "Medium", category: "Developer Experience", skill: "DX" },
  { text: "Describe building {feature} for developer productivity", type: "Scenario", difficulty: "Hard", category: "Developer Experience", skill: "DX" },
];
