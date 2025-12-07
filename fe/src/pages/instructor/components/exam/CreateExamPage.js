import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExamWizard from "./ExamWizard";
import { getCoursesApi } from "../../../../apiServices/assignmentService";
import { createExamApi } from "../../../../apiServices/instructorExamService";

const CreateExamPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // React.useEffect(() => {
  //   const loadCourses = async () => {
  //     try {
  //       const data = await getCoursesApi();
  //       const formatted = (data || []).map((c, index) => {
  //         const id = c.value;

  //         if (id) {
  //           return {
  //             label: c.label || `Khóa học ${index + 1}`,
  //             value: `${id}-idx${index}`,
  //             originalId: id,
  //           };
  //         } else {
  //           const tempId = `temp-${Date.now()}-${index}`;
  //           return {
  //             label: c.label || `Khóa học ${index + 1}`,
  //             value: tempId,
  //             originalId: tempId,
  //           };
  //         }
  //       });
  //       setCourses(formatted);
  //     } catch (err) {
  //       setCourses([]);
  //     }
  //   };
  //   loadCourses();
  // }, []);

  const handleSave = async (examData) => {
    setLoading(true);
    setError("");

    try {
      const response = await createExamApi(examData);
      navigate("/instructor/exams", {
        state: {
          message: "Tạo bài thi thành công!",
          severity: "success"
        }
      });
    } catch (err) {

      toast.error(err.message || "Không thể tạo bài thi. Vui lòng thử lại!", {
        position: "top-right",
        autoClose: 2500,
      });

      setError(err.message || "Không thể tạo bài thi. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", py: 4 }}>
      <Container maxWidth={false} disableGutters>
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            onClick={() => navigate("/instructor/exams")}
            disabled={loading}
          >
            Quay lại danh sách
          </Button>
        </Box>

        {error && (
          <Box sx={{ mb: 3 }}>
            <Typography color="error" sx={{ p: 2, bgcolor: "#ffebee", borderRadius: 1 }}>
              ❌ {error}
            </Typography>
          </Box>
        )}

        <ExamWizard
          open={true}
          onClose={() => navigate("/instructor/exams")}
          onSave={handleSave}
          courses={[]}  // Không dùng course nữa
          mode="create"
        />
        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          theme="colored"
        />
      </Container>
    </Box>
  );
};

export default CreateExamPage;