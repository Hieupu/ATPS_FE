import React, { useState } from "react";
import { Box, Tabs, Tab, Typography, CircularProgress } from "@mui/material";
import CourseHeader from "./CourseHeader";
import CurriculumSection from "./CurriculumSection";
import MaterialsSection from "./MaterialsSection";

export default function CourseBuilderLayout({
  course,
  loadingCourse,
  units,
  loadingUnits,
  lessonsByUnit,
  loadingLessons,
  materials,
  loadingMaterials,
  onUpdateCourseMeta,
  onSubmitCourse,
  onCreateUnit,
  onUpdateUnit,
  onDeleteUnit,
  onReorderUnits,
  onLoadLessons,
  onCreateLesson,
  onUpdateLesson,
  onDeleteLesson,
  onReorderLessons,
  onCreateMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
}) {
  const [tab, setTab] = useState("curriculum");

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  if (loadingCourse && !course) {
    return (
      <Box
        sx={{
          p: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Không tìm thấy khóa học.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <CourseHeader
        course={course}
        onUpdateCourseMeta={onUpdateCourseMeta}
        onSubmitCourse={onSubmitCourse}
      />

      <Box sx={{ mt: 3, borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={handleChangeTab}>
          <Tab label="Chương Trình" value="curriculum" />
          <Tab label="Tài Liệu" value="materials" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        {tab === "curriculum" && (
          <CurriculumSection
            units={units}
            loadingUnits={loadingUnits}
            lessonsByUnit={lessonsByUnit}
            loadingLessons={loadingLessons}
            onCreateUnit={onCreateUnit}
            onUpdateUnit={onUpdateUnit}
            onDeleteUnit={onDeleteUnit}
            onReorderUnits={onReorderUnits}
            onLoadLessons={onLoadLessons}
            onCreateLesson={onCreateLesson}
            onUpdateLesson={onUpdateLesson}
            onDeleteLesson={onDeleteLesson}
            onReorderLessons={onReorderLessons}
          />
        )}
        {tab === "materials" && (
          <MaterialsSection
            materials={materials}
            loadingMaterials={loadingMaterials}
            onCreateMaterial={onCreateMaterial}
            onUpdateMaterial={onUpdateMaterial}
            onDeleteMaterial={onDeleteMaterial}
          />
        )}
      </Box>
    </Box>
  );
}
