"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";
import {
  getAllIntakeGroups,
  createIntakeGroup,
  updateIntakeGroup,
  deleteIntakeGroup,
} from "@/lib/actions/intakegroup/intakeGroups";

interface IntakeGroup {
  id: string;
  title: string;
}

const IntakeGroupManager = () => {
  const [intakeGroups, setIntakeGroups] = useState<IntakeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [editingGroup, setEditingGroup] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const groups = await getAllIntakeGroups();
      setIntakeGroups(groups);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load intake groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupTitle.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await createIntakeGroup(newGroupTitle);
      setNewGroupTitle("");
      await fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      setError("Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGroup = async (id: string, newTitle: string) => {
    if (!newTitle.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await updateIntakeGroup(id, newTitle);
      setEditingGroup(null);
      await fetchGroups();
    } catch (error) {
      console.error("Error updating group:", error);
      setError("Failed to update group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (
      !window.confirm("Are you sure you want to delete this group?") ||
      isSubmitting
    )
      return;

    try {
      setIsSubmitting(true);
      await deleteIntakeGroup(id);
      await fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      setError("Failed to delete group");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Intake Groups</h2>

          {/* Create new group form */}
          <form onSubmit={handleCreateGroup} className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newGroupTitle}
              onChange={(e) => setNewGroupTitle(e.target.value)}
              placeholder="Enter new group title"
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isSubmitting || !newGroupTitle.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Group
            </Button>
          </form>

          {/* List of groups */}
          <div className="space-y-2">
            {intakeGroups.length === 0 ? (
              <p className="text-gray-500">No intake groups found.</p>
            ) : (
              intakeGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  {editingGroup?.id === group.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="text"
                        value={editingGroup.title}
                        onChange={(e) =>
                          setEditingGroup({
                            ...editingGroup,
                            title: e.target.value,
                          })
                        }
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          handleUpdateGroup(group.id, editingGroup.title)
                        }
                        disabled={isSubmitting}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingGroup(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1">{group.title}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setEditingGroup({
                              id: group.id,
                              title: group.title,
                            })
                          }
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntakeGroupManager;
