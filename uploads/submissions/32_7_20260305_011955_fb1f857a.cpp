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