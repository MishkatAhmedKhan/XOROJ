#include <bits/stdc++.h>
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
