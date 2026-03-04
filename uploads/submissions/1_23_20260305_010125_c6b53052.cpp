#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;

    int sum = 0;  // 64-bit integer

    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        sum += x;
    }

    cout << sum << endl;

    return 0;
}