import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { getCourseCurriculumApi, getCourseAssignmentsApi} from "../../../apiServices/courseService";
import LessonPreviewDialog from './LessonPreviewDialog';
import CurriculumHeader from './CurriculumHeader';
import UnitAccordion from './UnitAccordion';

const CourseCurriculum = ({ courseId, isEnrolled }) => {
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
        isEnrolled ? getCourseAssignmentsApi(courseId) : Promise.resolve({ assignments: [] })
      ]);
      
      setCurriculum(curriculumData.curriculum || []);
      setAssignments(assignmentsData.assignments || []);
    } catch (err) {
      console.error('Error fetching curriculum:', err);
      setError(err.message || 'Không thể tải lộ trình học');
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

  const totalUnits = curriculum.length;
  const totalLessons = curriculum.reduce((total, unit) => total + (unit.Lessons?.length || 0), 0);
  const totalAssignments = assignments.length;
  const totalDuration = curriculum.reduce((total, unit) => {
    const unitDuration = unit.Lessons?.reduce((sum, lesson) => sum + (lesson.Time || 0), 0) || 0;
    return total + unitDuration;
  }, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <CircularProgress size={50} thickness={4} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Đang tải chương trình học...
        </Typography>
      </Box>
    );
  }

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
        totalUnits={totalUnits}
        totalLessons={totalLessons}
        totalAssignments={totalAssignments}
        totalDuration={totalDuration}
      />

      {curriculum.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Chưa có chương trình học cho khóa học này.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

      <LessonPreviewDialog
        open={previewOpen}
        onClose={handleClosePreview}
        lesson={previewItem}
      />
    </Box>
  );
};

export default CourseCurriculum;