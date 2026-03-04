import requests
BASE = 'http://localhost:8081'
r = requests.post(f'{BASE}/api/auth/login', json={'username': 'testjudge', 'password': 'test1234'})
token = r.text.strip('"')
headers = {'Authorization': f'Bearer {token}'}

# Wrong answer test
r = requests.post(f'{BASE}/api/submissions/problems/1/submit', json={'code': '#include<iostream>\nusing namespace std;\nint main(){cout<<42;return 0;}', 'language': 'cpp'}, headers=headers)
print(f'Wrong answer test: {r.text}')

# Compile error test
r = requests.post(f'{BASE}/api/submissions/problems/1/submit', json={'code': 'this is not valid c++', 'language': 'cpp'}, headers=headers)
print(f'Compile error test: {r.text}')
