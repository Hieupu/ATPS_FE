import React, { useMemo } from "react";
import { Box, Card, Typography } from "@mui/material";
import QuizAssignment from "./QuizAssignment";

const VideoAssignment = ({ assignmentData, answers, onAnswerChange }) => {
  const { assignment, questions } = assignmentData;
  const hasQuestions = questions && questions.length > 0;

  const isAudioFile = useMemo(() => {
    if (!assignment.MediaURL) return false;
    return (
      assignment.MediaURL.toLowerCase().endsWith(".mp3") ||
      assignment.Type === "audio"
    );
  }, [assignment.MediaURL, assignment.Type]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {assignment.MediaURL && (
        <Card sx={{ p: 3, bgcolor: "grey.50" }}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {isAudioFile ? "🎧 File nghe" : "🎥 Video bài giảng"}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              bgcolor: isAudioFile ? "transparent" : "black",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {isAudioFile ? (
              <audio controls style={{ width: "100%" }}>
                <source src={assignment.MediaURL} />
                Trình duyệt của bạn không hỗ trợ audio.
              </audio>
            ) : (
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  paddingTop: "56.25%",
                }}
              >
                <video
                  controls
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <source src={assignment.MediaURL} />
                  Trình duyệt của bạn không hỗ trợ video.
                </video>
              </Box>
            )}
          </Box>
        </Card>
      )}

      {assignment.Description && (
        <Card sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
            📋 Mô tả bài tập
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "pre-wrap" }}
          >
            {assignment.Description}
          </Typography>
        </Card>
      )}

      {hasQuestions && (
        <Box>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}
          >
            📝 Câu hỏi bài tập
          </Typography>

          <QuizAssignment
            assignmentData={{ questions: questions }}
            answers={answers}
            onAnswerChange={onAnswerChange}
          />
        </Box>
      )}
    </Box>
  );
};

export default React.memo(VideoAssignment);
