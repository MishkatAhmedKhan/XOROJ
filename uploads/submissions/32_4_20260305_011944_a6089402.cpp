#include<bits/stdc++.h>
using namespace std;
int main(){
    int n,q;cin>>n>>q;
    vector<int>a(n);
    for(int i=0;i<n;i++)cin>>a[i];
    while(q--){
        int x;cin>>x;
        int lo=0,hi=n-1,ans=-1;
        while(lo<=hi){
            int mid=(lo+hi)/2;
            if(a[mid]==x){ans=mid+1;break;}
            else if(a[mid]<x)lo=mid+1;
            else hi=mid-1;
        }
        cout<<ans<<"\n";
    }
    return 0;
}