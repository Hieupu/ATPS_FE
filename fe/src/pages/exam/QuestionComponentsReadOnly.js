import React from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
} from '@mui/icons-material';


const parseMatchingData = (correctAnswerString) => {
  try {
    const correctAnswer = JSON.parse(correctAnswerString);
    const items = Object.keys(correctAnswer);
    const options = Object.values(correctAnswer);

    return {
      items,
      options,
      correctAnswer,
    };
  } catch (err) {
    console.error('Error parsing matching data:', err);
    return { items: [], options: [], correctAnswer: {} };
  }
};


export const MultipleChoiceQuestionReadOnly = ({ question }) => {
  return (
    <RadioGroup value={question.learnerAnswer || ''}>
      {question.options?.map((option, index) => {
        const optionLabel = String.fromCharCode(65 + index);
        return (
          <FormControlLabel
            key={option.optionId}
            value={optionLabel}
            disabled
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{option.content}</span>

              </Box>
            }
          />
        );
      })}
    </RadioGroup>
  );
};

export const TrueFalseQuestionReadOnly = ({ question }) => {
  return (
    <RadioGroup value={question.learnerAnswer || ''}>
      {['True', 'False'].map((val) => {
        return (
          <FormControlLabel
            key={val}
            value={val}
            disabled
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{val}</span>
              </Box>
            }
          />
        );
      })}
    </RadioGroup>
  );
};

export const FillInBlankQuestionReadOnly = ({ question }) => {
  const blankCount = (question.content?.match(/_+/g) || []).length;

  const learnerAnswers = (() => {
    if (!question.learnerAnswer) return blankCount > 1 ? [] : '';
    try {
      const parsed = JSON.parse(question.learnerAnswer);
      return Array.isArray(parsed) ? parsed : question.learnerAnswer;
    } catch {
      return question.learnerAnswer;
    }
  })();

  const correctAnswers = (() => {
    if (!question.correctAnswer) return blankCount > 1 ? [] : '';
    try {
      const parsed = JSON.parse(question.correctAnswer);
      return Array.isArray(parsed) ? parsed : question.correctAnswer;
    } catch {
      return question.correctAnswer;
    }
  })();

  if (blankCount > 1) {
    return (
      <Box>
        {Array(blankCount).fill(0).map((_, index) => {
          const learnerAns = Array.isArray(learnerAnswers) ? learnerAnswers[index] : '';
          const correctAns = Array.isArray(correctAnswers) ? correctAnswers[index] : '';
          const isCorrect = learnerAns?.trim().toLowerCase() === correctAns?.trim().toLowerCase();

          return (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Chỗ trống {index + 1}
              </Typography>
              <TextField
                fullWidth
                value={learnerAns || ''}
                disabled
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isCorrect ? '#e8f5e9' : '#ffebee',
                  }
                }}
              />
              <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                {isCorrect && (
                  <Chip icon={<CheckCircle />} label="Đúng" color="success" size="small" />
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

  const isCorrect = learnerAnswers?.trim().toLowerCase() === correctAnswers?.trim().toLowerCase();

  return (
    <Box>
      <TextField
        fullWidth
        value={learnerAnswers || ''}
        disabled
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: isCorrect ? '#e8f5e9' : '#ffebee',
          }
        }}
      />
      <Box sx={{ mt: 1 }}>
        {isCorrect && (
          <Chip
            icon={<CheckCircle />}
            label="Đúng"
            color="success"
            size="small"
          />
        )}
      </Box>
    </Box>
  );
};


export const MatchingQuestionReadOnly = ({ question }) => {
  const matchingData = parseMatchingData(question.correctAnswer);
  const learnerMatches = (() => {
    if (!question.learnerAnswer) return {};
    try {
      return typeof question.learnerAnswer === 'string'
        ? JSON.parse(question.learnerAnswer)
        : question.learnerAnswer;
    } catch {
      return {};
    }
  })();

  if (matchingData.items.length === 0) {
    return <Alert severity="warning">Không có dữ liệu matching</Alert>;
  }

  return (
    <Box>
      {matchingData.items.map((item, index) => {
        const learnerChoice = learnerMatches[item] || '';
        const correctChoice = matchingData.correctAnswer[item] || '';
        const isCorrect = learnerChoice === correctChoice;

        return (
          <Box
            key={index}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 1,
              backgroundColor: isCorrect ? '#e8f5e9' : '#ffebee',
              border: '1px solid',
              borderColor: isCorrect ? 'success.main' : 'error.main',
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              {item}
            </Typography>

            <FormControl fullWidth size="small">
              <Select
                value={learnerChoice}
                disabled
                displayEmpty
              >
                <MenuItem value="">
                  <em>-- Chưa chọn --</em>
                </MenuItem>
                {matchingData.options.map((option, optIdx) => (
                  <MenuItem key={optIdx} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {isCorrect && (
                <Chip icon={<CheckCircle />} label="Đúng" color="success" size="small" />
              )}
            </Box>

          </Box>
        );
      })}
    </Box>
  );
};


export const EssayQuestionReadOnly = ({ question }) => {
  return (
    <Box>
      <TextField
        fullWidth
        multiline
        minRows={6}
        value={question.learnerAnswer || '(Chưa có câu trả lời)'}
        disabled
        variant="outlined"
        sx={{
          '& .MuiInputBase-root': {
            fontSize: '14px',
            lineHeight: 1.6,
          }
        }}
      />

    </Box>
  );
};


export const SpeakingQuestionReadOnly = ({ question }) => {
  const hasAudio = question.learnerAnswer && question.learnerAnswer.startsWith('http');

  return (
    <Box>
      {hasAudio ? (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            File ghi âm của bạn:
          </Alert>
          <audio controls src={question.learnerAnswer} style={{ width: '100%', marginBottom: 16 }} />
        </>
      ) : (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Chưa có file ghi âm
        </Alert>
      )}
    </Box>
  );
};



export const QuestionRendererReadOnly = ({ question }) => {
  const questionType = question.type?.toLowerCase();

  switch (questionType) {
    case 'multiple_choice':
      return <MultipleChoiceQuestionReadOnly question={question} />;

    case 'true_false':
      return <TrueFalseQuestionReadOnly question={question} />;

    case 'fill_in_blank':
      return <FillInBlankQuestionReadOnly question={question} />;

    case 'matching':
      return <MatchingQuestionReadOnly question={question} />;

    case 'essay':
      return <EssayQuestionReadOnly question={question} />;

    case 'speaking':
      return <SpeakingQuestionReadOnly question={question} />;

    default:
      return (
        <Alert severity="warning">
          Loại câu hỏi không được hỗ trợ: {questionType}
        </Alert>
      );
  }
};

export default {
  MultipleChoiceQuestionReadOnly,
  TrueFalseQuestionReadOnly,
  FillInBlankQuestionReadOnly,
  MatchingQuestionReadOnly,
  EssayQuestionReadOnly,
  SpeakingQuestionReadOnly,
  QuestionRendererReadOnly,
};