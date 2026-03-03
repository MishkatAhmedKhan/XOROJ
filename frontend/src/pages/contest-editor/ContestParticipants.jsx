// src/pages/contest-editor/ContestParticipants.jsx
import { useOutletContext, Link } from "react-router-dom";
import Card from "../../components/Card.jsx";

export default function ContestParticipants() {
  const { contestData } = useOutletContext();

  const participants = contestData?.participants || [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Participants</h2>

      {participants.length === 0 ? (
        <Card>
          <p className="text-gray-600">No participants yet.</p>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-gray-200">
            {participants.map((user) => (
              <li key={user.id} className="py-2">
                <Link
                  to={`/profile/${user.username}`}
                  className="text-blue-600 hover:underline"
                >
                  {user.username}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
