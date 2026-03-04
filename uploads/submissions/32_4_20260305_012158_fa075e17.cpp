#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, target;
    cin >> n >> target;
    vector<int> a(n);
    for(int i=0;i<n;i++) cin >> a[i];
    int lo=0, hi=n-1, ans=-1;
    while(lo<=hi){
        int mid=(lo+hi)/2;
        if(a[mid]==target){ans=mid+1;break;}
        else if(a[mid]<target) lo=mid+1;
        else hi=mid-1;
    }
    cout << ans << '\n';
    return 0;
}
