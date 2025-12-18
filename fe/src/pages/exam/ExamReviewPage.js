import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Fullscreen,
  FullscreenExit,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getExamReviewApi } from '../../apiServices/learnerExamService';
import { loadFileAsHtml } from '../../utils/fileToHtml';
import { QuestionRendererReadOnly } from './QuestionComponentsReadOnly';
import './ExamTaking.css';

const QuestionCardReadOnly = ({ question, number }) => {
  const result = question.isCorrect === true ? 'correct' : question.isCorrect === false ? 'wrong' : 'pending';

  return (
    <Card
      className="question-card"
      sx={{
        mb: 2,
        borderLeft: 4,
        borderColor:
          result === 'correct' ? 'success.main' :
          result === 'wrong' ? 'error.main' :
          'warning.main',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Chip
            label={`Question ${number}`}
            color="primary"
            size="small"
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={`${question.point || 0} point${question.point > 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
            />
            {result === 'correct' && (
              <Chip
                icon={<CheckCircle />}
                label="Đúng"
                color="success"
                size="small"
              />
            )}
            {result === 'wrong' && (
              <Chip
                icon={<Cancel />}
                label="Sai"
                color="error"
                size="small"
              />
            )}
            {result === 'pending' && (
              <Chip
                label="Chờ chấm"
                color="warning"
                size="small"
              />
            )}
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
          {question.content}
        </Typography>

        <QuestionRendererReadOnly question={question} />
      </CardContent>
    </Card>
  );
};

const ExamReviewPage = () => {
  const { instanceId } = useParams();
  const navigate = useNavigate();

  const [reviewData, setReviewData] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [activeChildSection, setActiveChildSection] = useState(null);
  const [htmlPassage, setHtmlPassage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [leftWidth, setLeftWidth] = useState(42);
  const containerRef = useRef(null);
  const leftPaneRef = useRef(null);
  const rightPaneRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    loadReview();
  }, [instanceId]);

  const loadReview = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getExamReviewApi(instanceId);
      console.log('Review data:', data);

      setReviewData(data);
      setSections(data.sections || []);
      if (data.sections && data.sections.length > 0) {
        const firstSection = data.sections[0];
        setActiveSection(firstSection);

        if (firstSection.childSections && firstSection.childSections.length > 0) {
          const firstChild = firstSection.childSections[0];
          setActiveChildSection(firstChild);

          if (firstChild.FileURL) {
            const html = await loadFileAsHtml(firstChild.FileURL);
            setHtmlPassage(html);
          }
        }
      }
    } catch (err) {
      console.error('Load review error:', err);
      setError(err.message || 'Không thể tải review');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = async (section) => {
    setActiveSection(section);

    if (section.childSections && section.childSections.length > 0) {
      const firstChild = section.childSections[0];
      setActiveChildSection(firstChild);

      if (firstChild.FileURL) {
        const html = await loadFileAsHtml(firstChild.FileURL);
        setHtmlPassage(html);
      } else {
        setHtmlPassage('');
      }
    }
  };

  const handleChildTabClick = async (childSectionId) => {
    const child = activeSection.childSections?.find(
      c => c.childSectionId === childSectionId
    );

    if (child) {
      setActiveChildSection(child);

      if (child.FileURL) {
        const html = await loadFileAsHtml(child.FileURL);
        setHtmlPassage(html);
      } else {
        setHtmlPassage('');
      }
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const startDragging = () => {
    dragging.current = true;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', stopDragging);
  };

  const stopDragging = () => {
    dragging.current = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', stopDragging);
  };

  const onMouseMove = (e) => {
    if (!dragging.current || !containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const newLeftWidth = (e.clientX / containerWidth) * 100;
    if (newLeftWidth > 20 && newLeftWidth < 80) {
      setLeftWidth(newLeftWidth);
    }
  };

 
  const calculatePercentage = () => {
    if (!reviewData?.summary) return 0;
    const { totalEarnedPoints, totalMaxPoints } = reviewData.summary;
    if (totalMaxPoints === 0) return 0;
    return Math.round((totalEarnedPoints / totalMaxPoints) * 100);
  };

  return (
    <>
      <Box>
        <Snackbar
          open={showError}
          autoHideDuration={6000}
          onClose={() => setShowError(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setShowError(false)}
            severity="error"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 0,
          px: 2,
          py: 1.5,
          background: '#fff',
          borderBottom: '1px solid #ddd'
        }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
            Quay lại
          </Button>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {sections.map((section, idx) => {
              const sectionType = section.childSections?.[0]?.type || section.type || `Section ${idx + 1}`; 
              return (
                <Button
                  key={section.sectionId || idx}
                  variant={activeSection?.sectionId === section.sectionId ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleSectionChange(section)}
                >
                  {sectionType.toUpperCase()}
                </Button>
              );
            })}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {reviewData && reviewData.summary && (
              <Chip
                label={`Điểm: ${calculatePercentage()}%`}
                color="primary"
                variant="outlined"
              />
            )}

            <Button
              variant="outlined"
              color="primary"
              onClick={toggleFullscreen}
              sx={{ minWidth: 'auto', px: 1.5 }}
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          reviewData && (
            <>
              <Box
                ref={containerRef}
                sx={{
                  display: 'flex',
                  width: '100%',
                  height: 'calc(100vh - 120px)',
                  mt: 0,
                  overflow: 'hidden',
                  background: '#fff',
                }}
              >
                <Box
                  ref={leftPaneRef}
                  className="scroll-panel"
                  sx={{
                    width: `${leftWidth}%`,
                    borderRight: '1px solid #ccc',
                    background: '#fafafa',
                    p: 3,
                  }}
                >
                  {htmlPassage ? (
                    <div dangerouslySetInnerHTML={{ __html: htmlPassage }} />
                  ) : (
                    <Typography color="text.secondary">No passage content</Typography>
                  )}
                </Box>
                <Box
                  onMouseDown={startDragging}
                  sx={{
                    width: '5px',
                    cursor: 'col-resize',
                    background: '#ddd',
                    '&:hover': { background: '#999' },
                  }}
                />
                <Box
                  ref={rightPaneRef}
                  className="scroll-panel"
                  sx={{
                    width: `${100 - leftWidth}%`,
                    p: 3,
                    pb: 10, 
                  }}
                >
                  {activeChildSection?.questions?.length > 0 ? (
                    activeChildSection.questions.map((q, idx) => (
                      <Box key={q.examQuestionId} id={`q_${q.examQuestionId}`}>
                        <QuestionCardReadOnly
                          question={q}
                          number={idx + 1}
                        />
                      </Box>
                    ))
                  ) : (
                    <Alert severity="info">Không có câu hỏi</Alert>
                  )}
                </Box>
              </Box>
              <Box
                sx={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  py: 1.5,
                  borderTop: '1px solid #ddd',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                  background: '#fff',
                  boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                }}
              >
                {activeSection?.childSections?.map((child) => (
                  <Button
                    key={child.childSectionId}
                    variant={
                      activeChildSection?.childSectionId === child.childSectionId
                        ? 'contained'
                        : 'outlined'
                    }
                    color="primary"
                    onClick={() => handleChildTabClick(child.childSectionId)}
                    size="small"
                  >
                    Part {child.orderIndex + 1}
                  </Button>
                ))}

                {activeChildSection?.questions?.length > 0 && (
                  <Box sx={{ width: '2px', height: '32px', background: '#ddd', mx: 1 }} />
                )}
                {activeChildSection?.questions?.map((q, idx) => (
                  <Button
                    key={q.examQuestionId}
                    variant={q.learnerAnswer ? 'contained' : 'outlined'}
                    color={
                      q.isCorrect === true ? 'success' :
                      q.isCorrect === false ? 'error' :
                      q.learnerAnswer ? 'warning' : 'primary'
                    }
                    sx={{ minWidth: 40 }}
                    size="small"
                    onClick={() =>
                      document
                        .getElementById(`q_${q.examQuestionId}`)
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }
                  >
                    {idx + 1}
                  </Button>
                ))}
              </Box>
            </>
          )
        )}
      </Box>
    </>
  );
};

export default ExamReviewPage;