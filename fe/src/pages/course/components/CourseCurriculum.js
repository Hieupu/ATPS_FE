import React, { useState, useEffect, useCallback } from "react";
import { Box, Alert, CircularProgress, Typography } from "@mui/material";
import {
  getCourseCurriculumApi,
  getCourseAssignmentsApi,
} from "../../../apiServices/courseService";
import LessonPreviewDialog from "./LessonPreviewDialog";
import CurriculumHeader from "./CurriculumHeader";
import UnitAccordion from "./UnitAccordion";

const CourseCurriculum = ({ courseId, isEnrolled, courseData }) => {
  const [curriculum, setCurriculum] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const fetchCurriculum = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      const [curriculumData, assignmentsData] = await Promise.all([
        getCourseCurriculumApi(courseId),
        isEnrolled
          ? getCourseAssignmentsApi(courseId)
          : Promise.resolve({ assignments: [] }),
      ]);

      setCurriculum(curriculumData.curriculum || []);
      setAssignments(assignmentsData.assignments || []);
    } catch (err) {
      console.error("Error fetching curriculum:", err);
      setError(err.message || "Không thể tải lộ trình học");
    } finally {
      setLoading(false);
    }
  }, [courseId, isEnrolled]);

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  const handleViewMaterial = (lesson) => {
    setPreviewItem(lesson);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewItem(null);
  };

  const handleRefresh = () => {
    fetchCurriculum();
  };

  const calcUnits = curriculum.length;
  const calcLessons = curriculum.reduce(
    (total, unit) => total + (unit.Lessons?.length || 0),
    0
  );
  const calcAssignments = assignments.length;
  const calcDuration = curriculum.reduce((total, unit) => {
    const unitDuration =
      unit.Lessons?.reduce((sum, lesson) => sum + (lesson.Time || 0), 0) || 0;
    return total + unitDuration;
  }, 0);

  const displayUnits = courseData?.TotalUnits ?? calcUnits;
  const displayLessons = courseData?.TotalLessons ?? calcLessons;
  const displayAssignments = courseData?.TotalAssignments ?? calcAssignments;
  const displayDuration = courseData?.TotalDuration ?? calcDuration;

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <CurriculumHeader
        courseData={courseData}
        totalUnits={displayUnits}
        totalLessons={displayLessons}
        totalAssignments={displayAssignments}
        totalDuration={displayDuration}
      />

      {loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 8,
          }}
        >
          <CircularProgress size={40} thickness={4} sx={{ color: "#0056d2" }} />
          <Typography
            variant="body2"
            sx={{ mt: 2, color: "#666", fontWeight: 500 }}
          >
            Đang tải nội dung chi tiết...
          </Typography>
        </Box>
      ) : (
        <>
          {curriculum.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Chưa có chương trình học cho khóa học này.
            </Alert>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {curriculum.map((unit, unitIndex) => (
                <UnitAccordion
                  key={unit.UnitID}
                  unit={unit}
                  unitIndex={unitIndex}
                  assignments={assignments}
                  isEnrolled={isEnrolled}
                  onViewMaterial={handleViewMaterial}
                  onRefresh={handleRefresh}
                />
              ))}
            </Box>
          )}
        </>
      )}

      <LessonPreviewDialog
        open={previewOpen}
        onClose={handleClosePreview}
        lesson={previewItem}
      />
    </Box>
  );
};

export default CourseCurriculum;
