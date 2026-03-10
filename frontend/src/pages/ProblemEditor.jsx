import { useState, useEffect } from "react";
import { NavLink, Outlet, useParams, useLocation } from "react-router-dom";
import { apiFetch } from "../api/client.js";

const tabs = [
  { name: "General Info", path: "general" },
  { name: "Statement", path: "statement" },
  { name: "Generator", path: "generator" },
  { name: "Checker", path: "checker" },
  { name: "Tests", path: "tests" },
  { name: "Solution Files", path: "solutions" },
];

export default function ProblemEditor() {
  const { problemId } = useParams();
  const location = useLocation();

  const initialData = location.state?.problemData || null;

  const [problemData, setProblemData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [publishStatus, setPublishStatus] = useState(null);
  const [publishLoading, setPublishLoading] = useState(false);

  // Fetch problem data if not present
  useEffect(() => {
    if (initialData) return;

    let cancelled = false;

    const fetchProblem = async () => {
      try {
        const res = await apiFetch(`/api/problems/${problemId}`);
        if (!res) throw new Error("Failed to fetch problem data");
        if (!cancelled) setProblemData(res);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProblem();

    return () => {
      cancelled = true;
    };
  }, [problemId, initialData]);

  // Fetch publish status
  useEffect(() => {
    let cancelled = false;
    const fetchPublishStatus = async () => {
      try {
        const status = await apiFetch(`/api/edit/problems/${problemId}/publish-status`);
        if (!cancelled) setPublishStatus(status);
      } catch (err) {
        console.error("Failed to fetch publish status", err);
      }
    };
    fetchPublishStatus();
    return () => { cancelled = true; };
  }, [problemId]);

  const handlePublish = async () => {
    setPublishLoading(true);
    try {
      await apiFetch(`/api/edit/problems/${problemId}/publish`, { method: "POST" });
      setPublishStatus({ ...publishStatus, published: true });
    } catch (err) {
      alert(err.message || "Failed to publish");
    } finally {
      setPublishLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setPublishLoading(true);
    try {
      await apiFetch(`/api/edit/problems/${problemId}/unpublish`, { method: "POST" });
      setPublishStatus({ ...publishStatus, published: false });
    } catch (err) {
      alert(err.message || "Failed to unpublish");
    } finally {
      setPublishLoading(false);
    }
  };

  if (loading || !problemData) {
    return <p className="p-6">Loading problem data...</p>;
  }

  return (
    <div className="problem-editor-page">
      {/* Header */}
      <div className="problem-editor-header">
        <div className="problem-editor-title-row">
          <h1 className="problem-editor-title">{problemData.title}</h1>
          <div className="problem-editor-actions">
            {publishStatus && (
              <>
                {publishStatus.inContest && (
                  <span className="publish-badge publish-badge-contest" title="This problem is used in a contest and cannot be published separately">
                    🏆 In Contest
                  </span>
                )}
                {publishStatus.published ? (
                  <button
                    onClick={handleUnpublish}
                    disabled={publishLoading}
                    className="publish-btn publish-btn-unpublish"
                  >
                    {publishLoading ? "..." : "Unpublish"}
                  </button>
                ) : (
                  <button
                    onClick={handlePublish}
                    disabled={publishLoading || publishStatus.inContest}
                    className="publish-btn publish-btn-publish"
                    title={publishStatus.inContest ? "Cannot publish: problem is used in a contest" : "Make this problem visible in the problemset"}
                  >
                    {publishLoading ? "..." : "Publish"}
                  </button>
                )}
                <span className={`publish-status-dot ${publishStatus.published ? "published" : publishStatus.inContest ? "in-contest" : "draft"}`} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="problem-editor-tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `problem-editor-tab ${isActive ? "active" : ""}`
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </nav>

      {/* Outlet renders child tab component */}
      <Outlet key={problemData.id} context={{ problemData, setProblemData }} />
    </div>
  );
}
