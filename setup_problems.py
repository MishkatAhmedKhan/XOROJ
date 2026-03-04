"""
Generate main solutions and test inputs for all XOROJ problems.
Run once, then execute the SQL it prints.
"""
import os, random, math

BASE = r"c:\Users\User\Desktop\XOROJ\uploads\problems"

# ─── Problem definitions ────────────────────────────────────────
# Each: (id, title, solution_cpp, list_of_test_input_strings)

problems = []

# ── 1. MaterWelon (A+B) ──────────────────────────────────────
# Already has solution. We just add more test files.
sol_1 = r"""#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long a, b;
    cin >> a >> b;
    cout << a + b << '\n';
    return 0;
}
"""
tests_1 = [
    "3 5\n",
    "0 0\n",
    "-1000000000 1000000000\n",
    "1000000000 1000000000\n",
    "123456789 987654321\n",
]
problems.append((1, "MaterWelon", sol_1, tests_1))

# ── 2. Frog 4 ───────────────────────────────────────────────
# Problem: Given n stones with heights h_i, a frog can jump from stone i
# to stone i+1 or i+2. Cost = |h_i - h_j|. Find min cost from 1 to n.
# Classic DP.
sol_2 = r"""#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> h(n);
    for(int i=0;i<n;i++) cin >> h[i];
    vector<long long> dp(n, 1e18);
    dp[0]=0;
    for(int i=1;i<n;i++){
        dp[i] = dp[i-1] + abs(h[i]-h[i-1]);
        if(i>=2) dp[i] = min(dp[i], dp[i-2] + abs(h[i]-h[i-2]));
    }
    cout << dp[n-1] << '\n';
    return 0;
}
"""
tests_2 = [
    "4\n10 30 40 20\n",        # sample: 30
    "2\n100 200\n",            # 100
    "6\n30 10 60 10 60 50\n",  # 40
    "3\n10 10 10\n",           # 0
    "5\n1 100 1 100 1\n",      # 4
]
# large test
random.seed(42)
n = 100000
h_vals = [random.randint(1, 1000000) for _ in range(n)]
tests_2.append(f"{n}\n{' '.join(map(str, h_vals))}\n")
problems.append((2, "Frog 4", sol_2, tests_2))

# ── 3. Two Sum ──────────────────────────────────────────────
# Given n integers and a target, find two 1-indexed positions that sum to target.
# Print the two indices (smaller first). Guaranteed exactly one solution.
sol_3 = r"""#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, target;
    cin >> n >> target;
    vector<int> a(n);
    for(int i=0;i<n;i++) cin >> a[i];
    unordered_map<int,int> mp;
    for(int i=0;i<n;i++){
        int need = target - a[i];
        if(mp.count(need)){
            cout << mp[need]+1 << " " << i+1 << '\n';
            return 0;
        }
        mp[a[i]] = i;
    }
    return 0;
}
"""
tests_3 = [
    "4 9\n2 7 11 15\n",       # 1 2
    "3 6\n3 2 4\n",           # 1 3  (Wait: 3+4=7 not 6. Let's fix: 2+4=6 -> 2 3)
    "2 10\n5 5\n",            # 1 2
    "5 0\n-3 4 3 90 -1\n",    # 1 3
    "4 -2\n-1 -1 0 2\n",     # 1 2
]
# large test
random.seed(43)
n = 100000
vals = [random.randint(-1000000, 1000000) for _ in range(n)]
# guarantee solution: pick two random positions
i1, i2 = 0, n-1
target = vals[i1] + vals[i2]
tests_3.append(f"{n} {target}\n{' '.join(map(str, vals))}\n")
problems.append((3, "Two Sum", sol_3, tests_3))

# ── 4. Binary Search ────────────────────────────────────────
# Given n sorted integers and target, print 1-indexed position or -1.
sol_4 = r"""#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, target;
    cin >> n >> target;
    vector<int> a(n);
    for(int i=0;i<n;i++) cin >> a[i];
    int lo=0, hi=n-1, ans=-1;
    while(lo<=hi){
        int mid=(lo+hi)/2;
        if(a[mid]==target){ans=mid+1;break;}
        else if(a[mid]<target) lo=mid+1;
        else hi=mid-1;
    }
    cout << ans << '\n';
    return 0;
}
"""
tests_4 = [
    "5 3\n1 2 3 4 5\n",     # 3
    "5 6\n1 2 3 4 5\n",     # -1
    "1 42\n42\n",            # 1
    "1 10\n42\n",            # -1
    "7 1\n1 1 1 1 1 1 1\n",  # some index (finds middle)
]
# large test
random.seed(44)
n = 200000
vals = sorted(random.sample(range(-1000000000, 1000000001), n))
target = vals[n//3]  # guaranteed to exist
tests_4.append(f"{n} {target}\n{' '.join(map(str, vals))}\n")
problems.append((4, "Binary Search", sol_4, tests_4))

# ── 5. DFS Traversal ────────────────────────────────────────
# Given undirected graph (n nodes, m edges), print DFS order from node 1.
# Visit neighbors in ascending order.
sol_5 = r"""#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n+1);
    for(int i=0;i<m;i++){
        int u,v; cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    for(int i=1;i<=n;i++) sort(adj[i].begin(), adj[i].end());
    vector<bool> vis(n+1, false);
    vector<int> order;
    stack<int> st;
    st.push(1); vis[1]=true;
    while(!st.empty()){
        int u=st.top(); st.pop();
        order.push_back(u);
        for(int i=adj[u].size()-1;i>=0;i--){
            int v=adj[u][i];
            if(!vis[v]){vis[v]=true;st.push(v);}
        }
    }
    for(int i=0;i<(int)order.size();i++){
        if(i) cout << ' ';
        cout << order[i];
    }
    cout << '\n';
    return 0;
}
"""
tests_5 = [
    "4 3\n1 2\n1 3\n3 4\n",                # 1 2 3 4
    "5 4\n1 2\n1 3\n2 4\n3 5\n",            # 1 2 4 3 5
    "1 0\n",                                 # 1
    "3 3\n1 2\n2 3\n1 3\n",                  # 1 2 3
    "6 5\n1 3\n1 2\n2 4\n4 5\n5 6\n",        # 1 2 4 5 6 3
]
problems.append((5, "DFS Traversal", sol_5, tests_5))

# ── 6. Knapsack Problem ─────────────────────────────────────
# 0/1 Knapsack: n items with weight and value, capacity W.
sol_6 = r"""#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, W;
    cin >> n >> W;
    vector<int> w(n), v(n);
    for(int i=0;i<n;i++) cin >> w[i] >> v[i];
    vector<long long> dp(W+1, 0);
    for(int i=0;i<n;i++){
        for(int j=W;j>=w[i];j--){
            dp[j] = max(dp[j], dp[j-w[i]] + v[i]);
        }
    }
    cout << dp[W] << '\n';
    return 0;
}
"""
tests_6 = [
    "3 50\n10 60\n20 100\n30 120\n",     # 220
    "1 1\n2 10\n",                         # 0
    "2 10\n5 10\n5 10\n",                  # 20
    "4 7\n1 1\n3 4\n4 5\n5 7\n",           # 9
]
# medium test
random.seed(46)
n = 100
W = 10000
items = [(random.randint(1, 1000), random.randint(1, 1000)) for _ in range(n)]
test_str = f"{n} {W}\n" + "\n".join(f"{w} {v}" for w,v in items) + "\n"
tests_6.append(test_str)
problems.append((6, "Knapsack Problem", sol_6, tests_6))

# ── 7. Shortest Path (Dijkstra) ─────────────────────────────
# Directed weighted graph. Find shortest distance from source to dest.
# Print -1 if unreachable.
sol_7 = r"""#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<pair<int,long long>>> adj(n+1);
    for(int i=0;i<m;i++){
        int u,v; long long w;
        cin >> u >> v >> w;
        adj[u].push_back({v,w});
    }
    int src, dst;
    cin >> src >> dst;
    vector<long long> dist(n+1, 1e18);
    priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;
    dist[src]=0;
    pq.push({0, src});
    while(!pq.empty()){
        auto [d,u] = pq.top(); pq.pop();
        if(d > dist[u]) continue;
        for(auto [v,w]: adj[u]){
            if(dist[u]+w < dist[v]){
                dist[v] = dist[u]+w;
                pq.push({dist[v], v});
            }
        }
    }
    cout << (dist[dst] >= 1e18 ? -1 : dist[dst]) << '\n';
    return 0;
}
"""
tests_7 = [
    "4 5\n1 2 1\n1 3 4\n2 3 2\n2 4 6\n3 4 3\n1 4\n",  # 6
    "2 1\n1 2 10\n1 2\n",       # 10
    "3 1\n1 2 5\n1 3\n",        # -1  (no path to 3)
    "1 0\n1 1\n",               # 0
    "5 7\n1 2 2\n1 3 4\n2 3 1\n2 4 7\n3 5 3\n4 5 1\n3 4 2\n1 5\n",  # 6
]
problems.append((7, "Shortest Path", sol_7, tests_7))

# ── 8. String Matching (KMP) ────────────────────────────────
# Count non-overlapping occurrences of pattern in text.
# Actually let's count ALL occurrences (including overlapping).
sol_8 = r"""#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string text, pat;
    cin >> text >> pat;
    int n=text.size(), m=pat.size();
    // build KMP failure function
    vector<int> fail(m, 0);
    for(int i=1;i<m;i++){
        int j=fail[i-1];
        while(j>0 && pat[i]!=pat[j]) j=fail[j-1];
        if(pat[i]==pat[j]) j++;
        fail[i]=j;
    }
    int cnt=0, j=0;
    for(int i=0;i<n;i++){
        while(j>0 && text[i]!=pat[j]) j=fail[j-1];
        if(text[i]==pat[j]) j++;
        if(j==m){cnt++;j=fail[j-1];}
    }
    cout << cnt << '\n';
    return 0;
}
"""
tests_8 = [
    "ababababab\nabab\n",      # 4
    "aaaaaa\naa\n",            # 5
    "abcdef\nxyz\n",           # 0
    "aaa\na\n",                # 3
    "abcabcabc\nabc\n",        # 3
]
# large test
random.seed(48)
text = ''.join(random.choices('abc', k=200000))
pat = ''.join(random.choices('abc', k=5))
tests_8.append(f"{text}\n{pat}\n")
problems.append((8, "String Matching", sol_8, tests_8))

# ── 9. Segment Tree ─────────────────────────────────────────
# Range sum query with point updates.
# Query type 1 l r: sum a[l..r] (1-indexed)
# Query type 2 i v: set a[i] = v
sol_9 = r"""#include <bits/stdc++.h>
using namespace std;
struct SegTree {
    int n;
    vector<long long> t;
    SegTree(int n): n(n), t(4*n, 0) {}
    void build(vector<int>& a, int v, int tl, int tr){
        if(tl==tr){t[v]=a[tl];return;}
        int tm=(tl+tr)/2;
        build(a,2*v,tl,tm); build(a,2*v+1,tm+1,tr);
        t[v]=t[2*v]+t[2*v+1];
    }
    void update(int v, int tl, int tr, int pos, int val){
        if(tl==tr){t[v]=val;return;}
        int tm=(tl+tr)/2;
        if(pos<=tm) update(2*v,tl,tm,pos,val);
        else update(2*v+1,tm+1,tr,pos,val);
        t[v]=t[2*v]+t[2*v+1];
    }
    long long query(int v, int tl, int tr, int l, int r){
        if(l>r) return 0;
        if(l==tl && r==tr) return t[v];
        int tm=(tl+tr)/2;
        return query(2*v,tl,tm,l,min(r,tm)) + query(2*v+1,tm+1,tr,max(l,tm+1),r);
    }
};
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<int> a(n);
    for(int i=0;i<n;i++) cin >> a[i];
    SegTree seg(n);
    seg.build(a, 1, 0, n-1);
    while(q--){
        int type; cin >> type;
        if(type==1){
            int l,r; cin >> l >> r;
            cout << seg.query(1,0,n-1,l-1,r-1) << '\n';
        } else {
            int i,v; cin >> i >> v;
            seg.update(1,0,n-1,i-1,v);
        }
    }
    return 0;
}
"""
tests_9 = [
    "5 3\n1 2 3 4 5\n1 2 4\n2 3 10\n1 2 4\n",                    # 9\n17
    "1 1\n42\n1 1 1\n",                                           # 42
    "3 4\n1 1 1\n1 1 3\n2 2 5\n1 1 3\n1 2 2\n",                   # 3\n7\n5
    "4 2\n-10 20 -30 40\n1 1 4\n1 2 3\n",                         # 20\n-10
]
# medium test
random.seed(49)
n = 100000
q = 100000
vals = [random.randint(-100000, 100000) for _ in range(n)]
queries = []
for _ in range(q):
    if random.random() < 0.5:
        l = random.randint(1, n)
        r = random.randint(l, n)
        queries.append(f"1 {l} {r}")
    else:
        i = random.randint(1, n)
        v = random.randint(-100000, 100000)
        queries.append(f"2 {i} {v}")
test_str = f"{n} {q}\n{' '.join(map(str, vals))}\n" + "\n".join(queries) + "\n"
tests_9.append(test_str)
problems.append((9, "Segment Tree", sol_9, tests_9))

# ── 10. Matrix Exponentiation (Fibonacci) ───────────────────
# Given n, print the n-th Fibonacci number mod 10^9+7.
# F(0)=0, F(1)=1, F(2)=1, ...
sol_10 = r"""#include <bits/stdc++.h>
using namespace std;
const long long MOD = 1e9+7;
typedef vector<vector<long long>> Mat;
Mat mul(Mat& A, Mat& B){
    int n=A.size();
    Mat C(n, vector<long long>(n, 0));
    for(int i=0;i<n;i++)
        for(int k=0;k<n;k++) if(A[i][k])
            for(int j=0;j<n;j++)
                C[i][j] = (C[i][j] + A[i][k]*B[k][j]) % MOD;
    return C;
}
Mat matpow(Mat A, long long p){
    int n=A.size();
    Mat R(n, vector<long long>(n, 0));
    for(int i=0;i<n;i++) R[i][i]=1;
    while(p>0){
        if(p&1) R=mul(R,A);
        A=mul(A,A);
        p>>=1;
    }
    return R;
}
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n;
    cin >> n;
    if(n<=1){cout << n << '\n'; return 0;}
    Mat A = {{1,1},{1,0}};
    Mat R = matpow(A, n-1);
    cout << R[0][0] << '\n';
    return 0;
}
"""
tests_10 = [
    "10\n",          # 55
    "0\n",           # 0
    "1\n",           # 1
    "2\n",           # 1
    "50\n",          # 12586269025 mod 10^9+7 = 586269025... let's just trust the solution
    "1000000000000000000\n",  # stress test with huge n
]
problems.append((10, "Matrix Exponent", sol_10, tests_10))

# ── 11. Convex Hull ──────────────────────────────────────────
# Given n 2D points, find the number of points on the convex hull.
sol_11 = r"""#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
struct P { ll x, y; };
ll cross(P O, P A, P B){
    return (A.x-O.x)*(B.y-O.y) - (A.y-O.y)*(B.x-O.x);
}
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<P> pts(n);
    for(int i=0;i<n;i++) cin >> pts[i].x >> pts[i].y;
    if(n<=2){cout << n << '\n'; return 0;}
    sort(pts.begin(), pts.end(), [](P&a, P&b){return a.x<b.x||(a.x==b.x&&a.y<b.y);});
    // remove duplicates
    pts.erase(unique(pts.begin(), pts.end(), [](P&a, P&b){return a.x==b.x&&a.y==b.y;}), pts.end());
    n = pts.size();
    if(n<=2){cout << n << '\n'; return 0;}
    vector<P> hull;
    // lower hull
    for(int i=0;i<n;i++){
        while(hull.size()>=2 && cross(hull[hull.size()-2], hull[hull.size()-1], pts[i])<=0)
            hull.pop_back();
        hull.push_back(pts[i]);
    }
    // upper hull
    int lower_size = hull.size()+1;
    for(int i=n-2;i>=0;i--){
        while((int)hull.size()>=lower_size && cross(hull[hull.size()-2], hull[hull.size()-1], pts[i])<=0)
            hull.pop_back();
        hull.push_back(pts[i]);
    }
    hull.pop_back(); // remove last (= first)
    cout << hull.size() << '\n';
    return 0;
}
"""
tests_11 = [
    "5\n0 0\n1 1\n2 2\n0 2\n2 0\n",    # 4 (collinear point removed)
    "4\n0 0\n1 0\n0 1\n1 1\n",          # 4 (square)
    "3\n0 0\n1 0\n0 1\n",               # 3 (triangle)
    "1\n5 5\n",                          # 1
    "6\n0 0\n2 0\n4 0\n4 4\n2 4\n0 4\n", # 4 (rectangle, collinear on edges removed)
]
# medium test
random.seed(51)
n = 1000
pts_set = set()
while len(pts_set) < n:
    pts_set.add((random.randint(-1000000, 1000000), random.randint(-1000000, 1000000)))
pts_list = list(pts_set)
test_str = f"{n}\n" + "\n".join(f"{x} {y}" for x,y in pts_list) + "\n"
tests_11.append(test_str)
problems.append((11, "Convex Hull", sol_11, tests_11))

# ── 12. Network Flow (max flow, Dinic's) ────────────────────
# n nodes, m edges with capacity. Source=1, Sink=n. Print max flow.
sol_12 = r"""#include <bits/stdc++.h>
using namespace std;
struct Edge { int to, rev; long long cap; };
struct Dinic {
    vector<vector<Edge>> graph;
    vector<int> level, iter;
    int n;
    Dinic(int n): n(n), graph(n), level(n), iter(n) {}
    void add_edge(int from, int to, long long cap){
        graph[from].push_back({to, (int)graph[to].size(), cap});
        graph[to].push_back({from, (int)graph[from].size()-1, 0});
    }
    bool bfs(int s, int t){
        fill(level.begin(), level.end(), -1);
        queue<int> q;
        level[s]=0; q.push(s);
        while(!q.empty()){
            int v=q.front(); q.pop();
            for(auto& e: graph[v]) if(e.cap>0 && level[e.to]<0){
                level[e.to]=level[v]+1;
                q.push(e.to);
            }
        }
        return level[t]>=0;
    }
    long long dfs(int v, int t, long long f){
        if(v==t) return f;
        for(int& i=iter[v]; i<(int)graph[v].size(); i++){
            Edge& e=graph[v][i];
            if(e.cap>0 && level[v]<level[e.to]){
                long long d=dfs(e.to, t, min(f, e.cap));
                if(d>0){e.cap-=d; graph[e.to][e.rev].cap+=d; return d;}
            }
        }
        return 0;
    }
    long long max_flow(int s, int t){
        long long flow=0;
        while(bfs(s,t)){
            fill(iter.begin(), iter.end(), 0);
            long long d;
            while((d=dfs(s,t,1e18))>0) flow+=d;
        }
        return flow;
    }
};
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    Dinic dinic(n);
    for(int i=0;i<m;i++){
        int u,v; long long c;
        cin >> u >> v >> c;
        dinic.add_edge(u-1, v-1, c);
    }
    cout << dinic.max_flow(0, n-1) << '\n';
    return 0;
}
"""
tests_12 = [
    "4 5\n1 2 3\n1 3 2\n2 3 1\n2 4 3\n3 4 2\n",   # 5
    "2 1\n1 2 10\n",                                 # 10
    "3 3\n1 2 5\n2 3 3\n1 3 4\n",                    # 7
    "4 4\n1 2 1000\n1 3 1000\n2 4 1000\n3 4 1000\n", # 2000
    "6 9\n1 2 10\n1 3 10\n2 3 2\n2 4 4\n2 5 8\n3 5 9\n4 6 10\n5 4 6\n5 6 10\n",  # 19
]
problems.append((12, "Network Flow", sol_12, tests_12))


# ─── Write files and generate SQL ────────────────────────────
sql_lines = []

for pid, title, sol_cpp, tests in problems:
    prob_dir = os.path.join(BASE, str(pid))
    sol_dir = os.path.join(prob_dir, "mainSolution")
    test_dir = os.path.join(prob_dir, "tests")
    os.makedirs(sol_dir, exist_ok=True)
    os.makedirs(test_dir, exist_ok=True)

    # Write solution
    sol_path = os.path.join(sol_dir, "solution.cpp")
    with open(sol_path, "w", newline='\n') as f:
        f.write(sol_cpp.lstrip('\n'))

    # Update main_solution_path in DB
    sql_lines.append(
        f"UPDATE problems SET main_solution_path = '{sol_path}' WHERE id = {pid};"
    )

    # Delete old test files for this problem
    sql_lines.append(f"DELETE FROM test_files WHERE problem_id = {pid};")

    # Write test files and generate INSERT
    for idx, test_input in enumerate(tests, 1):
        fname = f"{idx}_in.txt"
        fpath = os.path.join(test_dir, fname)
        with open(fpath, "w", newline='\n') as f:
            f.write(test_input)
        sql_lines.append(
            f"INSERT INTO test_files (test_id, file_name, file_path, problem_id) "
            f"VALUES ({idx}, '{fname}', '{fpath}', {pid});"
        )

# Write SQL file
sql_path = os.path.join(BASE, "..", "setup_problems.sql")
with open(sql_path, "w") as f:
    f.write("-- Auto-generated: register solutions + test files\n")
    f.write("BEGIN;\n")
    for line in sql_lines:
        f.write(line + "\n")
    f.write("COMMIT;\n")

print(f"Done! Created files for {len(problems)} problems.")
print(f"SQL written to: {os.path.abspath(sql_path)}")
print(f"Run it with: psql -U postgres -d xoroj -f \"{os.path.abspath(sql_path)}\"")
