// backend/test_parse.mjs
import path from "path";
import { fileURLToPath } from "url";
import { parseCV } from "./src/services/cvParsingService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  try {
    // Point directly to your sample_cv.pdf in uploads folder
    const samplePdf = path.join(process.cwd(),  "uploads", "sample_cv.pdf");

    console.log("🧠 Testing parse of:", samplePdf);
    const parsed = await parseCV(samplePdf);
    console.log("\n✅ Parsed result (JS object):\n", parsed);
  } catch (err) {
    console.error("\n❌ Error during test_parse:", err);
  }
}

runTest();
