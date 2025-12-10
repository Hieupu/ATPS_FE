import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Pagination,
  Stack,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment,
} from "@mui/material";
import {
  Email,
  Search,
  Visibility,
  CheckCircle,
  Cancel,
  Schedule,
  Error as ErrorIcon,
} from "@mui/icons-material";
import emailLogService from "../../../apiServices/emailLogService";
import emailTemplateService from "../../../apiServices/emailTemplateService";

const PAGE_SIZE = 10;

const STATUS_COLORS = {
  PENDING: { color: "#f59e0b", label: "Đang chờ" },
  SENT: { color: "#10b981", label: "Đã gửi" },
  FAILED: { color: "#ef4444", label: "Thất bại" },
  BOUNCED: { color: "#8b5cf6", label: "Bị trả lại" },
};

export default function EmailLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  // Input states (chưa apply)
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState("all");
  const [templateInput, setTemplateInput] = useState("all");
  // Filter states (đã apply)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [templates, setTemplates] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [page, searchQuery, statusFilter, templateFilter]); // Chỉ load khi filter state thay đổi

  // Hàm áp dụng filter
  const applyFilters = () => {
    setSearchQuery(searchInput);
    setStatusFilter(statusInput);
    setTemplateFilter(templateInput);
    setPage(1); // Reset về trang đầu khi filter
  };

  // Hàm xóa filter
  const resetFilters = () => {
    setSearchInput("");
    setStatusInput("all");
    setTemplateInput("all");
    setSearchQuery("");
    setStatusFilter("all");
    setTemplateFilter("all");
    setPage(1);
  };

  const loadTemplates = async () => {
    try {
      const response = await emailTemplateService.getAllTemplates({
        limit: 1000,
      });
      // Backend trả về: { success: true, data: templates[], pagination: {...} }
      const templatesData = response.data || [];
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
    } catch (error) {
      console.error("Error loading templates:", error);
      setTemplates([]);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: PAGE_SIZE,
      };

      if (searchQuery.trim()) {
        params.recipientEmail = searchQuery.trim();
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (templateFilter !== "all") {
        params.templateCode = templateFilter;
      }

      const response = await emailLogService.getAllEmailLogs(params);
      // Backend trả về: { success: true, data: logs[], pagination: {...} }
      console.log("EmailLogPage - Response from API:", response);
      const logsData = response.data || [];
      const pagination = response.pagination || {
        total: 0,
        totalPages: 1,
        page: 1,
        limit: PAGE_SIZE,
      };

      console.log("EmailLogPage - Logs data:", logsData);
      console.log("EmailLogPage - Pagination:", pagination);

      setLogs(Array.isArray(logsData) ? logsData : []);
      setTotalPages(pagination.totalPages || 1);
      setTotal(pagination.total || 0);
    } catch (error) {
      console.error("Error loading email logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (log) => {
    try {
      const response = await emailLogService.getEmailLogById(log.EmailLogID);
      // Backend trả về: { success: true, data: log }
      const detail = response.data || response || log;
      setSelectedLog(detail);
      setDetailDialogOpen(true);
    } catch (error) {
      console.error("Error loading log detail:", error);
      setSelectedLog(log);
      setDetailDialogOpen(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusChip = (status) => {
    const statusInfo = STATUS_COLORS[status] || {
      color: "#94a3b8",
      label: status,
    };
    return (
      <Chip
        label={statusInfo.label}
        size="small"
        sx={{
          backgroundColor: statusInfo.color,
          color: "white",
          fontWeight: 600,
          fontSize: "11px",
        }}
      />
    );
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Lịch sử gửi mail
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Xem lịch sử tất cả các email đã được gửi trong hệ thống
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Tìm kiếm theo email người nhận..."
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                applyFilters();
              }
            }}
            sx={{ flex: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusInput}
              label="Trạng thái"
              onChange={(e) => setStatusInput(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="PENDING">Đang chờ</MenuItem>
              <MenuItem value="SENT">Đã gửi</MenuItem>
              <MenuItem value="FAILED">Thất bại</MenuItem>
              <MenuItem value="BOUNCED">Bị trả lại</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Mẫu email</InputLabel>
            <Select
              value={templateInput}
              label="Mẫu email"
              onChange={(e) => setTemplateInput(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {templates.map((template) => (
                <MenuItem
                  key={template.TemplateID}
                  value={template.TemplateCode}
                >
                  {template.TemplateName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              onClick={applyFilters}
              sx={{ textTransform: "none" }}
            >
              Áp dụng
            </Button>
            {(searchQuery ||
              statusFilter !== "all" ||
              templateFilter !== "all") && (
              <Button
                variant="outlined"
                size="small"
                onClick={resetFilters}
                sx={{ textTransform: "none" }}
              >
                Xóa lọc
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Logs Table */}
      <Paper>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Email sx={{ fontSize: 64, color: "#94a3b8", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#64748b", mb: 1 }}>
              Chưa có email log nào
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Lịch sử email sẽ hiển thị ở đây khi có email được gửi
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Người nhận</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Mẫu email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tiêu đề</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.EmailLogID} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          {formatDate(log.CreatedAt)}
                        </Typography>
                        {log.SentAt && (
                          <Typography
                            variant="caption"
                            sx={{ color: "#94a3b8", display: "block" }}
                          >
                            Gửi: {formatDate(log.SentAt)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {log.RecipientEmail}
                        </Typography>
                        {log.RecipientAccountEmail && (
                          <Typography
                            variant="caption"
                            sx={{ color: "#64748b" }}
                          >
                            {log.RecipientUsername || log.RecipientAccountEmail}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          {log.TemplateCode || "N/A"}
                        </Typography>
                        {log.TemplateName && (
                          <Typography
                            variant="caption"
                            sx={{ color: "#94a3b8" }}
                          >
                            {log.TemplateName}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 300,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {log.Subject}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(log.Status)}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => handleViewDetail(log)}
                          sx={{ textTransform: "none" }}
                        >
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Tổng: {total} email log
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </>
        )}
      </Paper>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, pb: 2, borderBottom: "2px solid #e2e8f0" }}
        >
          Chi tiết email log
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedLog && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Trạng thái:
                </Typography>
                {getStatusChip(selectedLog.Status)}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Người nhận:
                </Typography>
                <Typography variant="body2">
                  {selectedLog.RecipientEmail}
                </Typography>
                {selectedLog.RecipientAccountEmail && (
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Tài khoản:{" "}
                    {selectedLog.RecipientUsername ||
                      selectedLog.RecipientAccountEmail}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Mẫu email:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                  {selectedLog.TemplateCode || "N/A"}
                </Typography>
                {selectedLog.TemplateName && (
                  <Typography variant="body2">
                    {selectedLog.TemplateName}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Tiêu đề:
                </Typography>
                <Typography variant="body2">{selectedLog.Subject}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Nội dung:
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: "#f8fafc",
                    whiteSpace: "pre-wrap",
                    maxHeight: 300,
                    overflow: "auto",
                  }}
                >
                  <Typography variant="body2">{selectedLog.Body}</Typography>
                </Paper>
              </Box>
              {selectedLog.Variables && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Biến đã sử dụng:
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: "#f8fafc" }}>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontSize: "12px" }}
                    >
                      {JSON.stringify(
                        typeof selectedLog.Variables === "string"
                          ? JSON.parse(selectedLog.Variables)
                          : selectedLog.Variables,
                        null,
                        2
                      )}
                    </Typography>
                  </Paper>
                </Box>
              )}
              {selectedLog.ErrorMessage && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600, color: "#ef4444" }}
                  >
                    Lỗi:
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "#fef2f2",
                      border: "1px solid #fee2e2",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#dc2626" }}>
                      {selectedLog.ErrorMessage}
                    </Typography>
                  </Paper>
                </Box>
              )}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Thời gian:
                </Typography>
                <Typography variant="body2">
                  Tạo: {formatDate(selectedLog.CreatedAt)}
                </Typography>
                {selectedLog.SentAt && (
                  <Typography variant="body2">
                    Gửi: {formatDate(selectedLog.SentAt)}
                  </Typography>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() => setDetailDialogOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
