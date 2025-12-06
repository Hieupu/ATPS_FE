import { useState, useMemo } from "react";

export function useAssignmentFilter(assignments) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    course: "all"
  });

  // Calculate stats
  const stats = useMemo(() => {
    const byType = {
      quiz: 0,
      audio: 0,
      video: 0,
      document: 0
    };

    assignments.forEach(a => {
      const status = (a.Status || "").toLowerCase();
      if (status === "deleted") return;
      const type = (a.Type || "").toLowerCase();
      if (type === "quiz") byType.quiz++;
      else if (type === "audio") byType.audio++;
      else if (type === "video") byType.video++;
      else if (type === "document") byType.document++;
    });

    return byType;
  }, [assignments]);

  // Filter assignments
  const filtered = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    return assignments.filter(a => {
      // Search filter
      const titleMatch = (a.Title || "").toLowerCase().includes(term);
      const courseMatch = (a.CourseTitle || "").toLowerCase().includes(term);
      if (term && !titleMatch && !courseMatch) return false;

      // Type filter
      if (filters.type !== "all") {
        const type = (a.Type || "").toLowerCase();
        if (type !== filters.type) return false;
      }

      // Status filter
      if (filters.status !== "all") {
        const status = (a.Status || "").toLowerCase();
        if (status !== filters.status) return false;
      }

      // Course filter
      if (filters.course !== "all") {
        if (a.CourseID !== parseInt(filters.course)) return false;
      }

      // Hide deleted
      if ((a.Status || "").toLowerCase() === "deleted") return false;

      return true;
    });
  }, [assignments, searchQuery, filters]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    stats,
    filtered
  };
}