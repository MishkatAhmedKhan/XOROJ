import { Link } from "react-router-dom";

function ErrorPage() {

  return (
    <main className="w-full min-h-screen flex flex-col items-center mt-[30vh] gap-3">
      <h1 className="text-5xl font-bold">404 - Not Found</h1>
      <p className="text-lg">The page you are looking for does not exist.</p>
      <Link to="/" className="text-blue-500 hover:underline">Go back to Homepage</Link>
    </main>
  );
}

export default ErrorPage;