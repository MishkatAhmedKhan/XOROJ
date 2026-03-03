#pragma GCC optimize ("O3")
#pragma GCC optimize ("unroll-loops")

#include <bits/stdc++.h>
using namespace std;

#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
using namespace __gnu_pbds;

using LL = long long;

#define all(V) V.begin(), V.end()

template <typename DT> using ordered_set = tree <DT, null_type, less <DT>, rb_tree_tag, tree_order_statistics_node_update>;
template <typename DT> using minheap = priority_queue < DT, vector <DT>, greater <DT> >;
template <class T> bool chMax (T &x, T y) { return y > x ? x = y, 1 : 0; }
template <class T> bool chMin (T &x, T y) { return y < x ? x = y, 1 : 0; }

int main() {
  cin.tie(nullptr)->ios_base ::sync_with_stdio(false);

  LL a, b;
  cin >> a >> b;
  cout << a + b << '\n';

  return 0;
}
