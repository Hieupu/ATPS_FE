import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { formatDate } from './utils';

const SubmitAssignmentDialog = ({ 
  open, 
  onClose, 
  assignment, 
  onConfirm 
}) => {
  if (!assignment) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Nộp bài tập: {assignment.Title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          Tính năng nộp bài tập chi tiết sẽ được phát triển ở phiên bản tiếp theo.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Thông tin bài tập:
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Mô tả:</strong> {assignment.Description}
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Hạn nộp:</strong> {formatDate(assignment.Deadline)}
          </Typography>
          {assignment.MaxDuration && (
            <Typography variant="body2" paragraph>
              <strong>Thời gian tối đa:</strong> {assignment.MaxDuration} phút
            </Typography>
          )}
          {assignment.FileURL && (
            <Button
              startIcon={<Download />}
              component="a"
              href={assignment.FileURL}
              target="_blank"
              variant="outlined"
              size="small"
            >
              Tải đề bài
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={onConfirm}>
          Xác nhận nộp bài
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmitAssignmentDialog;