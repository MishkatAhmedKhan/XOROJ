#include <bits/stdc++.h>
using namespace std;
const long long MOD = 1e9+7;
typedef vector<vector<long long>> Mat;
Mat mul(Mat& A, Mat& B){
    int n=A.size();
    Mat C(n, vector<long long>(n, 0));
    for(int i=0;i<n;i++)
        for(int k=0;k<n;k++) if(A[i][k])
            for(int j=0;j<n;j++)
                C[i][j] = (C[i][j] + A[i][k]*B[k][j]) % MOD;
    return C;
}
Mat matpow(Mat A, long long p){
    int n=A.size();
    Mat R(n, vector<long long>(n, 0));
    for(int i=0;i<n;i++) R[i][i]=1;
    while(p>0){
        if(p&1) R=mul(R,A);
        A=mul(A,A);
        p>>=1;
    }
    return R;
}
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n;
    cin >> n;
    if(n<=1){cout << n << '\n'; return 0;}
    Mat A = {{1,1},{1,0}};
    Mat R = matpow(A, n-1);
    cout << R[0][0] << '\n';
    return 0;
}
