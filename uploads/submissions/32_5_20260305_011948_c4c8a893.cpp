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