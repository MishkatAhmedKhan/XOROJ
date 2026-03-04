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