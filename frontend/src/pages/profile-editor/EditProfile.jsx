import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../components/Button.jsx";
import { apiFetch } from "../../api/client.js";

export default function ProfileEditor() {
  const { profile, setProfile } = useOutletContext();
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [formData, setFormData] = useState({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    bio: profile.bio || "",
    institute: profile.institute || "",
    country: profile.country || "",
    contact: profile.contact || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Merge editable fields into full profile object
      const payload = { ...profile, ...formData };

      const res = await apiFetch(`/api/profile/edit`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res) throw new Error("Failed to save profile");

      // Update context state so all tabs see the new profile
      setProfile(payload);
      alert("Profile saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl mt-4">
      <div>
        <label className="block font-medium">First Name</label>
        <input
          type="text"
          className="w-full border rounded px-2 py-1"
          value={formData.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Last Name</label>
        <input
          type="text"
          className="w-full border rounded px-2 py-1"
          value={formData.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Bio</label>
        <textarea
          className="w-full border rounded px-2 py-1"
          rows={3}
          value={formData.bio || ""}
          onChange={(e) => handleChange("bio", e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Institute</label>
        <input
          type="text"
          className="w-full border rounded px-2 py-1"
          value={formData.institute || ""}
          onChange={(e) => handleChange("institute", e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Country</label>
        <input
          type="text"
          className="w-full border rounded px-2 py-1"
          value={formData.country || ""}
          onChange={(e) => handleChange("country", e.target.value)}
        />
      </div>

      <div>
        <label className="block font-medium">Contact</label>
        <input
          type="text"
          className="w-full border rounded px-2 py-1"
          value={formData.contact || ""}
          onChange={(e) => handleChange("contact", e.target.value)}
        />
      </div>

      <div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
