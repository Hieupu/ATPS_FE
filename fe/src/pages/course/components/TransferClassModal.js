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
  Collapse,
  IconButton,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const TransferClassModal = ({ 
  open, 
  onClose, 
  currentClass, 
  availableClasses, 
  onTransfer,
  loading 
}) => {
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [scheduleConflicts, setScheduleConflicts] = useState([]);
  const [openConflict, setOpenConflict] = useState(false);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedClassId(null);
      setScheduleConflicts([]);
      setOpenConflict(false);
      setTransferring(false);
    }
  }, [open]);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Format HH:mm
  };

  const getDayVietnamese = (day) => {
    const dayMap = {
      'Monday': 'Thứ 2',
      'Tuesday': 'Thứ 3', 
      'Wednesday': 'Thứ 4',
      'Thursday': 'Thứ 5',
      'Friday': 'Thứ 6',
      'Saturday': 'Thứ 7',
      'Sunday': 'Chủ nhật'
    };
    return dayMap[day] || day;
  };

  const handleTransfer = async () => {
    if (selectedClassId) {
      setTransferring(true);
      try {
        await onTransfer(currentClass.ClassID, selectedClassId);
      } catch (error) {
        // Kiểm tra nếu có conflict
        if (error.conflicts) {
          setScheduleConflicts(error.conflicts);
          setOpenConflict(true);
        }
      } finally {
        setTransferring(false);
      }
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

const getFormattedSchedule = (cls) => {
  if (!cls.weeklySchedule || cls.weeklySchedule.length === 0) {
    return 'Chưa có lịch';
  }
  
  const scheduleMap = {};
  cls.weeklySchedule.forEach(schedule => {
    const day = getDayVietnamese(schedule.Day);
    const time = `${formatTime(schedule.StartTime)}-${formatTime(schedule.EndTime)}`;
    if (!scheduleMap[day]) {
      scheduleMap[day] = [];
    }
    scheduleMap[day].push(time);
  });

  return Object.entries(scheduleMap)
    .map(([day, times]) => `${day}: ${times.join(', ')}`)
    .join('\n'); // Thay dấu ";" bằng "\n" để xuống dòng
};

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', md: 1000 },
        maxHeight: '90vh',
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
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Chuyển lớp học
          </Typography>
          {currentClass && (
            <Typography variant="body2" color="text.secondary">
              Lớp hiện tại: <strong>{currentClass.Name}</strong> | Giảng viên: {currentClass.InstructorName}
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
                Chọn lớp từ bảng dưới đây (chỉ hiển thị lớp có lịch học khác với các lớp bạn đang tham gia):
              </Typography>
              
              {/* Hiển thị conflict nếu có */}
              {scheduleConflicts.length > 0 && (
                <Alert 
                  severity="warning" 
                  sx={{ mb: 3 }}
                  action={
                    <IconButton
                      size="small"
                      onClick={() => setOpenConflict(!openConflict)}
                    >
                      {openConflict ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  }
                >
                  <Typography variant="subtitle2" fontWeight="medium">
                    ⚠️ Lịch học bị trùng!
                  </Typography>
                  <Collapse in={openConflict} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 1, pl: 1 }}>
                      {scheduleConflicts.map((conflict, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                          • <strong>{getDayVietnamese(conflict.day)}</strong>: 
                          {conflict.targetClass} ({formatTime(conflict.targetTime)}) trùng với 
                          {conflict.existingClass} ({formatTime(conflict.existingTime)})
                        </Typography>
                      ))}
                    </Box>
                  </Collapse>
                </Alert>
              )}
              
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
                        onClick={() => {
                          setSelectedClassId(cls.ClassID);
                          setScheduleConflicts([]);
                          setOpenConflict(false);
                        }}
                      >
                        <TableCell>
                          <Radio
                            checked={selectedClassId === cls.ClassID}
                            onChange={() => {
                              setSelectedClassId(cls.ClassID);
                              setScheduleConflicts([]);
                              setOpenConflict(false);
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {cls.Name || cls.ClassName}
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
                          <Typography variant="body2" sx={{ maxWidth: 250, lineHeight: 1.4 , whiteSpace: 'pre-line' }}>
                            {getFormattedSchedule(cls)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {cls.Opendate ? (
                            <Typography variant="body2">
                              {new Date(cls.Opendate).toLocaleDateString('vi-VN')}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Chưa có
                            </Typography>
                          )}
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
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                    <Typography variant="body2">
                      <strong>{availableClassesFiltered.find(c => c.ClassID === selectedClassId)?.Name || 
                               availableClassesFiltered.find(c => c.ClassID === selectedClassId)?.ClassName}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Giảng viên: {availableClassesFiltered.find(c => c.ClassID === selectedClassId)?.InstructorName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Sỉ số: {availableClassesFiltered.find(c => c.ClassID === selectedClassId)?.StudentCount || 0}/
                      {availableClassesFiltered.find(c => c.ClassID === selectedClassId)?.Maxstudent}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Lịch: {getFormattedSchedule(availableClassesFiltered.find(c => c.ClassID === selectedClassId))}
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
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box>
            {scheduleConflicts.length > 0 && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                ⚠️ Đã phát hiện {scheduleConflicts.length} trùng lịch
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              onClick={onClose} 
              variant="outlined"
              sx={{ minWidth: 100 }}
              disabled={transferring}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleTransfer}
              disabled={!selectedClassId || transferring || scheduleConflicts.length > 0}
              sx={{ minWidth: 140 }}
            >
              {transferring ? (
                <CircularProgress size={20} sx={{ color: 'white' }} />
              ) : (
                'Xác nhận chuyển lớp'
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default TransferClassModal;