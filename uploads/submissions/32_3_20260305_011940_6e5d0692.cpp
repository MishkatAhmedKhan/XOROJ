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