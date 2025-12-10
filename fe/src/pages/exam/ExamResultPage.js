// pages/ExamResultPage.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  LinearProgress,
  Grid,
} from "@mui/material";
import {
  EmojiEvents,
  CheckCircle,
  Cancel,
  ArrowBack,
  Refresh,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import AppHeader from "../../components/Header/AppHeader";
import {
  getExamResultApi,
  retryExamApi,
} from "../../apiServices/learnerExamService";

const formatPercent = (val) => {
  if (val === null || val === undefined) return "—";
  const n = Number(val);
  if (Number.isNaN(n)) return val;
  return `${n.toFixed(2)}%`;
};

const ExamResultPage = () => {
  const { instanceId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState(null);

  const loadResult = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExamResultApi(instanceId);
      setResult(data);
    } catch (err) {
      setError(err.message || "Không thể tải kết quả bài thi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResult();
  }, [instanceId]);

  const handleRetry = async () => {
    if (!window.confirm("Bạn muốn làm lại bài thi này?")) return;
    try {
      setRetrying(true);
      await retryExamApi(instanceId);
      navigate(`/exam/${instanceId}/take`, { replace: true });
    } catch (err) {
      alert(err.message || "Không thể reset bài thi");
    } finally {
      setRetrying(false);
    }
  };

  const questions = result?.questions || [];

  return (
    <>
      <AppHeader />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/exam")}
          sx={{ mb: 2 }}
        >
          Quay lại
        </Button>

        {loading && (
          <Card>
            <CardContent>
              <Typography>Đang tải kết quả...</Typography>
            </CardContent>
          </Card>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && result && (
          <>
            {/* Summary */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <EmojiEvents sx={{ mr: 1 }} color="warning" />
                  <Typography variant="h6" fontWeight={600}>
                    {result.examTitle || result.instance?.examTitle}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Điểm
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {formatPercent(result.score)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Number(result.score) || 0}
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Số câu đúng
                    </Typography>
                    <Typography variant="h5">
                      {result.correctCount ?? "—"} /{" "}
                      {result.totalQuestions ?? "—"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tổng điểm
                    </Typography>
                    <Typography variant="h5">
                      {result.totalScore ?? "—"} / {result.maxScore ?? "—"}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={handleRetry}
                    disabled={retrying}
                  >
                    Làm lại bài thi
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Questions review */}
            {questions.length > 0 && (
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 2 }}
                  >
                    Chi tiết câu trả lời
                  </Typography>

                  {questions.map((q, idx) => {
                    const isCorrect = q.isCorrect;
                    const isObjective = [
                      "multiple_choice",
                      "true_false",
                      "fill_in_blank",
                    ].includes(q.type);
                    return (
                      <Box
                        key={q.examQuestionId || idx}
                        sx={{
                          mb: 2,
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: isCorrect
                            ? "success.main"
                            : "error.main",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1,
                            gap: 1,
                          }}
                        >
                          <Chip
                            label={`Câu ${idx + 1}`}
                            color={
                              isCorrect
                                ? "success"
                                : isObjective
                                ? "error"
                                : "default"
                            }
                            size="small"
                          />
                          {isCorrect ? (
                            <CheckCircle color="success" fontSize="small" />
                          ) : (
                            <Cancel color="error" fontSize="small" />
                          )}
                          <Typography variant="body2" color="text.secondary">
                            {q.point ?? 1} điểm
                          </Typography>
                        </Box>

                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {q.content}
                        </Typography>

                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Đáp án của bạn: </strong>
                          {q.learnerAnswer ?? <i>Không trả lời</i>}
                        </Typography>
                        {isObjective && (
                          <Typography variant="body2">
                            <strong>Đáp án đúng: </strong>
                            {q.correctAnswer}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default ExamResultPage;
