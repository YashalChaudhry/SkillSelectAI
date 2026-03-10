console.log("--- matchingService.js (FINAL_LOGIC_FIX) IS RUNNING ---");

import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";
import { saveCandidate } from "./candidateService.js";

const backendDir = process.cwd();

const pythonExecutable = path.resolve(backendDir, "..", "CVParsing", "venv", "bin", "python3");
// Make sure you have renamed your python script to "run_parser.py"
const parserScript = path.resolve(backendDir, "utils", "run_parser.py"); 
const matcherScript = path.resolve(backendDir, "..", "CVParsing", "matcher.py");

/**
 * Spawn Python parser for a single CV file.
 */
function parseCVWithPython(cvPath) {
  
  const absoluteParserScript = path.resolve(backendDir, parserScript);
  const absoluteCvPath = path.resolve(backendDir, cvPath);

  console.log(`[Node DEBUG] Spawning: ${pythonExecutable} ${absoluteParserScript} ${absoluteCvPath}`);

  return new Promise((resolve, reject) => {
    const proc = spawn(pythonExecutable, [absoluteParserScript, absoluteCvPath]);
    
    let stdout = ""; // This will hold our JSON data
    let stderr = ""; // This will hold the Python logs

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("error", (err) => {
      reject(err);
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`Python Script Error (Code ${code}): ${stderr}`));
      }
      if (!stdout) {
        return reject(new Error(`Python script gave no JSON output. Logs: ${stderr}`));
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed); // SUCCESS!
      } catch (e) {
        reject(new Error(`Failed to parse Python JSON output: ${e.message}. Raw output: ${stdout}`));
      }
    });
  });
}


export async function processCVsAndMatch(cvPaths, jobDescriptionText, jobId) {
  const results = [];
  const MIN_FALLBACK_SCORE = 15; // Minimum score if matching fails but parsing succeeds

  for (const cvPath of cvPaths) {
    let cvData = null;
    let matchScore = MIN_FALLBACK_SCORE;
    
    try {
      // cvData is the full object: { personal_info: {...}, work_experience: "...", ... }
      cvData = await parseCVWithPython(cvPath);

      // Validate parsed data
      if (!cvData || !cvData.personal_info) {
        console.error(`[matchingService] Invalid CV data structure for: ${cvPath}`);
        continue;
      }

      const candidateName = cvData.personal_info.Name || "Unnamed Candidate";
      console.log(`[matchingService] PARSED CV: ${candidateName}`);

      // Combine CV text for matching
      const cvTextParts = [
        ...Object.values(cvData.personal_info || {}).filter(v => v),
        cvData.work_experience || "",
        cvData.education_and_training || "",
        cvData.skills || ""
      ];
      const cvText = cvTextParts.join(" ").trim();

      // Skip candidates with empty/too short CV text entirely
      if (cvText.length < 20) {
        console.warn(`[matchingService] Skipping CV - text too short: ${candidateName} (${cvText.length} chars)`);
        continue; // Don't save this candidate at all
      } else {
        const payload = JSON.stringify({
          jd: jobDescriptionText || "",
          cv: cvText
        });

        const absoluteMatcherScript = path.resolve(backendDir, matcherScript);

        try {
          const score = await new Promise((resolve, reject) => {
            const proc = spawn(pythonExecutable, [absoluteMatcherScript]);
            let stdout = "";
            let stderr = "";
            
            // Add timeout for matcher process
            const timeout = setTimeout(() => {
              proc.kill();
              reject(new Error("Matcher process timed out"));
            }, 30000);

            proc.stdout.on("data", (d) => (stdout += d.toString()));
            proc.stderr.on("data", (d) => (stderr += d.toString()));
            proc.on("error", (err) => {
              clearTimeout(timeout);
              reject(err);
            });

            proc.on("close", (code) => {
              clearTimeout(timeout);
              if (stderr) {
                console.log(`[matchingService] Matcher stderr: ${stderr}`);
              }
              if (!stdout.trim()) {
                return reject(new Error(`Python Matcher gave no output. Logs: ${stderr}`));
              }
              try {
                const val = parseFloat(stdout.trim());
                if (isNaN(val)) {
                  return reject(new Error(`Invalid matcher output: ${stdout}`));
                }
                resolve(val);
              } catch (e) {
                reject(new Error(`Failed to parse matcher output: ${e.message}`));
              }
            });

            proc.stdin.write(payload);
            proc.stdin.end();
          });

          matchScore = Math.round(score * 100);
          
          // Skip candidates with 0% score entirely - don't save them
          if (matchScore === 0 || score === 0) {
            console.warn(`[matchingService] Skipping candidate with 0% match: ${candidateName}`);
            continue;
          }
          
          // Ensure score is within valid range (15-100%)
          matchScore = Math.max(MIN_FALLBACK_SCORE, Math.min(100, matchScore));
        } catch (matchErr) {
          console.warn(`[matchingService] Matching failed for ${candidateName}: ${matchErr.message}, using fallback score`);
          matchScore = MIN_FALLBACK_SCORE;
        }
      }

      // Final check - never save 0% candidates
      if (matchScore <= 0) {
        console.warn(`[matchingService] Skipping candidate with invalid score: ${candidateName}`);
        continue;
      }

      // --- SAVE CANDIDATE ---
      const candId = await saveCandidate(
        cvData,
        matchScore,
        jobId
      );
      
      console.log(`[matchingService] SAVED CANDIDATE: ${cvData.personal_info.Name || "Unknown"} with score: ${matchScore}%`);

      results.push({ 
        id: candId, 
        name: cvData.personal_info.Name || "Unnamed Candidate", 
        email: cvData.personal_info.Email || "", 
        score: matchScore 
      });
    
    } catch (err) {
      console.error(
        `[matchingService] FAILED TO PROCESS CV: ${cvPath}`,
        `\nError: ${err.message}`
      );
      
      // Only save fallback if CV has meaningful content (skills, experience, etc.)
      if (cvData && cvData.personal_info) {
        const hasContent = (cvData.skills && cvData.skills.length > 20) ||
                          (cvData.work_experience && cvData.work_experience.length > 20) ||
                          (cvData.education_and_training && cvData.education_and_training.length > 20);
        
        if (hasContent) {
          try {
            const candId = await saveCandidate(cvData, MIN_FALLBACK_SCORE, jobId);
            console.log(`[matchingService] Saved candidate with fallback score: ${cvData.personal_info.Name || "Unknown"}`);
            results.push({
              id: candId,
              name: cvData.personal_info.Name || "Unnamed Candidate",
              email: cvData.personal_info.Email || "",
              score: MIN_FALLBACK_SCORE
            });
          } catch (saveErr) {
            console.error(`[matchingService] Failed to save fallback candidate: ${saveErr.message}`);
          }
        } else {
          console.warn(`[matchingService] Skipping candidate - no meaningful content in CV`);
        }
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  
  const matchesDir = path.resolve(process.cwd(), "matches");
  try {
    await fs.mkdir(matchesDir, { recursive: true });
    await fs.writeFile(path.join(matchesDir, `matches_${jobId}.json`), JSON.stringify(results, null, 2));
    console.log(`[matchingService] Saved ${results.length} candidates for job ${jobId}`);
  } catch (err) {
    console.warn("[matchingService] Could not write matches file:", err.message);
  }

  return results.map(r => r.id);
}