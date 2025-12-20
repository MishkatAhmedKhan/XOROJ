import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function ProfilePage() {
  const { username } = useParams(); 
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/profile/${username}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4">
        {loading && <p>Loading profile...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {profile && (
          <>
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="mt-2">{profile.username}</p>
            <p className="mt-2">{profile.email}</p>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default ProfilePage;
