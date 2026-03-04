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