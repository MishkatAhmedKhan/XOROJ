import { Link } from "react-router-dom";

import Card from "../components/Card.jsx";

export default function AuthorDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Author Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="My Problems">
          <p className="text-gray-600 mb-4">
            Manage problems you’ve created, edit them, or add new ones.
          </p>
          <Link
            to="/author/problems"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Go to My Problems
          </Link>
        </Card>

        <Card title="My Contests">
          <p className="text-gray-600 mb-4">
            Manage contests, add problems, and schedule new contests.
          </p>
          <Link
            to="/author/contests"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Go to My Contests
          </Link>
        </Card>
      </div>
    </div>
  );
}
