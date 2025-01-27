"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";

// Add an Intake Group
export default function AddIntakeGroup() {
  const [form, setForm] = useState({
    title: "",
    campus: "",
    outcome: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/intake-groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          campus: form.campus.split(",").map((x) => x.trim()), // Assuming campus is comma-separated
          outcome: form.outcome.split(",").map((x) => x.trim()), // Assuming outcome is comma-separated
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Created intake group:", data); // Debugging the response
        alert("Intake Group created successfully!");
        setForm({ title: "", campus: "", outcome: "" }); // Reset the form
      } else {
        const data = await res.json();
        setError(data.message || "Error creating intake group.");
      }
    } catch (error) {
      console.error("Error creating intake group:", error);
      setError("Error creating intake group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Add Intake Group</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="p-2 border rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">
            Campus (comma-separated)
          </label>
          <input
            type="text"
            name="campus"
            value={form.campus}
            onChange={handleChange}
            required
            className="p-2 border rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">
            Outcome (comma-separated)
          </label>
          <input
            type="text"
            name="outcome"
            value={form.outcome}
            onChange={handleChange}
            required
            className="p-2 border rounded w-full"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded"
        >
          {loading ? "Creating..." : "Create Intake Group"}
        </Button>
      </form>
    </div>
  );
}
