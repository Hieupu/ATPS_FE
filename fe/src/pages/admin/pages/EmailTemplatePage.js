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
  Grid,
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

// Template mẫu cho từng loại sự kiện
const EVENT_TEMPLATES = {
  ACCOUNT_STATUS_CHANGED: {
    subject: "Thông báo thay đổi trạng thái tài khoản",
    body: `Kính chào {{userName}},

Chúng tôi xin thông báo rằng trạng thái tài khoản của bạn đã được thay đổi.

Trạng thái cũ: {{oldStatus}}
Trạng thái mới: {{newStatus}}

Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.

Trân trọng,
Đội ngũ hỗ trợ`,
    variables: ["userName", "oldStatus", "newStatus"],
  },
  CLASS_CANCELLED_TO_LEARNER: {
    subject: "Thông báo hủy lớp học: {{className}}",
    body: `Kính chào {{userName}},

Chúng tôi rất tiếc phải thông báo rằng lớp học "{{className}}" ({{classCode}}) đã bị hủy.

Lý do: {{reason}}

Chúng tôi sẽ liên hệ với bạn để xử lý việc hoàn tiền hoặc chuyển sang lớp học khác.

Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.

Trân trọng,
Đội ngũ hỗ trợ`,
    variables: ["userName", "className", "classCode", "reason"],
  },
  CLASS_CANCELLED_TO_INSTRUCTOR: {
    subject: "Thông báo hủy lớp học: {{className}}",
    body: `Kính chào {{userName}},

Chúng tôi xin thông báo rằng lớp học "{{className}}" ({{classCode}}) mà bạn đang giảng dạy đã bị hủy.

Lý do: {{reason}}

Lịch giảng dạy của bạn sẽ được cập nhật. Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.

Trân trọng,
Đội ngũ hỗ trợ`,
    variables: ["userName", "className", "classCode", "reason"],
  },
  REFUND_CREATED: {
    subject: "Yêu cầu hoàn tiền đã được tạo: {{refundCode}}",
    body: `Kính chào {{userName}},

Yêu cầu hoàn tiền của bạn đã được tạo thành công.

Mã yêu cầu: {{refundCode}}
Lớp học: {{className}}
Số tiền: {{refundAmount}}
Lý do: {{reason}}

Yêu cầu của bạn đang được xem xét. Chúng tôi sẽ thông báo kết quả trong thời gian sớm nhất.

Trân trọng,
Đội ngũ hỗ trợ`,
    variables: [
      "userName",
      "className",
      "refundCode",
      "refundAmount",
      "reason",
    ],
  },
  REFUND_APPROVED: {
    subject: "Yêu cầu hoàn tiền đã được duyệt: {{refundCode}}",
    body: `Kính chào {{userName}},

Yêu cầu hoàn tiền của bạn đã được duyệt.

Mã yêu cầu: {{refundCode}}
Lớp học: {{className}}
Số tiền: {{refundAmount}}

Số tiền sẽ được hoàn lại vào tài khoản của bạn trong vòng 5-7 ngày làm việc.

Trân trọng,
Đội ngũ hỗ trợ`,
    variables: ["userName", "refundCode", "refundAmount", "className"],
  },
  REFUND_REJECTED: {
    subject: "Yêu cầu hoàn tiền đã bị từ chối: {{refundCode}}",
    body: `Kính chào {{userName}},

Rất tiếc, yêu cầu hoàn tiền của bạn đã bị từ chối.

Mã yêu cầu: {{refundCode}}
Lý do từ chối: {{rejectionReason}}

Nếu bạn có bất kỳ thắc mắc nào về quyết định này, vui lòng liên hệ với chúng tôi.

Trân trọng,
Đội ngũ hỗ trợ`,
    variables: ["userName", "refundCode", "rejectionReason"],
  },
  REFUND_COMPLETED: {
    subject: "Hoàn tiền đã hoàn tất: {{refundCode}}",
    body: `Kính chào {{userName}},

Yêu cầu hoàn tiền của bạn đã được xử lý hoàn tất.

Mã yêu cầu: {{refundCode}}
Lớp học: {{className}}
Số tiền: {{refundAmount}}
Ngày hoàn tất: {{completedDate}}

Số tiền đã được hoàn lại vào tài khoản của bạn. Vui lòng kiểm tra lại.

Trân trọng,
Đội ngũ hỗ trợ`,
    variables: [
      "userName",
      "refundCode",
      "refundAmount",
      "className",
      "completedDate",
    ],
  },
};

const EVENT_TYPES = [
  { value: "ACCOUNT_STATUS_CHANGED", label: "Thay đổi trạng thái tài khoản" },
  {
    value: "CLASS_CANCELLED_TO_LEARNER",
    label: "Hủy lớp học - Gửi tới học viên",
  },
  {
    value: "CLASS_CANCELLED_TO_INSTRUCTOR",
    label: "Hủy lớp học - Gửi tới giảng viên",
  },
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
  // Input states (chưa apply)
  const [searchInput, setSearchInput] = useState("");
  const [eventTypeInput, setEventTypeInput] = useState("all");
  const [isActiveInput, setIsActiveInput] = useState("all");
  // Filter states (đã apply)
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
  const [availableVariables, setAvailableVariables] = useState([]);
  const [loadingVariables, setLoadingVariables] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [page, searchQuery, eventTypeFilter, isActiveFilter]); // Chỉ load khi filter state thay đổi

  // Hàm áp dụng filter
  const applyFilters = () => {
    setSearchQuery(searchInput);
    setEventTypeFilter(eventTypeInput);
    setIsActiveFilter(isActiveInput);
    setPage(1); // Reset về trang đầu khi filter
  };

  // Hàm xóa filter
  const resetFilters = () => {
    setSearchInput("");
    setEventTypeInput("all");
    setIsActiveInput("all");
    setSearchQuery("");
    setEventTypeFilter("all");
    setIsActiveFilter("all");
    setPage(1);
  };

  // Load available variables khi EventType thay đổi
  useEffect(() => {
    if (formData.EventType && !isEditing) {
      loadAvailableVariables(formData.EventType);
    } else {
      setAvailableVariables([]);
    }
  }, [formData.EventType, isEditing]);

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
      // Backend trả về: { success: true, data: templates[], pagination: {...} }
      console.log("EmailTemplatePage - Response from API:", response);
      const templatesData = response.data || [];
      const pagination = response.pagination || {
        total: 0,
        totalPages: 1,
        page: 1,
        limit: PAGE_SIZE,
      };

      console.log("EmailTemplatePage - Templates data:", templatesData);
      console.log("EmailTemplatePage - Pagination:", pagination);

      setTemplates(Array.isArray(templatesData) ? templatesData : []);
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

  const loadAvailableVariables = async (eventType) => {
    try {
      setLoadingVariables(true);
      const variables = await emailTemplateService.getAvailableVariables(
        eventType
      );
      setAvailableVariables(Array.isArray(variables) ? variables : []);

      // Nếu có template mẫu và đang tạo mới, tự động điền (luôn cập nhật khi chọn lại EventType)
      if (!isEditing && EVENT_TEMPLATES[eventType]) {
        const template = EVENT_TEMPLATES[eventType];
        setFormData((prev) => ({
          ...prev,
          EventType: eventType,
          Subject: template.subject, // Luôn cập nhật theo template mới
          Body: template.body, // Luôn cập nhật theo template mới
          Variables: variables.length > 0 ? variables : template.variables,
          TemplateCode: eventType, // Luôn cập nhật theo EventType
          TemplateName:
            EVENT_TYPES.find((e) => e.value === eventType)?.label || eventType, // Luôn cập nhật theo EventType
        }));
      } else if (!isEditing) {
        // Nếu không có template mẫu nhưng có biến từ DB, chỉ cập nhật Variables
        setFormData((prev) => ({
          ...prev,
          EventType: eventType,
          Variables: variables.length > 0 ? variables : [],
          TemplateCode: eventType, // Luôn cập nhật theo EventType
          TemplateName:
            EVENT_TYPES.find((e) => e.value === eventType)?.label || eventType, // Luôn cập nhật theo EventType
        }));
      }
    } catch (error) {
      console.error("Error loading available variables:", error);
      // Fallback về template mẫu nếu có
      if (EVENT_TEMPLATES[eventType]) {
        setAvailableVariables(EVENT_TEMPLATES[eventType].variables);
        // Nếu đang tạo mới, vẫn cập nhật form data với template mẫu
        if (!isEditing) {
          const template = EVENT_TEMPLATES[eventType];
          setFormData((prev) => ({
            ...prev,
            EventType: eventType,
            Subject: template.subject,
            Body: template.body,
            Variables: template.variables,
            TemplateCode: eventType,
            TemplateName:
              EVENT_TYPES.find((e) => e.value === eventType)?.label ||
              eventType,
          }));
        }
      } else {
        setAvailableVariables([]);
      }
    } finally {
      setLoadingVariables(false);
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

  // Xử lý khi chọn EventType - tự động điền template mẫu
  const handleEventTypeChange = async (eventType) => {
    // Tự động set TemplateCode = EventType khi tạo mới
    const newTemplateCode = !isEditing ? eventType : formData.TemplateCode;

    setFormData({
      ...formData,
      EventType: eventType,
      TemplateCode: newTemplateCode,
    });

    // Load lại templates với filter theo EventType đang chọn
    if (!isEditing) {
      setEventTypeFilter(eventType);
      setPage(1); // Reset về trang đầu
    }
  };

  const handleEdit = async (template) => {
    setIsEditing(true);
    const variables = Array.isArray(template.Variables)
      ? template.Variables
      : typeof template.Variables === "string"
      ? JSON.parse(template.Variables || "[]")
      : [];

    setFormData({
      TemplateCode: template.TemplateCode || "",
      TemplateName: template.TemplateName || "",
      Subject: template.Subject || "",
      Body: template.Body || "",
      Description: template.Description || "",
      EventType: template.EventType || "",
      IsActive: template.IsActive !== undefined ? template.IsActive : true,
      Variables: variables,
    });
    setFormErrors({});
    setSelectedTemplate(template);
    setDialogOpen(true);
    handleMenuClose();

    // Load available variables từ database để hiển thị
    if (template.EventType) {
      try {
        const availableVars = await emailTemplateService.getAvailableVariables(
          template.EventType
        );
        setAvailableVariables(
          Array.isArray(availableVars) ? availableVars : []
        );
      } catch (error) {
        console.error("Error loading variables for edit:", error);
        setAvailableVariables(variables);
      }
    }
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

  const validateForm = async () => {
    const errors = {};

    if (!formData.EventType) {
      errors.EventType = "Vui lòng chọn loại sự kiện";
    }

    // Validate TemplateCode
    const templateCode = formData.TemplateCode.trim();

    if (!templateCode) {
      errors.TemplateCode = "Vui lòng nhập mã mẫu email";
    } else {
      // Kiểm tra khoảng trắng đầu cuối (đã trim rồi nên không cần)
      // Kiểm tra khoảng trắng giữa các chữ
      if (/\s/.test(templateCode)) {
        errors.TemplateCode = "Mã mẫu email không được chứa khoảng trắng";
      }
      // Kiểm tra chỉ cho phép chữ cái, số, dấu gạch dưới, dấu gạch ngang
      // Không cho phép dấu câu
      if (!/^[A-Za-z0-9_-]+$/.test(templateCode)) {
        errors.TemplateCode =
          "Mã mẫu email chỉ được chứa chữ cái, số, dấu gạch dưới (_) và dấu gạch ngang (-)";
      }

      // Check trùng TemplateCode (chỉ khi tạo mới hoặc khi chỉnh sửa và TemplateCode thay đổi)
      if (!isEditing) {
        const existingTemplate = templates.find(
          (t) => t.TemplateCode === templateCode
        );
        if (existingTemplate) {
          errors.TemplateCode = "Mã mẫu email này đã tồn tại";
        }
      } else {
        // Khi chỉnh sửa, chỉ check trùng nếu TemplateCode khác với TemplateCode cũ
        if (
          selectedTemplate &&
          selectedTemplate.TemplateCode !== templateCode
        ) {
          const existingTemplate = templates.find(
            (t) =>
              t.TemplateCode === templateCode &&
              t.TemplateID !== selectedTemplate.TemplateID
          );
          if (existingTemplate) {
            errors.TemplateCode = "Mã mẫu email này đã tồn tại";
          }
        }
      }
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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

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
        // Reset filter về "all" để hiển thị tất cả templates sau khi tạo mới
        setEventTypeFilter("all");
        setPage(1);
      }

      setDialogOpen(false);
      // Reset form data
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
      setAvailableVariables([]);

      // Load lại danh sách templates (sẽ tự động load khi eventTypeFilter và page thay đổi)
      // Nhưng để đảm bảo, gọi trực tiếp loadTemplates
      await loadTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      // Nếu lỗi do trùng TemplateCode từ backend
      if (
        error?.response?.data?.message?.includes("đã tồn tại") ||
        error?.response?.data?.message?.includes("duplicate")
      ) {
        setFormErrors({
          ...formErrors,
          TemplateCode: "Mã mẫu email này đã tồn tại",
        });
      }
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
                <Box sx={{ mr: 1, color: "#94a3b8" }}>
                  <Email />
                </Box>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Loại sự kiện</InputLabel>
            <Select
              value={eventTypeInput}
              label="Loại sự kiện"
              onChange={(e) => setEventTypeInput(e.target.value)}
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
              value={isActiveInput}
              label="Trạng thái"
              onChange={(e) => setIsActiveInput(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="inactive">Không hoạt động</MenuItem>
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
              eventTypeFilter !== "all" ||
              isActiveFilter !== "all") && (
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
                          label={
                            template.IsActive ? "Hoạt động" : "Không hoạt động"
                          }
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
        <DialogTitle
          sx={{ fontWeight: 700, pb: 2, borderBottom: "2px solid #e2e8f0" }}
        >
          {isEditing ? "Chỉnh sửa mẫu email" : "Thêm mẫu email mới"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Cột trái: Form nhập liệu */}
            <Grid item xs={12} md={7}>
              <Stack spacing={2}>
                {/* Loại sự kiện - đặt lên đầu */}
                <FormControl fullWidth error={!!formErrors.EventType}>
                  <InputLabel>Loại sự kiện *</InputLabel>
                  <Select
                    value={formData.EventType}
                    label="Loại sự kiện *"
                    onChange={(e) => handleEventTypeChange(e.target.value)}
                  >
                    {EVENT_TYPES.map((event) => (
                      <MenuItem key={event.value} value={event.value}>
                        {event.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.EventType && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#ef4444", mt: 0.5, ml: 1.75 }}
                    >
                      {formErrors.EventType}
                    </Typography>
                  )}
                  {formData.EventType && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748b", mt: 0.5, ml: 1.75 }}
                    >
                      {loadingVariables
                        ? "Đang tải danh sách biến từ database..."
                        : "Vui lòng chọn loại sự kiện để xem các biến có thể sử dụng"}
                    </Typography>
                  )}
                </FormControl>

                {/* Mã mẫu email - tự động = EventType khi tạo mới, nhưng vẫn cho phép chỉnh sửa */}
                <TextField
                  label="Mã mẫu email *"
                  value={formData.TemplateCode}
                  onChange={(e) => {
                    // Tự động loại bỏ khoảng trắng và chỉ cho phép chữ cái, số, dấu gạch dưới, dấu gạch ngang
                    let value = e.target.value;
                    // Loại bỏ khoảng trắng
                    value = value.replace(/\s/g, "");
                    // Chỉ giữ lại chữ cái, số, dấu gạch dưới, dấu gạch ngang
                    value = value.replace(/[^A-Za-z0-9_-]/g, "");
                    setFormData({ ...formData, TemplateCode: value });
                  }}
                  error={!!formErrors.TemplateCode}
                  helperText={
                    formErrors.TemplateCode ||
                    (!isEditing && formData.EventType
                      ? "Mã mẫu email tự động lấy theo loại sự kiện. Chỉ được chứa chữ cái, số, dấu gạch dưới (_) và dấu gạch ngang (-)"
                      : "Chỉ được chứa chữ cái, số, dấu gạch dưới (_) và dấu gạch ngang (-), không có khoảng trắng")
                  }
                  placeholder="Ví dụ: ACCOUNT_STATUS_CHANGED"
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
                <TextField
                  label="Tiêu đề email *"
                  value={formData.Subject}
                  onChange={(e) =>
                    setFormData({ ...formData, Subject: e.target.value })
                  }
                  error={!!formErrors.Subject}
                  fullWidth
                />
                <TextField
                  label="Nội dung email *"
                  value={formData.Body}
                  onChange={(e) =>
                    setFormData({ ...formData, Body: e.target.value })
                  }
                  error={!!formErrors.Body}
                  multiline
                  minRows={10}
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
              </Stack>
            </Grid>

            {/* Cột phải: Biến có thể sử dụng */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  position: "sticky",
                  top: 20,
                  maxHeight: "calc(100vh - 200px)",
                  overflowY: "auto",
                }}
              >
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                  Biến có thể sử dụng:
                </Typography>
                {formData.EventType ? (
                  loadingVariables ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 2,
                      }}
                    >
                      <CircularProgress size={16} />
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        Đang tải danh sách biến từ database...
                      </Typography>
                    </Box>
                  ) : availableVariables.length > 0 ? (
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, color: "#64748b" }}
                      >
                        Các biến có thể sử dụng cho loại sự kiện này (lấy từ
                        database):
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {availableVariables.map((variable) => (
                          <Chip
                            key={variable}
                            label={`{{${variable}}}`}
                            size="small"
                            sx={{
                              fontFamily: "monospace",
                              backgroundColor: "#e0e7ff",
                              color: "#4338ca",
                            }}
                          />
                        ))}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", mt: 1, color: "#64748b" }}
                      >
                        Các biến này được lấy từ template đã có trong database
                        hoặc mặc định theo EventType.
                      </Typography>
                    </Paper>
                  ) : (
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: "#fef2f2",
                        border: "1px solid #fee2e2",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "#dc2626" }}>
                        Không tìm thấy biến nào cho loại sự kiện này. Vui lòng
                        kiểm tra lại.
                      </Typography>
                    </Paper>
                  )
                ) : (
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Vui lòng chọn loại sự kiện để xem các biến có thể sử dụng
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Grid>
          </Grid>
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
        <DialogTitle
          sx={{ fontWeight: 700, pb: 2, borderBottom: "2px solid #e2e8f0" }}
        >
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
        <DialogTitle
          sx={{ fontWeight: 700, pb: 2, borderBottom: "2px solid #e2e8f0" }}
        >
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
