#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n; cin >> n;
    int t; cin >> t;
    int arr[n+2];
    map<int, int> mp;
    for(int i=0; i<n; i++) cin >> arr[i+1], mp[arr[i+1]] = 1;;
    for(int i=0; i<n; i++) if (mp.count(tar-arr[i+1])) cout << 1;
    return 0;
}
