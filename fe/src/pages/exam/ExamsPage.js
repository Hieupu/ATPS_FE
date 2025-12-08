// pages/ExamsPage.js
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
} from '@mui/material';
import {
  Quiz,
  AccessTime,
  CheckCircle,
  History,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/Header/AppHeader';
import {
  getAllExamInstancesApi,
  retryExamApi
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
  { value: 'Open', label: 'Đang mở' },
  { value: 'Scheduled', label: 'Chưa đến giờ' },
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
  const [tab, setTab] = useState('all');
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getAllExamInstancesApi();
      setInstances(data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách bài thi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredInstances = instances.filter((inst) => {
    if (tab === 'all') return true;
    return inst.status === tab;
  });

  const handleRetry = async (instanceId) => {
    if (!window.confirm("Bạn có chắc muốn làm lại bài thi?")) return;

    try {
      await retryExamApi(instanceId);
      navigate(`/exam/${instanceId}/take`);
    } catch (err) {
      alert(err.message || "Không thể reset bài thi");
    }
  };

  return (
    <>
      <AppHeader />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>
            Bài kiểm tra của tôi
          </Typography>
          <Button
            startIcon={<History />}
            variant="outlined"
            size="small"
            onClick={() => navigate('/exams/history')}
          >
            Lịch sử làm bài
          </Button>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{ mb: 3 }}
        >
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

        {!loading && !error && filteredInstances.map((inst) => {
          const isSubmitted = inst.isSubmitted === true || inst.status === "Closed";

          return (
            <Card
              key={inst.instanceId}
              sx={{
                mb: 2,
                borderLeft: 6,
                borderColor: STATUS_COLOR_MAP[inst.status] || 'default',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  
                  {/* LEFT SIDE */}
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

                    <Chip
                      label={STATUS_LABEL_MAP[inst.status] || inst.status}
                      color={STATUS_COLOR_MAP[inst.status] || 'default'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`Lượt làm tối đa: ${inst.attempt}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {/* RIGHT SIDE BUTTONS */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 200 }}>

                    {inst.status === "Open" && !isSubmitted && (
                      <Button
                        variant="contained"
                        onClick={() => navigate(`/exam/${inst.instanceId}/take`)}
                      >
                        Vào làm bài
                      </Button>
                    )}

                    {isSubmitted && (
                      <Button
                        variant="contained"
                        startIcon={<Refresh />}
                        onClick={() => handleRetry(inst.instanceId)}
                      >
                        Làm lại bài thi
                      </Button>
                    )}

                    <Button
                      variant="outlined"
                      startIcon={<CheckCircle />}
                      onClick={() => navigate(`/exam/${inst.instanceId}/result`)}
                    >
                      Xem kết quả
                    </Button>
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
