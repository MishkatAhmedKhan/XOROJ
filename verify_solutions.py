import requests, os

BASE = "http://localhost:8081"
token = None

# Login
r = requests.post(f"{BASE}/api/auth/login", json={"username": "testjudge", "password": "test1234"})
token = r.text.strip('"')
headers = {"Authorization": f"Bearer {token}"}

problems = [1,2,3,4,5,6,7,8,9,10,11,12]
uploads = r"c:\Users\User\Desktop\XOROJ\uploads\problems"

for pid in problems:
    sol_path = os.path.join(uploads, str(pid), "mainSolution", "solution.cpp")
    if not os.path.exists(sol_path):
        print(f"Problem {pid}: NO SOLUTION FILE")
        continue
    with open(sol_path, 'r') as f:
        code = f.read()
    
    r = requests.post(
        f"{BASE}/api/submissions/problems/{pid}/submit",
        json={"code": code, "language": "cpp"},
        headers=headers
    )
    verdict = r.text.strip('"')
    status = "PASS" if verdict == "ACCEPTED" else "FAIL"
    print(f"{status} - Problem {pid}: {verdict}")

print("\nDone!")
