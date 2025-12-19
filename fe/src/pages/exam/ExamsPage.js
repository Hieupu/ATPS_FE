import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Alert,
  CircularProgress,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  Quiz,
  AccessTime,
  CheckCircle,
  History,
  Refresh,
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/Header/AppHeader';
import {
  getAllExamInstancesApi,
  retryExamApi,
  hasRemainingAttempts,
  getRemainingAttempts,
} from '../../apiServices/learnerExamService';

const STATUS_COLOR_MAP = {
  Open: 'success',
  Scheduled: 'warning',
  Closed: 'error',
  Cancelled: 'default',
};

const STATUS_LABEL_MAP = {
  Open: 'Đang mở',
  Scheduled: 'Chưa đến giờ',
  Closed: 'Đã đóng',
  Cancelled: 'Đã hủy',
};

const TAB_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Cần làm' },
  { value: 'Closed', label: 'Đã đóng' },
];

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ExamsPage = () => {
  const navigate = useNavigate();

  const [tab, setTab] = useState('active');
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllExamInstancesApi();
      setInstances(data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách bài kiểm tra.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const filteredInstances = instances.filter((inst) => {
    if (tab === 'all') return true;
    if (tab === 'active') {
      return inst.status === 'Open' || inst.status === 'Scheduled';
    }
    if (tab === 'Closed') return inst.status === 'Closed';
    return true;
  });

  const handleRetry = async (instanceId) => {
    if (!window.confirm('Bạn có chắc muốn làm lại bài này?')) return;

    try {
      await retryExamApi(instanceId);
      navigate(`/exam/${instanceId}/take?retry=true`);
    } catch (err) {
      alert(err.message || 'Không thể reset bài tập này');
    }
  };

  const getAttemptStatus = (inst) => {
    if (!inst.usedAttempt && inst.usedAttempt !== 0) return null;

    const remaining = getRemainingAttempts(inst);
    const used = inst.usedAttempt || 0;
    const total = inst.attempt || 1;

    return {
      used,
      total,
      remaining,
      hasRemaining: hasRemainingAttempts(inst),
      isLastAttempt: remaining === 1,
      percentage: (used / total) * 100,
    };
  };

  return (
    <>
      <AppHeader />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>
            Bài kiểm tra của tôi
          </Typography>
        </Box>

        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
          {TAB_FILTERS.map((t) => (
            <Tab key={t.value} label={t.label} value={t.value} />
          ))}
        </Tabs>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && filteredInstances.length === 0 && (
          <Alert severity="info">Không có bài kiểm tra nào.</Alert>
        )}

        {!loading &&
          !error &&
          filteredInstances.map((inst) => {
            const attemptStatus = getAttemptStatus(inst);
            const isOpen = inst.status === 'Open';
            const hasSubmitted = (inst.usedAttempt || 0) > 0 && !inst.hasInProgressAnswers;
            const hasInProgress = !!inst.hasInProgressAnswers;
            const hasRemaining = attemptStatus?.hasRemaining || false;

            return (
              <Card
                key={inst.instanceId}
                sx={{
                  mb: 2,
                  borderLeft: 6,
                  borderColor: STATUS_COLOR_MAP[inst.status] || 'grey.500',
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Quiz sx={{ mr: 1 }} />
                        <Typography variant="h6" fontWeight={600}>
                          {inst.examTitle}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Lớp: {inst.className || '—'}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTime sx={{ mr: 1, fontSize: 18 }} />
                        <Typography variant="body2">
                          {formatDateTime(inst.startTime)} → {formatDateTime(inst.endTime)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        <Chip
                          label={STATUS_LABEL_MAP[inst.status] || inst.status}
                          color={STATUS_COLOR_MAP[inst.status] || 'default'}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        minWidth: 200,
                      }}
                    >
                      {isOpen && !hasSubmitted && !hasInProgress && hasRemaining && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => navigate(`/exam/${inst.instanceId}/take`)}
                        >
                          VÀO LÀM BÀI
                        </Button>
                      )}

                      {isOpen && !hasSubmitted && hasInProgress && hasRemaining && (
                        <Button
                          variant="contained"
                          color="info"
                          onClick={() => navigate(`/exam/${inst.instanceId}/take`)}
                        >
                          TIẾP TỤC LÀM
                        </Button>
                      )}

                      {isOpen && hasSubmitted && hasRemaining && (
                        <Button
                          variant="contained"
                          color="secondary"
                          startIcon={<Refresh />}
                          onClick={() => handleRetry(inst.instanceId)}
                        >
                          LÀM LẠI BÀI
                        </Button>
                      )}

             

                      {(isOpen || inst.status === 'Closed') && hasSubmitted && (
                        <Button
                          variant="outlined"
                          startIcon={<CheckCircle />}
                          onClick={() => navigate(`/exam/${inst.instanceId}/result`)}
                        >
                          XEM KẾT QUẢ
                        </Button>
                      )}

                      {inst.status === 'Closed' && !hasSubmitted && (
                        <Alert severity="warning" sx={{ p: 1 }}>
                          Chưa làm bài
                        </Alert>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
      </Container>
    </>
  );
};

export default ExamsPage;