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
import { createExamApi } from "../../../../apiServices/instructorExamService";

const CreateExamPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSave = async (examData) => {
    setLoading(true);
    setError("");

    try {
      const response = await createExamApi(examData);
      navigate("/instructor/exams", {
        state: {
          message: "Tạo bài tập thành công!",
          severity: "success"
        }
      });
    } catch (err) {

      toast.error(err.message || "Không thể tạo bài tập. Vui lòng thử lại!", {
        position: "top-right",
        autoClose: 2500,
      });

      setError(err.message || "Không thể tạo bài tập. Vui lòng thử lại.");
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
               {error}
            </Typography>
          </Box>
        )}

        <ExamWizard
          open={true}
          onClose={() => navigate("/instructor/exams")}
          onSave={handleSave}
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