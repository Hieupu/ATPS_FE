import React from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
} from '@mui/material';
import {
  Description,
  PictureAsPdf,
  Article,
} from '@mui/icons-material';
import QuizAssignment from './QuizAssignment';

const DocumentAssignment = ({ assignmentData, answers, onAnswerChange }) => {
  const { assignment, questions } = assignmentData;
  const hasQuestions = questions && questions.length > 0;

  const getFileIcon = () => {
    if (!assignment.FileURL) return <Description />;
    
    const ext = assignment.FileURL.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <PictureAsPdf />;
    return <Article />;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Document Section */}
      {assignment.FileURL && (
        <Card sx={{ p: 3, bgcolor: 'info.50' }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            📚 Tài liệu bài học
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={getFileIcon()}
              href={assignment.FileURL}
              target="_blank"
              rel="noopener noreferrer"
              size="large"
            >
              Xem tài liệu
            </Button>
            <Button
              variant="outlined"
              href={assignment.FileURL}
              download
            >
              Tải xuống
            </Button>
          </Box>
        </Card>
      )}

      {/* Description */}
      {assignment.Description && (
        <Card sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            📋 Yêu cầu bài tập
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
            {assignment.Description}
          </Typography>
        </Card>
      )}

      {/* Questions Section */}
      {hasQuestions ? (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            📝 Câu hỏi bài tập
          </Typography>
          <QuizAssignment
            assignmentData={{ questions }}
            answers={answers}
            onAnswerChange={onAnswerChange}
          />
        </Box>
      ) : (
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Không có câu hỏi cho bài tập này. Vui lòng đọc tài liệu và hoàn thành theo yêu cầu.
          </Typography>
        </Card>
      )}
    </Box>
  );
};

export default React.memo(DocumentAssignment);