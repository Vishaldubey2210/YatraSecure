import re
import os

directories = [
    r"app\(dashboard)",
    r"components",
]

replacements = [
    (r"'rgba\(255,255,255,0\.02\)'", "'var(--card)'"),
    (r"'rgba\(255,255,255,0\.03\)'", "'var(--bg)'"),
    (r"'rgba\(255,255,255,0\.04\)'", "'var(--border)'"),
    (r"'rgba\(255,255,255,0\.05\)'", "'var(--border)'"),
    (r"'rgba\(255,255,255,0\.1\)'", "'var(--border)'"),
    (r"'rgba\(15,23,42,0\.\d+\)'", "'var(--bg)'"),
    (r"'#0f172a'", "'var(--bg)'"),
    (r"'#1e293b'", "'var(--card)'"),
    (r"'#334155'", "'var(--border)'"),
    (r"'white'", "'var(--text)'"),
    (r"'#94A3B8'", "'var(--text2)'"),
    (r"'#94a3b8'", "'var(--text2)'"),
    (r"'#64748B'", "'var(--text3)'"),
    (r"'#64748b'", "'var(--text3)'"),
    (r"'#E2E8F0'", "'var(--text)'"),
    (r"'#e2e8f0'", "'var(--text)'"),
]

for d in directories:
    # use full path
    full_dir = os.path.join(r"c:\Users\visha\Desktop\ys\YatraSecure\yatrasecure-web", d)
    for root, dirs, files in os.walk(full_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    original = content
                
                for old, new in replacements:
                    content = re.sub(old, new, content)
                    
                if content != original:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(content)
                    print(f"Updated {file_path}")
