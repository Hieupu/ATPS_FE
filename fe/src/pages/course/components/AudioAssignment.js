import React from 'react';
import {
  Box,
  Card,
  Typography,
  Alert,
} from '@mui/material';
import QuizAssignment from './QuizAssignment';

const AudioAssignment = ({ assignmentData, answers, onAnswerChange }) => {
  const { assignment, questions } = assignmentData;
  const hasQuestions = questions && questions.length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Audio tài liệu */}
      {assignment.MediaURL ? (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            🎧 Audio tài liệu
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              {assignment.Title}
            </Typography>
            {assignment.Description && (
              <Typography variant="body2" color="text.secondary">
                {assignment.Description}
              </Typography>
            )}
          </Box>

          <audio 
            controls 
            style={{ 
              width: '100%',
              height: '50px',
              borderRadius: 8
            }}
          >
            <source src={assignment.MediaURL} type="audio/mpeg" />
            Trình duyệt của bạn không hỗ trợ audio.
          </audio>
        </Card>
      ) : (
        <Alert severity="info">
          Không có audio đính kèm. Vui lòng làm bài dựa trên nội dung mô tả.
        </Alert>
      )}

      {/* Phần câu hỏi */}
      {hasQuestions ? (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            📝 Câu hỏi bài tập
          </Typography>
          <QuizAssignment
            assignmentData={{ questions }}
            answers={answers}
            onAnswerChange={onAnswerChange}
          />
        </Card>
      ) : (
        <Alert severity="warning">
          Bài tập này không có câu hỏi. Vui lòng hoàn thành theo hướng dẫn trong audio.
        </Alert>
      )}
    </Box>
  );
};

export default AudioAssignment;