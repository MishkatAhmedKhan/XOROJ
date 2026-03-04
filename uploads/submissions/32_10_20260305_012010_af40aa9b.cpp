#include<bits/stdc++.h>
using namespace std;
typedef long long ll;
const ll MOD=1e9+7;
typedef vector<vector<ll>> Mat;
Mat multiply(Mat&A,Mat&B){
    int n=A.size();
    Mat C(n,vector<ll>(n,0));
    for(int i=0;i<n;i++)
        for(int k=0;k<n;k++)
            if(A[i][k])
                for(int j=0;j<n;j++)
                    C[i][j]=(C[i][j]+A[i][k]*B[k][j])%MOD;
    return C;
}
Mat matpow(Mat A,ll p){
    int n=A.size();
    Mat R(n,vector<ll>(n,0));
    for(int i=0;i<n;i++)R[i][i]=1;
    while(p>0){
        if(p&1)R=multiply(R,A);
        A=multiply(A,A);
        p>>=1;
    }
    return R;
}
int main(){
    ll n;cin>>n;
    if(n<=1){cout<<(n<0?0:n)<<endl;return 0;}
    Mat M={{1,1},{1,0}};
    Mat R=matpow(M,n-1);
    cout<<R[0][0]<<endl;
    return 0;
}