import React, { useMemo } from 'react';
import {
  Box,
  Card,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Chip,
  Divider,
} from '@mui/material';

const QuizAssignment = ({ assignmentData, answers, onAnswerChange }) => {
  // ✅ Sử dụng useMemo để tránh re-render không cần thiết
  const { questions = [] } = useMemo(() => assignmentData || {}, [assignmentData]);

  const renderQuestionInput = (question) => {
    if (!question) return null;
    
    const questionId = question.AssignmentQuestionId;
    const currentAnswer = answers?.[questionId] || '';

    switch (question.Type) {
      case 'multiple_choice':
        return (
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={currentAnswer}
              onChange={(e) => onAnswerChange(questionId, e.target.value)}
            >
              {question.Options?.map((option) => (
                <FormControlLabel
                  key={option.OptionID}
                  value={option.OptionID?.toString()}
                  control={<Radio />}
                  label={option.Content || 'Không có nội dung'}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: currentAnswer === option.OptionID?.toString() 
                      ? 'primary.main' 
                      : 'divider',
                    bgcolor: currentAnswer === option.OptionID?.toString()
                      ? 'primary.light'
                      : 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'true_false':
        return (
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={currentAnswer}
              onChange={(e) => onAnswerChange(questionId, e.target.value)}
            >
              <FormControlLabel
                value="true"
                control={<Radio />}
                label="Đúng"
                sx={{
                  mb: 1,
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: currentAnswer === 'true' ? 'success.main' : 'divider',
                  bgcolor: currentAnswer === 'true' ? 'success.light' : 'background.paper',
                }}
              />
              <FormControlLabel
                value="false"
                control={<Radio />}
                label="Sai"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: currentAnswer === 'false' ? 'error.main' : 'divider',
                  bgcolor: currentAnswer === 'false' ? 'error.light' : 'background.paper',
                }}
              />
            </RadioGroup>
          </FormControl>
        );

      case 'fill_in_blank':
        return (
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Nhập câu trả lời của bạn..."
            value={currentAnswer}
            onChange={(e) => onAnswerChange(questionId, e.target.value)}
            sx={{ mt: 1 }}
          />
        );

      case 'essay':
        return (
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="Viết bài luận của bạn..."
            value={currentAnswer}
            onChange={(e) => onAnswerChange(questionId, e.target.value)}
            sx={{ mt: 1 }}
          />
        );

      case 'matching':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Nhập các cặp ghép đúng (định dạng JSON)..."
            value={currentAnswer}
            onChange={(e) => onAnswerChange(questionId, e.target.value)}
            helperText='Ví dụ: [{"left": "A", "right": "1"}, {"left": "B", "right": "2"}]'
            sx={{ mt: 1 }}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Nhập câu trả lời..."
            value={currentAnswer}
            onChange={(e) => onAnswerChange(questionId, e.target.value)}
            sx={{ mt: 1 }}
          />
        );
    }
  };

  const getLevelColor = (level) => {
    if (!level) return 'default';
    
    switch (level.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Không có câu hỏi nào
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {questions.map((question, index) => (
        <Card 
          key={question.QuestionID || index}
          sx={{ 
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 700,
            }}>
              {index + 1}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={question.Level || 'Không xác định'} 
                  color={getLevelColor(question.Level)}
                  size="small"
                />
                <Chip 
                  label={`${question.Point || 0} điểm`}
                  size="small"
                  variant="outlined"
                />
                {question.Topic && (
                  <Chip 
                    label={question.Topic}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>

          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
            {question.Content || 'Không có nội dung câu hỏi'}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {renderQuestionInput(question)}
        </Card>
      ))}

      <Box sx={{ 
        p: 2, 
        bgcolor: 'info.light', 
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'info.main'
      }}>
        <Typography variant="body2" color="info.dark">
          📝 Đã trả lời: {Object.keys(answers || {}).length}/{questions.length} câu hỏi
        </Typography>
      </Box>
    </Box>
  );
};

export default React.memo(QuizAssignment);