#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string text, pat;
    cin >> text >> pat;
    int n=text.size(), m=pat.size();
    // build KMP failure function
    vector<int> fail(m, 0);
    for(int i=1;i<m;i++){
        int j=fail[i-1];
        while(j>0 && pat[i]!=pat[j]) j=fail[j-1];
        if(pat[i]==pat[j]) j++;
        fail[i]=j;
    }
    int cnt=0, j=0;
    for(int i=0;i<n;i++){
        while(j>0 && text[i]!=pat[j]) j=fail[j-1];
        if(text[i]==pat[j]) j++;
        if(j==m){cnt++;j=fail[j-1];}
    }
    cout << cnt << '\n';
    return 0;
}
