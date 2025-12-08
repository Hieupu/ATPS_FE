import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Pagination,
  Stack,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Send,
  MoreVert,
  Email,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import emailTemplateService from "../../../apiServices/emailTemplateService";
import "./style.css";

const EVENT_TYPES = [
  { value: "ACCOUNT_STATUS_CHANGE", label: "Thay đổi trạng thái tài khoản" },
  { value: "CLASS_CANCELLED", label: "Hủy lớp học" },
  { value: "REFUND_CREATED", label: "Tạo yêu cầu hoàn tiền" },
  { value: "REFUND_APPROVED", label: "Duyệt yêu cầu hoàn tiền" },
  { value: "REFUND_REJECTED", label: "Từ chối yêu cầu hoàn tiền" },
  { value: "REFUND_COMPLETED", label: "Hoàn tiền hoàn tất" },
];

const PAGE_SIZE = 10;

export default function EmailTemplatePage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [isActiveFilter, setIsActiveFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [testEmail, setTestEmail] = useState("");
  const [testVariables, setTestVariables] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    TemplateCode: "",
    TemplateName: "",
    Subject: "",
    Body: "",
    Description: "",
    EventType: "",
    IsActive: true,
    Variables: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [page, searchQuery, eventTypeFilter, isActiveFilter]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: PAGE_SIZE,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (eventTypeFilter !== "all") {
        params.eventType = eventTypeFilter;
      }

      if (isActiveFilter !== "all") {
        params.isActive = isActiveFilter === "active";
      }

      const response = await emailTemplateService.getAllTemplates(params);
      const templatesData = response.data || response.templates || [];
      const pagination = response.pagination || response;

      setTemplates(templatesData);
      setTotalPages(pagination.totalPages || 1);
      setTotal(pagination.total || 0);
    } catch (error) {
      console.error("Error loading templates:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách mẫu email",
        severity: "error",
      });
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, template) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      TemplateCode: "",
      TemplateName: "",
      Subject: "",
      Body: "",
      Description: "",
      EventType: "",
      IsActive: true,
      Variables: [],
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleEdit = (template) => {
    setIsEditing(true);
    setFormData({
      TemplateCode: template.TemplateCode || "",
      TemplateName: template.TemplateName || "",
      Subject: template.Subject || "",
      Body: template.Body || "",
      Description: template.Description || "",
      EventType: template.EventType || "",
      IsActive: template.IsActive !== undefined ? template.IsActive : true,
      Variables: Array.isArray(template.Variables)
        ? template.Variables
        : typeof template.Variables === "string"
        ? JSON.parse(template.Variables || "[]")
        : [],
    });
    setFormErrors({});
    setSelectedTemplate(template);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa mẫu email "${selectedTemplate.TemplateName}"?`
      )
    ) {
      return;
    }

    try {
      await emailTemplateService.deleteTemplate(selectedTemplate.TemplateID);
      setSnackbar({
        open: true,
        message: "Xóa mẫu email thành công",
        severity: "success",
      });
      loadTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể xóa mẫu email",
        severity: "error",
      });
    } finally {
      handleMenuClose();
    }
  };

  const handlePreview = async () => {
    if (!selectedTemplate) return;

    try {
      // Lấy preview với variables mặc định
      const preview = await emailTemplateService.previewTemplate(
        selectedTemplate.TemplateID,
        testVariables
      );
      setPreviewData(preview);
      setPreviewDialogOpen(true);
    } catch (error) {
      console.error("Error previewing template:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể preview mẫu email",
        severity: "error",
      });
    } finally {
      handleMenuClose();
    }
  };

  const handleTestSend = () => {
    if (!selectedTemplate) return;
    setTestEmail("");
    setTestVariables({});
    setTestDialogOpen(true);
    handleMenuClose();
  };

  const handleSendTestEmail = async () => {
    if (!testEmail || !selectedTemplate) return;

    try {
      setSendingTest(true);
      await emailTemplateService.testSendEmail(
        selectedTemplate.TemplateID,
        testEmail,
        testVariables
      );
      setSnackbar({
        open: true,
        message: "Gửi email test thành công",
        severity: "success",
      });
      setTestDialogOpen(false);
    } catch (error) {
      console.error("Error sending test email:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể gửi email test",
        severity: "error",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.TemplateCode.trim()) {
      errors.TemplateCode = "Vui lòng nhập mã mẫu email";
    }

    if (!formData.TemplateName.trim()) {
      errors.TemplateName = "Vui lòng nhập tên mẫu email";
    }

    if (!formData.Subject.trim()) {
      errors.Subject = "Vui lòng nhập tiêu đề email";
    }

    if (!formData.Body.trim()) {
      errors.Body = "Vui lòng nhập nội dung email";
    }

    if (!formData.EventType) {
      errors.EventType = "Vui lòng chọn loại sự kiện";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      if (isEditing) {
        await emailTemplateService.updateTemplate(
          selectedTemplate.TemplateID,
          formData
        );
        setSnackbar({
          open: true,
          message: "Cập nhật mẫu email thành công",
          severity: "success",
        });
      } else {
        await emailTemplateService.createTemplate(formData);
        setSnackbar({
          open: true,
          message: "Tạo mẫu email thành công",
          severity: "success",
        });
      }

      setDialogOpen(false);
      loadTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu mẫu email",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const getEventTypeLabel = (eventType) => {
    const event = EVENT_TYPES.find((e) => e.value === eventType);
    return event ? event.label : eventType;
  };

  const getStatusColor = (isActive) => {
    return isActive ? "success" : "default";
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Quản lý mẫu gửi mail
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Quản lý các mẫu email tự động gửi khi có sự kiện trong hệ thống
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Tìm kiếm mẫu email..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, color: "#94a3b8" }}>
                  <Email />
                </Box>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Loại sự kiện</InputLabel>
            <Select
              value={eventTypeFilter}
              label="Loại sự kiện"
              onChange={(e) => setEventTypeFilter(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {EVENT_TYPES.map((event) => (
                <MenuItem key={event.value} value={event.value}>
                  {event.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={isActiveFilter}
              label="Trạng thái"
              onChange={(e) => setIsActiveFilter(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="inactive">Không hoạt động</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            sx={{ textTransform: "none" }}
          >
            Thêm mẫu email
          </Button>
        </Stack>
      </Paper>

      {/* Templates Table */}
      <Paper>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : templates.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Email sx={{ fontSize: 64, color: "#94a3b8", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#64748b", mb: 1 }}>
              Chưa có mẫu email nào
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
              Hãy tạo mẫu email đầu tiên để bắt đầu
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAdd}
              sx={{ textTransform: "none" }}
            >
              Thêm mẫu email
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Mã mẫu</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tên mẫu</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Loại sự kiện</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tiêu đề</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.TemplateID} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, fontFamily: "monospace" }}
                        >
                          {template.TemplateCode}
                        </Typography>
                      </TableCell>
                      <TableCell>{template.TemplateName}</TableCell>
                      <TableCell>
                        <Chip
                          label={getEventTypeLabel(template.EventType)}
                          size="small"
                          sx={{ fontSize: "11px" }}
                        />
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
                          {template.Subject}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={template.IsActive ? "Hoạt động" : "Không hoạt động"}
                          color={getStatusColor(template.IsActive)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, template)}
                        >
                          <MoreVert />
                        </IconButton>
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
                Tổng: {total} mẫu email
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

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ fontSize: 18, mr: 1.5 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={handlePreview}>
          <Visibility sx={{ fontSize: 18, mr: 1.5 }} />
          Xem trước
        </MenuItem>
        <MenuItem onClick={handleTestSend}>
          <Send sx={{ fontSize: 18, mr: 1.5 }} />
          Gửi test
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: "#ef4444" }}>
          <Delete sx={{ fontSize: 18, mr: 1.5 }} />
          Xóa
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2, borderBottom: "2px solid #e2e8f0" }}>
          {isEditing ? "Chỉnh sửa mẫu email" : "Thêm mẫu email mới"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Mã mẫu email *"
              value={formData.TemplateCode}
              onChange={(e) =>
                setFormData({ ...formData, TemplateCode: e.target.value })
              }
              error={!!formErrors.TemplateCode}
              helperText={formErrors.TemplateCode}
              placeholder="Ví dụ: ACCOUNT_STATUS_CHANGED"
              disabled={isEditing}
              fullWidth
            />
            <TextField
              label="Tên mẫu email *"
              value={formData.TemplateName}
              onChange={(e) =>
                setFormData({ ...formData, TemplateName: e.target.value })
              }
              error={!!formErrors.TemplateName}
              helperText={formErrors.TemplateName}
              fullWidth
            />
            <FormControl fullWidth error={!!formErrors.EventType}>
              <InputLabel>Loại sự kiện *</InputLabel>
              <Select
                value={formData.EventType}
                label="Loại sự kiện *"
                onChange={(e) =>
                  setFormData({ ...formData, EventType: e.target.value })
                }
              >
                {EVENT_TYPES.map((event) => (
                  <MenuItem key={event.value} value={event.value}>
                    {event.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.EventType && (
                <Typography variant="caption" sx={{ color: "#ef4444", mt: 0.5, ml: 1.75 }}>
                  {formErrors.EventType}
                </Typography>
              )}
            </FormControl>
            <TextField
              label="Tiêu đề email *"
              value={formData.Subject}
              onChange={(e) =>
                setFormData({ ...formData, Subject: e.target.value })
              }
              error={!!formErrors.Subject}
              helperText={formErrors.Subject}
              placeholder="Có thể dùng biến: {{userName}}, {{className}}, ..."
              fullWidth
            />
            <TextField
              label="Nội dung email *"
              value={formData.Body}
              onChange={(e) =>
                setFormData({ ...formData, Body: e.target.value })
              }
              error={!!formErrors.Body}
              helperText={formErrors.Body}
              placeholder="Có thể dùng biến: {{userName}}, {{className}}, ..."
              multiline
              minRows={8}
              fullWidth
            />
            <TextField
              label="Mô tả"
              value={formData.Description}
              onChange={(e) =>
                setFormData({ ...formData, Description: e.target.value })
              }
              multiline
              minRows={2}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.IsActive}
                  onChange={(e) =>
                    setFormData({ ...formData, IsActive: e.target.checked })
                  }
                />
              }
              label="Đang hoạt động"
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Biến có thể sử dụng (tùy chọn):
              </Typography>
              <TextField
                placeholder='Nhập các biến, cách nhau bởi dấu phẩy. Ví dụ: ["userName", "className", "refundAmount"]'
                value={
                  Array.isArray(formData.Variables)
                    ? formData.Variables.join(", ")
                    : ""
                }
                onChange={(e) => {
                  const vars = e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter((v) => v);
                  setFormData({ ...formData, Variables: vars });
                }}
                fullWidth
                size="small"
                helperText="Các biến này sẽ được thay thế trong Subject và Body khi gửi email"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2, borderBottom: "2px solid #e2e8f0" }}>
          Xem trước mẫu email
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {previewData ? (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Tiêu đề:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: "#f8fafc" }}>
                  <Typography variant="body1">{previewData.subject}</Typography>
                </Paper>
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
                    minHeight: 200,
                  }}
                >
                  <Typography variant="body2">{previewData.body}</Typography>
                </Paper>
              </Box>
            </Stack>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() => setPreviewDialogOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Send Dialog */}
      <Dialog
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2, borderBottom: "2px solid #e2e8f0" }}>
          Gửi email test
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Email nhận test *"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="example@email.com"
              fullWidth
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Biến test (tùy chọn):
              </Typography>
              <TextField
                placeholder='JSON format: {"userName": "Nguyễn Văn A", "className": "JavaScript Fundamentals"}'
                value={JSON.stringify(testVariables, null, 2)}
                onChange={(e) => {
                  try {
                    const vars = JSON.parse(e.target.value || "{}");
                    setTestVariables(vars);
                  } catch (err) {
                    // Invalid JSON, ignore
                  }
                }}
                multiline
                minRows={4}
                fullWidth
                size="small"
                helperText="Nhập JSON object với các biến để test"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() => setTestDialogOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSendTestEmail}
            disabled={!testEmail || sendingTest}
            startIcon={sendingTest ? <CircularProgress size={16} /> : <Send />}
            sx={{ textTransform: "none" }}
          >
            {sendingTest ? "Đang gửi..." : "Gửi email test"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

