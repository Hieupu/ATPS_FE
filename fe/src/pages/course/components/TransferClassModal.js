// components/Course/TransferClassModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Radio,
  Chip,
} from '@mui/material';

const TransferClassModal = ({ 
  open, 
  onClose, 
  currentClass, 
  availableClasses, 
  onTransfer,
  loading 
}) => {
  const [selectedClassId, setSelectedClassId] = useState(null);

  useEffect(() => {
    if (open) {
      setSelectedClassId(null);
    }
  }, [open]);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getDayAbbreviation = (day) => {
    const dayMap = {
      'Monday': 'T2',
      'Tuesday': 'T3', 
      'Wednesday': 'T4',
      'Thursday': 'T5',
      'Friday': 'T6',
      'Saturday': 'T7',
      'Sunday': 'CN'
    };
    return dayMap[day] || day;
  };

  const handleTransfer = () => {
    if (selectedClassId) {
      onTransfer(currentClass.ClassID, selectedClassId);
    }
  };

  const availableClassesFiltered = availableClasses.filter(
    cls => cls.ClassID !== currentClass?.ClassID && cls.Status === 'ACTIVE'
  );

  const getStatusColor = (studentCount, maxStudents) => {
    if (studentCount >= maxStudents) return 'error';
    if (studentCount >= maxStudents * 0.8) return 'warning';
    return 'success';
  };

  const getStatusText = (studentCount, maxStudents) => {
    if (studentCount >= maxStudents) return 'Đã đầy';
    if (studentCount >= maxStudents * 0.8) return 'Sắp đầy';
    return 'Còn chỗ';
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', md: 900 },
        maxHeight: '85vh',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <Box sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Chuyển lớp học
            </Typography>
          </Box>
          {currentClass && (
            <Typography variant="body2" color="text.secondary">
              Lớp hiện tại: <strong>{currentClass.ClassName}</strong>
            </Typography>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : availableClassesFiltered.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Không có lớp nào khả dụng để chuyển
            </Alert>
          ) : (
            <>
              <Typography variant="subtitle2" sx={{ mb: 3, color: 'text.secondary' }}>
                Chọn lớp từ bảng dưới đây:
              </Typography>
              
              <TableContainer 
                component={Paper} 
                variant="outlined"
                sx={{ 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  maxHeight: 400,
                }}
              >
                <Table stickyHeader size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell width="50px" sx={{ fontWeight: 600 }}>Chọn</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tên lớp</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Giảng viên</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Sỉ số</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Lịch học</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Khai giảng</TableCell>
      
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableClassesFiltered.map((cls) => (
                      <TableRow 
                        key={cls.ClassID}
                        hover
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          bgcolor: selectedClassId === cls.ClassID ? 'action.selected' : 'inherit'
                        }}
                        onClick={() => setSelectedClassId(cls.ClassID)}
                      >
                        <TableCell>
                          <Radio
                            checked={selectedClassId === cls.ClassID}
                            onChange={() => setSelectedClassId(cls.ClassID)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {cls.ClassName}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {cls.InstructorName}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {cls.StudentCount || 0}/{cls.Maxstudent}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(cls.StudentCount || 0, cls.Maxstudent)}
                            size="small"
                            color={getStatusColor(cls.StudentCount || 0, cls.Maxstudent)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {cls.weeklySchedule && cls.weeklySchedule.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {cls.weeklySchedule.slice(0, 2).map((schedule, idx) => (
                                <Typography key={idx} variant="caption" component="div">
                                  {getDayAbbreviation(schedule.Day)} {formatTime(schedule.StartTime)}-{formatTime(schedule.EndTime)}
                                </Typography>
                              ))}
                              {cls.weeklySchedule.length > 2 && (
                                <Typography variant="caption" color="text.secondary">
                                  +{cls.weeklySchedule.length - 2} buổi khác
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Chưa có lịch
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {cls.Opendate ? (
                            <Typography variant="body2">
                              {new Date(cls.Opendate).toLocaleDateString('vi-VN')}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Chưa cập nhật
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Thông tin lớp được chọn */}
              {selectedClassId && (
                <Box sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Lớp đã chọn:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2">
                      <strong>{availableClassesFiltered.find(c => c.ClassID === selectedClassId)?.ClassName}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Giảng viên: {availableClassesFiltered.find(c => c.ClassID === selectedClassId)?.InstructorName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Sỉ số: {availableClassesFiltered.find(c => c.ClassID === selectedClassId)?.StudentCount || 0}/{availableClassesFiltered.find(c => c.ClassID === selectedClassId)?.Maxstudent}
                    </Typography>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{
          p: 2.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
        }}>
          <Button 
            onClick={onClose} 
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleTransfer}
            disabled={!selectedClassId || loading}
            sx={{ minWidth: 140 }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : (
              'Xác nhận chuyển lớp'
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default TransferClassModal;