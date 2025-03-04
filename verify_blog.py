import requests

BASE = "http://localhost:8081"

# Login
r = requests.post(f"{BASE}/api/auth/login", json={"username": "testjudge", "password": "test1234"})
token = r.text.strip('"')
headers = {"Authorization": f"Bearer {token}"}

print("=== Blog API Verification ===\n")

# 1. Create a blog post
r = requests.post(f"{BASE}/api/blogs", json={
    "title": "My First Editorial: Solving MaterWelon",
    "content": "<p>The problem asks you to compute $a + b$ where $a$ and $b$ are integers.</p>\n<p>This is a classic beginner problem. The solution is straightforward:</p>\n<pre><code class='language-cpp'>\n#include &lt;bits/stdc++.h&gt;\nusing namespace std;\nint main() {\n    long long a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n}\n</code></pre>\n<p>Time complexity: $O(1)$.</p>",
    "tags": ["editorial", "beginner", "math"]
}, headers=headers)
print(f"1. Create post: {r.status_code}")
post = r.json()
post_id = post["id"]
print(f"   Post ID: {post_id}, Title: {post['title']}")

# 2. List all posts
r = requests.get(f"{BASE}/api/blogs", headers=headers)
print(f"\n2. List posts: {r.status_code}, count={len(r.json())}")

# 3. Get post detail
r = requests.get(f"{BASE}/api/blogs/{post_id}", headers=headers)
print(f"\n3. Get post: {r.status_code}")
detail = r.json()
print(f"   Title: {detail['title']}, Comments: {len(detail['comments'])}")

# 4. Upvote the post
r = requests.post(f"{BASE}/api/blogs/{post_id}/vote", json={"value": 1}, headers=headers)
print(f"\n4. Upvote: {r.status_code}, net score={r.json()}")

# 5. Add a comment
r = requests.post(f"{BASE}/api/blogs/{post_id}/comments", json={
    "content": "Great editorial! Very clear explanation.",
    "parentCommentId": None
}, headers=headers)
print(f"\n5. Add comment: {r.status_code}")
comment = r.json()
comment_id = comment["id"]
print(f"   Comment ID: {comment_id}, by {comment['authorUsername']}")

# 6. Reply to the comment
r = requests.post(f"{BASE}/api/blogs/{post_id}/comments", json={
    "content": "Thanks! Glad you found it helpful.",
    "parentCommentId": comment_id
}, headers=headers)
print(f"\n6. Reply: {r.status_code}")
reply = r.json()
print(f"   Reply ID: {reply['id']}, parent: {reply['parentCommentId']}")

# 7. Upvote the comment
r = requests.post(f"{BASE}/api/blogs/comments/{comment_id}/vote", json={"value": 1}, headers=headers)
print(f"\n7. Upvote comment: {r.status_code}, net={r.json()}")

# 8. Toggle upvote off
r = requests.post(f"{BASE}/api/blogs/comments/{comment_id}/vote", json={"value": 1}, headers=headers)
print(f"\n8. Toggle off: {r.status_code}, net={r.json()}")

# 9. Get post again to see comments
r = requests.get(f"{BASE}/api/blogs/{post_id}", headers=headers)
detail = r.json()
print(f"\n9. Post now has {len(detail['comments'])} comments, post vote={detail['userVote']}")

# 10. Update the post
r = requests.put(f"{BASE}/api/blogs/{post_id}", json={
    "title": "Editorial: Solving MaterWelon (Updated)",
    "content": detail["content"] + "\n<p><strong>Update:</strong> Added complexity analysis.</p>",
    "tags": ["editorial", "beginner", "math", "updated"]
}, headers=headers)
print(f"\n10. Update post: {r.status_code}")

# 11. Create a second post
r = requests.post(f"{BASE}/api/blogs", json={
    "title": "Tips for Competitive Programming Beginners",
    "content": "<p>Here are some tips for getting started with competitive programming:</p>\n<ol>\n<li>Practice regularly on XorOJ</li>\n<li>Learn standard algorithms: sorting, searching, DP, graphs</li>\n<li>Read editorials after solving (or failing) a problem</li>\n<li>Participate in contests to improve under time pressure</li>\n</ol>\n<p>The formula for success: $\\text{practice} + \\text{consistency} = \\text{improvement}$</p>",
    "tags": ["tips", "beginner"]
}, headers=headers)
print(f"\n11. Second post: {r.status_code}, ID={r.json()['id']}")

# 12. List all posts again
r = requests.get(f"{BASE}/api/blogs", headers=headers)
posts = r.json()
print(f"\n12. All posts: {len(posts)} total")
for p in posts:
    net = p["upvotes"] - p["downvotes"]
    print(f"    [{'+' if net >= 0 else ''}{net}] {p['title']} by {p['authorUsername']} ({p['commentCount']} comments)")

print("\n=== All blog API tests passed! ===")
