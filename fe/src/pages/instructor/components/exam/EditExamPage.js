import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExamWizard from "./ExamWizard";

import {
  getExamDetailApi,
  getSectionsApi,
  getSectionDetailApi,
} from "../../../../apiServices/instructorExamService";

import { getCoursesApi } from "../../../../apiServices/assignmentService";

const EditExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = React.useState(null);
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        // Load exam info + course data
        const [examData, courseData] = await Promise.all([
          getExamDetailApi(examId),
          getCoursesApi(),
        ]);

        // Load section list
        const sectionsData = await getSectionsApi(examId, true);

        // Load questions inside each child section
        for (const parentSection of sectionsData) {
          if (parentSection.childSections?.length) {
            for (const childSection of parentSection.childSections) {
              try {
                const detail = await getSectionDetailApi(
                  examId,
                  childSection.SectionId
                );
                childSection.questions = detail.questions || [];
              } catch (err) {
                console.error(
                  `❌ Error loading questions for section ${childSection.SectionId}:`,
                  err
                );
                childSection.questions = [];
              }
            }
          }
        }

        examData.sections = sectionsData;

        // Format courses
        const formattedCourses = (courseData || []).map((c, index) => {
          const id = c.value;
          return id
            ? {
                label: c.label || `Khóa học ${index + 1}`,
                value: `${id}-idx${index}`,
                originalId: id,
              }
            : {
                label: c.label || `Khóa học ${index + 1}`,
                value: `temp-${Date.now()}-${index}`,
                originalId: null,
              };
        });

        // Auto-select the exam's course
        if (examData.CourseID) {
          const found = formattedCourses.find(
            (c) => c.originalId === examData.CourseID
          );
          if (found) {
            examData.courseId = found.value;
          } else {
            console.warn("⚠ Course not found for CourseID:", examData.CourseID);
          }
        }

        setExam(examData);
        setCourses(formattedCourses);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [examId]);

  // Loading UI
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Not found
  if (!exam) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">Không tìm thấy bài thi!</Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/instructor/exams")}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  // Render Edit Wizard
  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", py: 4 }}>
      <Container
        maxWidth={false}
        disableGutters
        sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={() => navigate("/instructor/exams")}
          >
            Quay lại danh sách
          </Button>
        </Box>
        <ExamWizard
          open={true}
          onClose={() => navigate("/instructor/exams")}
          exam={exam}      
        />
      </Container>
    </Box>
  );
};

export default EditExamPage;
