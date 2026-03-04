#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, target;
    cin >> n >> target;
    vector<int> a(n);
    for(int i=0;i<n;i++) cin >> a[i];
    unordered_map<int,int> mp;
    for(int i=0;i<n;i++){
        int need = target - a[i];
        if(mp.count(need)){
            cout << mp[need]+1 << " " << i+1 << '\n';
            return 0;
        }
        mp[a[i]] = i;
    }
    return 0;
}
