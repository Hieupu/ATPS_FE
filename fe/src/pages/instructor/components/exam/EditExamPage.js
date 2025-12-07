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
        const [examData, courseData] = await Promise.all([
          getExamDetailApi(examId),
          getCoursesApi(),
        ]);
        const sectionsData = await getSectionsApi(examId, true);
        for (const parentSection of sectionsData) {
          if (parentSection.childSections && parentSection.childSections.length > 0) {
            for (const childSection of parentSection.childSections) {
              try {
                const sectionDetail = await getSectionDetailApi(examId, childSection.SectionId);
                childSection.questions = sectionDetail.questions || [];
              } catch (err) {
                console.error(`  ❌ Error loading questions for section ${childSection.SectionId}:`, err);
                childSection.questions = [];
              }
            }
          }
        }

        examData.sections = sectionsData;
        const formattedCourses = (courseData || []).map((c, index) => {
          const id = c.value;

          if (id) {
            return {
              label: c.label || `Khóa học ${index + 1}`,
              value: `${id}-idx${index}`,
              originalId: id,
            };
          } else {
            const tempId = `temp-${Date.now()}-${index}`;
            return {
              label: c.label || `Khóa học ${index + 1}`,
              value: tempId,
              originalId: tempId,
            };
          }
        });
        if (examData && examData.CourseID) {
          const courseId = examData.CourseID;
          const matchedCourse = formattedCourses.find(
            (c) => c.originalId === courseId
          );

          if (matchedCourse) {
            examData.courseId = matchedCourse.value;
          } else {
            console.warn(
              "⚠️ Không tìm thấy course match với CourseID:",
              courseId
            );
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
  const handleSave = async (dataToSave) => {
    try {
      navigate("/instructor/exams", {
        state: {
          message: "Cập nhật bài thi thành công!",
          severity: "success",
        },
      });
    } catch (error) {
      navigate("/instructor/exams", {
        state: {
          message: "Có lỗi xảy ra khi cập nhật",
          severity: "error",
        },
      });
    }
  };

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
          onSave={handleSave}
          courses={courses}
          mode="edit"
          initialData={exam}
          examId={examId}
        />
      </Container>
    </Box>
  );
};

export default EditExamPage;
