import os
import re

d = "src/lib/api"
for f in os.listdir(d):
    if f.endswith(".ts"):
        with open(os.path.join(d, f)) as file:
            content = file.read()
            matches = re.findall(r'export async function api([a-zA-Z0-9_]+)\(', content)
            if matches:
                print(f"--- {f} ---")
                for m in matches:
                    print(f"  {m}")
