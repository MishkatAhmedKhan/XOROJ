#include <bits/stdc++.h>
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
