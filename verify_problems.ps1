# Verify all problems by submitting correct solutions
param([string]$Token)

$headers = @{ "Authorization" = "Bearer $Token"; "Content-Type" = "application/json" }
$base = "http://localhost:8081/api/submissions/problems"

function Submit($problemId, $name, $code) {
    try {
        $body = @{code=$code;language="cpp"} | ConvertTo-Json -Depth 3
        $result = Invoke-RestMethod -Uri "$base/$problemId/submit" -Method POST -Headers $headers -Body $body
        $status = if ($result -eq "ACCEPTED") { "PASS" } else { "FAIL" }
        Write-Host "$status - Problem $problemId ($name): $result"
    } catch {
        Write-Host "FAIL - Problem $problemId ($name): $($_.Exception.Message)"
    }
}

# Problem 2: Frog 4 (DP)
Submit 2 "Frog 4" @"
#include<bits/stdc++.h>
using namespace std;
int main(){
    int n,k;cin>>n>>k;
    vector<int>h(n);
    for(int i=0;i<n;i++)cin>>h[i];
    vector<long long>dp(n,1e18);
    dp[0]=0;
    for(int i=1;i<n;i++){
        for(int j=1;j<=k&&i-j>=0;j++){
            dp[i]=min(dp[i],dp[i-j]+abs(h[i]-h[i-j]));
        }
    }
    cout<<dp[n-1]<<endl;
    return 0;
}
"@

# Problem 3: Two Sum (Hash)
Submit 3 "Two Sum" @"
#include<bits/stdc++.h>
using namespace std;
int main(){
    int n,t;cin>>n>>t;
    unordered_map<int,int>mp;
    vector<int>a(n);
    for(int i=0;i<n;i++){cin>>a[i];}
    for(int i=0;i<n;i++){
        int need=t-a[i];
        if(mp.count(need)){
            cout<<mp[need]+1<<" "<<i+1<<endl;
            return 0;
        }
        mp[a[i]]=i;
    }
    cout<<-1<<endl;
    return 0;
}
"@

# Problem 4: Binary Search
Submit 4 "Binary Search" @"
#include<bits/stdc++.h>
using namespace std;
int main(){
    int n,q;cin>>n>>q;
    vector<int>a(n);
    for(int i=0;i<n;i++)cin>>a[i];
    while(q--){
        int x;cin>>x;
        int lo=0,hi=n-1,ans=-1;
        while(lo<=hi){
            int mid=(lo+hi)/2;
            if(a[mid]==x){ans=mid+1;break;}
            else if(a[mid]<x)lo=mid+1;
            else hi=mid-1;
        }
        cout<<ans<<"\n";
    }
    return 0;
}
"@

# Problem 5: DFS Traversal
Submit 5 "DFS Traversal" @"
#include<bits/stdc++.h>
using namespace std;
int main(){
    int n,m,s;cin>>n>>m>>s;
    vector<vector<int>>adj(n+1);
    for(int i=0;i<m;i++){
        int u,v;cin>>u>>v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    for(int i=1;i<=n;i++)sort(adj[i].begin(),adj[i].end());
    vector<bool>vis(n+1,false);
    stack<int>st;
    st.push(s);
    vector<int>order;
    while(!st.empty()){
        int u=st.top();st.pop();
        if(vis[u])continue;
        vis[u]=true;
        order.push_back(u);
        for(int i=adj[u].size()-1;i>=0;i--){
            if(!vis[adj[u][i]])st.push(adj[u][i]);
        }
    }
    for(int i=0;i<(int)order.size();i++){
        if(i)cout<<" ";
        cout<<order[i];
    }
    cout<<endl;
    return 0;
}
"@

# Problem 6: Knapsack
Submit 6 "Knapsack" @"
#include<bits/stdc++.h>
using namespace std;
int main(){
    int n,W;cin>>n>>W;
    vector<int>w(n),v(n);
    for(int i=0;i<n;i++)cin>>w[i]>>v[i];
    vector<long long>dp(W+1,0);
    for(int i=0;i<n;i++){
        for(int j=W;j>=w[i];j--){
            dp[j]=max(dp[j],dp[j-w[i]]+v[i]);
        }
    }
    cout<<dp[W]<<endl;
    return 0;
}
"@

# Problem 7: Shortest Path (Dijkstra)
Submit 7 "Shortest Path" @"
#include<bits/stdc++.h>
using namespace std;
int main(){
    int n,m,s;cin>>n>>m>>s;
    vector<vector<pair<int,long long>>>adj(n+1);
    for(int i=0;i<m;i++){
        int u,v;long long w;cin>>u>>v>>w;
        adj[u].push_back({v,w});
        adj[v].push_back({u,w});
    }
    vector<long long>dist(n+1,1e18);
    dist[s]=0;
    priority_queue<pair<long long,int>,vector<pair<long long,int>>,greater<>>pq;
    pq.push({0,s});
    while(!pq.empty()){
        auto[d,u]=pq.top();pq.pop();
        if(d>dist[u])continue;
        for(auto[v,w]:adj[u]){
            if(dist[u]+w<dist[v]){
                dist[v]=dist[u]+w;
                pq.push({dist[v],v});
            }
        }
    }
    for(int i=1;i<=n;i++){
        if(i>1)cout<<" ";
        cout<<(dist[i]>=1e18?-1:dist[i]);
    }
    cout<<endl;
    return 0;
}
"@

# Problem 8: String Matching (KMP)
Submit 8 "String Matching" @"
#include<bits/stdc++.h>
using namespace std;
int main(){
    string t,p;cin>>t>>p;
    int n=t.size(),m=p.size();
    vector<int>fail(m,0);
    for(int i=1;i<m;i++){
        int j=fail[i-1];
        while(j>0&&p[i]!=p[j])j=fail[j-1];
        if(p[i]==p[j])j++;
        fail[i]=j;
    }
    vector<int>res;
    int j=0;
    for(int i=0;i<n;i++){
        while(j>0&&t[i]!=p[j])j=fail[j-1];
        if(t[i]==p[j])j++;
        if(j==m){
            res.push_back(i-m+1);
            j=fail[j-1];
        }
    }
    cout<<res.size()<<"\n";
    for(int i=0;i<(int)res.size();i++){
        if(i)cout<<" ";
        cout<<res[i];
    }
    cout<<"\n";
    return 0;
}
"@

# Problem 9: Segment Tree
Submit 9 "Segment Tree" @"
#include<bits/stdc++.h>
using namespace std;
long long tree[400005];
int n;
void build(vector<int>&a,int v,int tl,int tr){
    if(tl==tr){tree[v]=a[tl];return;}
    int tm=(tl+tr)/2;
    build(a,2*v,tl,tm);
    build(a,2*v+1,tm+1,tr);
    tree[v]=tree[2*v]+tree[2*v+1];
}
void update(int v,int tl,int tr,int pos,int val){
    if(tl==tr){tree[v]=val;return;}
    int tm=(tl+tr)/2;
    if(pos<=tm)update(2*v,tl,tm,pos,val);
    else update(2*v+1,tm+1,tr,pos,val);
    tree[v]=tree[2*v]+tree[2*v+1];
}
long long query(int v,int tl,int tr,int l,int r){
    if(l>r)return 0;
    if(l==tl&&r==tr)return tree[v];
    int tm=(tl+tr)/2;
    return query(2*v,tl,tm,l,min(r,tm))+query(2*v+1,tm+1,tr,max(l,tm+1),r);
}
int main(){
    int q;cin>>n>>q;
    vector<int>a(n);
    for(int i=0;i<n;i++)cin>>a[i];
    build(a,1,0,n-1);
    while(q--){
        int type;cin>>type;
        if(type==1){
            int i,v;cin>>i>>v;
            update(1,0,n-1,i-1,v);
        }else{
            int l,r;cin>>l>>r;
            cout<<query(1,0,n-1,l-1,r-1)<<"\n";
        }
    }
    return 0;
}
"@

# Problem 10: Matrix Exponentiation (Fibonacci mod 10^9+7)
Submit 10 "Matrix Exponent" @"
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
const ll MOD=1e9+7;
typedef vector<vector<ll>> Mat;
Mat multiply(Mat&A,Mat&B){
    int n=A.size();
    Mat C(n,vector<ll>(n,0));
    for(int i=0;i<n;i++)
        for(int k=0;k<n;k++)
            if(A[i][k])
                for(int j=0;j<n;j++)
                    C[i][j]=(C[i][j]+A[i][k]*B[k][j])%MOD;
    return C;
}
Mat matpow(Mat A,ll p){
    int n=A.size();
    Mat R(n,vector<ll>(n,0));
    for(int i=0;i<n;i++)R[i][i]=1;
    while(p>0){
        if(p&1)R=multiply(R,A);
        A=multiply(A,A);
        p>>=1;
    }
    return R;
}
int main(){
    ll n;cin>>n;
    if(n<=1){cout<<(n<0?0:n)<<endl;return 0;}
    Mat M={{1,1},{1,0}};
    Mat R=matpow(M,n-1);
    cout<<R[0][0]<<endl;
    return 0;
}
"@

# Problem 11: Convex Hull
Submit 11 "Convex Hull" @"
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
struct P{ll x,y;};
ll cross(P O,P A,P B){return(A.x-O.x)*(B.y-O.y)-(A.y-O.y)*(B.x-O.x);}
int main(){
    int n;cin>>n;
    vector<P>pts(n);
    for(int i=0;i<n;i++)cin>>pts[i].x>>pts[i].y;
    sort(pts.begin(),pts.end(),[](P&a,P&b){return a.x<b.x||(a.x==b.x&&a.y<b.y);});
    if(n==1){cout<<1<<"\n"<<pts[0].x<<" "<<pts[0].y<<"\n";return 0;}
    vector<P>hull;
    for(int i=0;i<n;i++){
        while(hull.size()>=2&&cross(hull[hull.size()-2],hull[hull.size()-1],pts[i])<=0)
            hull.pop_back();
        hull.push_back(pts[i]);
    }
    int lower=hull.size()+1;
    for(int i=n-2;i>=0;i--){
        while((int)hull.size()>=lower&&cross(hull[hull.size()-2],hull[hull.size()-1],pts[i])<=0)
            hull.pop_back();
        hull.push_back(pts[i]);
    }
    hull.pop_back();
    cout<<hull.size()<<"\n";
    for(auto&p:hull)cout<<p.x<<" "<<p.y<<"\n";
    return 0;
}
"@

# Problem 12: Network Flow (Dinic)
Submit 12 "Network Flow" @"
#include<bits/stdc++.h>
using namespace std;
struct Edge{int to,rev;long long cap;};
const int MAXN=505;
vector<Edge>graph[MAXN];
int level[MAXN],iter[MAXN];
void addEdge(int from,int to,long long cap){
    graph[from].push_back({to,(int)graph[to].size(),cap});
    graph[to].push_back({from,(int)graph[from].size()-1,0});
}
bool bfs(int s,int t){
    memset(level,-1,sizeof(level));
    queue<int>q;
    level[s]=0;
    q.push(s);
    while(!q.empty()){
        int v=q.front();q.pop();
        for(auto&e:graph[v]){
            if(e.cap>0&&level[e.to]<0){
                level[e.to]=level[v]+1;
                q.push(e.to);
            }
        }
    }
    return level[t]>=0;
}
long long dfs(int v,int t,long long f){
    if(v==t)return f;
    for(int&i=iter[v];i<(int)graph[v].size();i++){
        Edge&e=graph[v][i];
        if(e.cap>0&&level[v]<level[e.to]){
            long long d=dfs(e.to,t,min(f,e.cap));
            if(d>0){
                e.cap-=d;
                graph[e.to][e.rev].cap+=d;
                return d;
            }
        }
    }
    return 0;
}
long long maxflow(int s,int t){
    long long flow=0;
    while(bfs(s,t)){
        memset(iter,0,sizeof(iter));
        long long d;
        while((d=dfs(s,t,1e18))>0)flow+=d;
    }
    return flow;
}
int main(){
    int n,m,s,t;cin>>n>>m>>s>>t;
    for(int i=0;i<m;i++){
        int u,v;long long c;cin>>u>>v>>c;
        addEdge(u,v,c);
    }
    cout<<maxflow(s,t)<<endl;
    return 0;
}
"@

Write-Host "`nAll problems submitted!"
