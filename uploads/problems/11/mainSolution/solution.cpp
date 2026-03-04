#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
struct P { ll x, y; };
ll cross(P O, P A, P B){
    return (A.x-O.x)*(B.y-O.y) - (A.y-O.y)*(B.x-O.x);
}
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<P> pts(n);
    for(int i=0;i<n;i++) cin >> pts[i].x >> pts[i].y;
    if(n<=2){cout << n << '\n'; return 0;}
    sort(pts.begin(), pts.end(), [](P&a, P&b){return a.x<b.x||(a.x==b.x&&a.y<b.y);});
    // remove duplicates
    pts.erase(unique(pts.begin(), pts.end(), [](P&a, P&b){return a.x==b.x&&a.y==b.y;}), pts.end());
    n = pts.size();
    if(n<=2){cout << n << '\n'; return 0;}
    vector<P> hull;
    // lower hull
    for(int i=0;i<n;i++){
        while(hull.size()>=2 && cross(hull[hull.size()-2], hull[hull.size()-1], pts[i])<=0)
            hull.pop_back();
        hull.push_back(pts[i]);
    }
    // upper hull
    int lower_size = hull.size()+1;
    for(int i=n-2;i>=0;i--){
        while((int)hull.size()>=lower_size && cross(hull[hull.size()-2], hull[hull.size()-1], pts[i])<=0)
            hull.pop_back();
        hull.push_back(pts[i]);
    }
    hull.pop_back(); // remove last (= first)
    cout << hull.size() << '\n';
    return 0;
}
