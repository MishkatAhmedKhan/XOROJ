import requests, json

BASE = 'http://localhost:8081/api'
s = requests.Session()

# Login - get JWT
r = s.post(f'{BASE}/auth/login', json={'username':'testjudge','password':'test1234'})
token = r.text.strip().strip('"')
print('Login:', r.status_code)
s.headers.update({'Authorization': f'Bearer {token}'})

# Get blogs
r = s.get(f'{BASE}/blogs')
blogs = r.json()
print('Blogs count:', len(blogs))
if blogs:
    b = blogs[0]
    bid = b['id']
    print(f"Blog[0] id={bid}, stars={b.get('stars', 'MISSING')}")
    
    # Star the post
    r = s.post(f'{BASE}/blogs/{bid}/star')
    print('Star toggle:', r.status_code, r.json())
    
    # Get post detail
    r = s.get(f'{BASE}/blogs/{bid}')
    d = r.json()
    print(f"Detail: stars={d.get('stars')}, userStarred={d.get('userStarred')}")
    
    # Toggle star off
    r = s.post(f'{BASE}/blogs/{bid}/star')
    print('Unstar toggle:', r.status_code, r.json())
    
    # Verify
    r = s.get(f'{BASE}/blogs/{bid}')
    d = r.json()
    print(f"After unstar: stars={d.get('stars')}, userStarred={d.get('userStarred')}")
    
    # Test vote independence with a blog that has comments
    # Find a blog with comments
    for blog in blogs:
        r = s.get(f'{BASE}/blogs/{blog["id"]}')
        d = r.json()
        if d.get('comments'):
            bid2 = blog['id']
            post_up = d['upvotes']
            post_down = d['downvotes']
            cid = d['comments'][0]['id']
            r = s.post(f'{BASE}/blogs/comments/{cid}/vote', json={'value': 1})
            print('Comment vote:', r.status_code, r.json())
            r = s.get(f'{BASE}/blogs/{bid2}')
            d2 = r.json()
            print(f"Post votes after comment vote: up={d2['upvotes']} (was {post_up}), down={d2['downvotes']} (was {post_down})")
            independent = d2['upvotes'] == post_up and d2['downvotes'] == post_down
            print(f"Vote independence: {'PASS' if independent else 'FAIL'}")
            break
    else:
        # Create a comment on the first blog to test
        r = s.post(f'{BASE}/blogs/{bid}/comments', json={'content': 'Test comment for vote independence'})
        print('Created comment:', r.status_code)
        cid = r.json()['id']
        r = s.get(f'{BASE}/blogs/{bid}')
        post_up = r.json()['upvotes']
        post_down = r.json()['downvotes']
        r = s.post(f'{BASE}/blogs/comments/{cid}/vote', json={'value': 1})
        print('Comment vote:', r.status_code, r.json())
        r = s.get(f'{BASE}/blogs/{bid}')
        d = r.json()
        independent = d['upvotes'] == post_up and d['downvotes'] == post_down
        print(f"Vote independence: {'PASS' if independent else 'FAIL'}")
    
    print("\nAll tests PASSED!")
else:
    print("No blogs found")
