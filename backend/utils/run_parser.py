import json, sys, os, pathlib, importlib.util, inspect

# This print statement is the most important.
print("--- PYTHON: run_parser.py SCRIPT STARTED (NEW NAME) ---", file=sys.stderr)

# --- Setup Project Paths ---
utils_dir = pathlib.Path(__file__).resolve().parent
project_root = utils_dir.parents[1]
cv_parsing_path = project_root / "CVParsing"

# --- Dynamically Import Your Parser Module ---
try:
    spec = importlib.util.spec_from_file_location("cv_parser", cv_parsing_path / "parser.py")
    parser_module = importlib.util.module_from_spec(spec)
    sys.modules["cv_parser"] = parser_module
    spec.loader.exec_module(parser_module)
except Exception as e:
    print(f"--- PYTHON: FAILED TO IMPORT 'parser.py' ---", file=sys.stderr)
    print(f"--- PYTHON: IMPORT ERROR: {e}", file=sys.stderr)
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print(f"Usage: python {sys.argv[0]} <path_to_cv.pdf>", file=sys.stderr)
        sys.exit(1)
    
    path = sys.argv[1]

    print(f"--- PYTHON: Received path argument: {path}", file=sys.stderr)
    
    if not os.path.isfile(path):
        print(f"Python Error: File not found at {path}", file=sys.stderr)
        sys.exit(1)

    try:
        # 1. Log to stderr
        print(f"Python: Parsing {path}...", file=sys.stderr)
        
        # 2. Run the parser function
        parsed = parser_module.parse_europass_pdf(path)
        
        # 3. Log to stderr
        print(f"Python: Successfully parsed {path}", file=sys.stderr)
        
        # 4. Print the JSON data to STDOUT
        print("--- PYTHON: PRINTING JSON TO STDOUT ---", file=sys.stderr)
        json.dump(parsed, sys.stdout)
        sys.stdout.flush()
        print("--- PYTHON: FINISHED ---", file=sys.stderr)


    except Exception as e:
        print(f"Python: An error occurred while processing {path}: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()