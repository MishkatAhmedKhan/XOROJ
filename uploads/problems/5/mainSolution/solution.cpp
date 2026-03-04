#include <bits/stdc++.h>
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
