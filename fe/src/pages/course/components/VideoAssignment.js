import React from 'react';
import {
  Box,
  Card,
  Typography,
} from '@mui/material';
import QuizAssignment from './QuizAssignment';

const VideoAssignment = ({ assignmentData, answers, onAnswerChange }) => {
  const { assignment, questions } = assignmentData;
  const hasQuestions = questions && questions.length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Video Media */}
      {assignment.MediaURL && (
        <Card sx={{ p: 3, bgcolor: 'info.50' }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            🎥 Video bài giảng
          </Typography>
          <Box sx={{ 
            position: 'relative',
            paddingTop: '56.25%', // 16:9 Aspect Ratio
            bgcolor: 'black',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <video 
              controls 
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            >
              <source src={assignment.MediaURL} />
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          </Box>
        </Card>
      )}

      {/* Audio fallback (nếu là audio) */}
      {assignment.MediaURL && assignment.Type === 'audio' && (
        <Card sx={{ p: 3, bgcolor: 'info.50' }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            🎧 Audio bài giảng
          </Typography>
          <audio controls style={{ width: '100%' }}>
            <source src={assignment.MediaURL} />
            Trình duyệt của bạn không hỗ trợ audio.
          </audio>
        </Card>
      )}

      {/* Description */}
      {assignment.Description && (
        <Card sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            📋 Mô tả bài tập
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
            {assignment.Description}
          </Typography>
        </Card>
      )}

      {/* Questions Section */}
      {hasQuestions && (
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
      )}
    </Box>
  );
};

export default React.memo(VideoAssignment);