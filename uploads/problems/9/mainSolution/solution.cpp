#include <bits/stdc++.h>
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
