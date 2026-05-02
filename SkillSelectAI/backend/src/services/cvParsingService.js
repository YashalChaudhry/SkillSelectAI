// backend/src/services/cvParsingService.js
import { spawn } from "child_process";
import path from "path";

/**
 * parseCV(cvFilePath)
 * - cvFilePath: full or relative path to the PDF file
 * - returns parsed JSON object that parser.py prints to stdout
 */
export function parseCV(cvFilePath, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    // Build an absolute path to parser.py
    const scriptPath = path.join(process.cwd(), "../CVParsing/parser.py");
    const pythonCmd = path.join(process.cwd(), "../CVParsing/venv/bin/python3");

    const py = spawn(pythonCmd, [scriptPath, cvFilePath], {
      env: process.env,
      cwd: process.cwd(),
    });

    let stdout = "";
    let stderr = "";
    let finished = false;

    // Safety timeout
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        py.kill();
        reject(new Error("Python parser timed out"));
      }
    }, timeoutMs);

    py.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    py.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    py.on("error", (err) => {
      clearTimeout(timer);
      if (finished) return;
      finished = true;
      reject(err);
    });

    py.on("close", (code) => {
      clearTimeout(timer);
      if (finished) return;
      finished = true;

      if (code !== 0) {
        const e = new Error(`Python exited with code ${code} — stderr: ${stderr}`);
        return reject(e);
      }

      try {
        // 🧠 Extract only the JSON array/object from the Python output
        const jsonMatch = stdout.match(/\[.*\]|\{.*\}/s);
        if (!jsonMatch) {
          throw new Error(`Failed to find JSON in parser.py output.\nFull stdout:\n${stdout}`);
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return resolve(parsed);
      } catch (err) {
        const e = new Error(
          `Failed to parse JSON from parser.py stdout.\nstdout:\n${stdout}\nstderr:\n${stderr}\n\nOriginal error:\n${err.message}`
        );
        return reject(e);
      }
    });
  });
}
