import os

# Directories to scan
base_dirs = [
    r"D:\yatrasecure\yatrasecure-api",
    r"D:\yatrasecure\yatrasecure-web"
]

# Extensions to read as text
text_extensions = {
    '.ts', '.tsx', '.js', '.jsx', '.json', '.prisma', '.sql',
    '.toml', '.hbs', '.css', '.mjs', '.md', '.env', '.prettierrc',
    '.gitignore', '.py', '.txt'
}

# Folders to skip
skip_folders = {'node_modules', '.next', 'dist', 'build', '.git', '__pycache__'}

output_file = r"D:\yatrasecure\all_code_dump.txt"

with open(output_file, 'w', encoding='utf-8') as out:
    out.write("=" * 80 + "\n")
    out.write("YATRASECURE - FULL CODE DUMP\n")
    out.write("=" * 80 + "\n\n")

    for base_dir in base_dirs:
        for root, dirs, files in os.walk(base_dir):
            # Skip unwanted folders
            dirs[:] = [d for d in dirs if d not in skip_folders]

            for filename in sorted(files):
                filepath = os.path.join(root, filename)
                ext = os.path.splitext(filename)[1].lower()

                out.write("=" * 80 + "\n")
                out.write(f"FILE: {filepath}\n")
                out.write("=" * 80 + "\n")

                if ext in text_extensions or filename in {'.env', '.env.local', '.prettierrc', '.gitignore'}:
                    try:
                        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                            content = f.read()
                        out.write(content)
                    except Exception as e:
                        out.write(f"[ERROR READING FILE: {e}]\n")
                else:
                    out.write(f"[BINARY OR UNSUPPORTED FILE - SKIPPED]\n")

                out.write("\n\n")

print(f"Done! Output written to: {output_file}")
