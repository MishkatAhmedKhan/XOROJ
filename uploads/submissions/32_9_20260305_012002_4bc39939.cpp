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