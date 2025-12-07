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

  for (const cvPath of cvPaths) {
    try {
      // cvData is the full object: { personal_info: {...}, work_experience: "...", ... }
      const cvData = await parseCVWithPython(cvPath);

      console.log(`Node: PARSED CV: ${cvData.personal_info.Name}`);

      const payload = JSON.stringify({
        jd: jobDescriptionText,
        cv: [
          ...Object.values(cvData.personal_info || {}),
          cvData.work_experience || "",
          cvData.education_and_training || "",
          cvData.skills || ""
        ].join(" ")
      });

      const absoluteMatcherScript = path.resolve(backendDir, matcherScript);

      const score = await new Promise((resolve, reject) => {
        const proc = spawn(pythonExecutable, [absoluteMatcherScript]);
        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (d) => (stdout += d.toString()));
        proc.stderr.on("data", (d) => (stderr += d.toString()));
        proc.on("error", reject);

        proc.on("close", (code) => {
          if (code !== 0) {
            return reject(new Error(`Python Matcher Error (Code ${code}): ${stderr}`));
          }
          if (!stdout) {
            return reject(new Error(`Python Matcher gave no output. Logs: ${stderr}`));
          }
          try {
            const val = parseFloat(stdout.trim());
            if (isNaN(val)) return reject(new Error(`Invalid matcher output: ${stdout}`));
            resolve(val);
          } catch (e) {
            reject(new Error(`Failed to parse matcher output: ${e.message}`));
          }
        });

        proc.stdin.write(payload);
        proc.stdin.end();
      });

      const matchScore = Math.round(score * 100);

      // --- THIS IS THE HANDOFF ---
      // We pass the *entire* cvData object to saveCandidate
      const candId = await saveCandidate(
        cvData, // The full object from Python
        matchScore, // The score from the matcher
        jobId
      );
      // --------------------------
      
      console.log(` Node: SAVED CANDIDATE: ${cvData.personal_info.Name}`);

      results.push({ id: candId, name: cvData.personal_info.Name, email: cvData.personal_info.Email, score: matchScore });
    
    } catch (err) {
      console.error(
        ` FAILED TO PROCESS CV: ${cvPath}`,
        `\nTHE ERROR IS: ${err.message}`
      );
    }
  }

  results.sort((a, b) => b.score - a.score);
  
  const matchesDir = path.resolve(process.cwd(), "matches");
  try {
    await fs.mkdir(matchesDir, { recursive: true });
    await fs.writeFile(path.join(matchesDir, `matches_${jobId}.json`), JSON.stringify(results, null, 2));
  } catch (err) {
    console.warn("Could not write matches file:", err.message);
  }

  return results.map(r => r.id);
}