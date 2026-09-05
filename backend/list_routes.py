import os
import re

d = "app/api/v1/endpoints"
for f in os.listdir(d):
    if f.endswith(".py"):
        with open(os.path.join(d, f)) as file:
            content = file.read()
            matches = re.findall(r'(@router\.[a-z]+\("([^"]+)".*?\)\nasync def ([a-zA-Z0-9_]+))', content)
            if matches:
                print(f"--- {f} ---")
                for m in matches:
                    print(f"  {m[1]} -> {m[2]}")
