import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Pagination,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Search,
  FilterList,
  Add,
  Edit,
  Delete,
  PlayCircle,
  PauseCircle,
  LocalOffer,
} from "@mui/icons-material";

import promotionService from "../../../apiServices/promotionService";
import { useAuth } from "../../../contexts/AuthContext";
import "../../admin/pages/style.css";

const statusFilterOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Đã tắt" },
  { value: "expired", label: "Đã hết hạn" },
];

const statusStyles = {
  active: { label: "Đang hoạt động", bg: "#dcfce7", color: "#16a34a" },
  inactive: { label: "Đã tắt", bg: "#f1f5f9", color: "#475569" },
  expired: { label: "Đã hết hạn", bg: "#fef3c7", color: "#d97706" },
};

const initialFormData = {
  Code: "",
  Discount: "",
  StartDate: "",
  EndDate: "",
  Status: "active",
};

export default function StaffPromotionsPage() {
  const { user } = useAuth();

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [filters, setFilters] = useState({ search: "", status: "all" });
  const [pendingFilters, setPendingFilters] = useState({
    search: "",
    status: "all",
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [editingPromotion, setEditingPromotion] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null,
    promotion: null,
  });

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchPromotions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
      };

      if (filters.search) params.search = filters.search;

      const backendFilterableStatuses = ["active", "inactive", "expired"];
      if (backendFilterableStatuses.includes(filters.status)) {
        params.status = filters.status;
      }

      const response = await promotionService.getPromotions(params);

      if (!response) {
        throw new Error("Không nhận được response từ server");
      }

      const items = response?.data || response?.items || [];
      const paginationInfo = response?.pagination || {};

      if (!Array.isArray(items)) {
        console.error("[PromotionsPage] Items is not an array:", items);
        throw new Error("Dữ liệu không đúng định dạng");
      }

      setPromotions(items);
      setPagination({
        total: paginationInfo.total || items.length || 0,
        totalPages: paginationInfo.totalPages || 1,
      });
    } catch (error) {
      console.error("[PromotionsPage] Error fetching promotions:", error);
      showToast(error.message || "Không thể tải danh sách khuyến mãi", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const handleFilterChange = (field) => (event) => {
    setPendingFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleApplyFilters = () => {
    setFilters(pendingFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setPendingFilters({ search: "", status: "all" });
    setFilters({ search: "", status: "all" });
    setPage(1);
  };

  const handleOpenDialog = (promotion = null) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        Code: promotion.Code || "",
        Discount: promotion.Discount || "",
        StartDate: promotion.StartDate
          ? dayjs(promotion.StartDate).format("YYYY-MM-DD")
          : "",
        EndDate: promotion.EndDate
          ? dayjs(promotion.EndDate).format("YYYY-MM-DD")
          : "",
        Status: promotion.Status || "active",
      });
    } else {
      setEditingPromotion(null);
      setFormData(initialFormData);
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPromotion(null);
    setFormData(initialFormData);
    setErrors({});
  };

  const handleFormChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Code?.trim()) {
      newErrors.Code = "Mã khuyến mãi không được để trống";
    }

    if (!formData.Discount || isNaN(formData.Discount)) {
      newErrors.Discount = "Giảm giá phải là số hợp lệ";
    } else if (
      Number(formData.Discount) < 0 ||
      Number(formData.Discount) > 100
    ) {
      newErrors.Discount = "Giảm giá phải từ 0 đến 100%";
    }

    if (!formData.StartDate) {
      newErrors.StartDate = "Ngày bắt đầu không được để trống";
    }

    if (!formData.EndDate) {
      newErrors.EndDate = "Ngày kết thúc không được để trống";
    }

    if (
      formData.StartDate &&
      formData.EndDate &&
      dayjs(formData.EndDate).isBefore(dayjs(formData.StartDate))
    ) {
      newErrors.EndDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePromotion = async () => {
    if (!validateForm()) return;

    try {
      setActionLoading(true);

      const payload = {
        Code: formData.Code.trim(),
        Discount: Number(formData.Discount),
        StartDate: formData.StartDate,
        EndDate: formData.EndDate,
        Status: formData.Status,
      };

      if (editingPromotion) {
        await promotionService.updatePromotion(
          editingPromotion.PromotionID,
          payload
        );
        showToast("Cập nhật khuyến mãi thành công");
      } else {
        await promotionService.createPromotion(payload);
        showToast("Tạo khuyến mãi mới thành công");
      }

      handleCloseDialog();
      fetchPromotions();
    } catch (error) {
      console.error("[PromotionsPage] Error saving promotion:", error);
      showToast(error.message || "Không thể lưu khuyến mãi", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenConfirmDialog = (type, promotion) => {
    setConfirmDialog({ open: true, type, promotion });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, type: null, promotion: null });
  };

  const handleConfirmAction = async () => {
    const { type, promotion } = confirmDialog;
    if (!promotion) return;

    try {
      setActionLoading(true);

      switch (type) {
        case "delete":
          await promotionService.deletePromotion(promotion.PromotionID);
          showToast("Xóa khuyến mãi thành công");
          break;
        case "activate":
          await promotionService.activatePromotion(promotion.PromotionID);
          showToast("Kích hoạt khuyến mãi thành công");
          break;
        case "deactivate":
          await promotionService.deactivatePromotion(promotion.PromotionID);
          showToast("Vô hiệu hóa khuyến mãi thành công");
          break;
        default:
          break;
      }

      handleCloseConfirmDialog();
      fetchPromotions();
    } catch (error) {
      console.error("[PromotionsPage] Error performing action:", error);
      showToast(error.message || "Thao tác thất bại", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = promotions.length;
    const active = promotions.filter(
      (p) => p.Status?.toLowerCase() === "active"
    ).length;
    const inactive = promotions.filter(
      (p) => p.Status?.toLowerCase() === "inactive"
    ).length;
    const expired = promotions.filter(
      (p) => p.Status?.toLowerCase() === "expired"
    ).length;
    return { total, active, inactive, expired };
  }, [promotions]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return dayjs(dateStr).format("DD/MM/YYYY");
  };

  const getStatusChip = (status) => {
    const style = statusStyles[status?.toLowerCase()] || statusStyles.inactive;
    return (
      <Chip
        label={style.label}
        size="small"
        sx={{
          backgroundColor: style.bg,
          color: style.color,
          fontWeight: 600,
          fontSize: "0.75rem",
        }}
      />
    );
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Quản lý Khuyến mãi
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Tạo và quản lý mã khuyến mãi cho học viên
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            textTransform: "none",
            backgroundColor: "#059669",
            "&:hover": { backgroundColor: "#047857" },
            borderRadius: 2,
            px: 3,
          }}
        >
          Tạo khuyến mãi
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
                Tổng khuyến mãi
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
                Đang hoạt động
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#16a34a" }}>
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
                Đã tắt
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#475569" }}>
                {stats.inactive}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
                Đã hết hạn
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#d97706" }}>
                {stats.expired}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ borderRadius: 3, mb: 3, p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            placeholder="Tìm kiếm mã khuyến mãi..."
            size="small"
            value={pendingFilters.search}
            onChange={handleFilterChange("search")}
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            value={pendingFilters.status}
            onChange={handleFilterChange("status")}
            sx={{ minWidth: 180 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterList sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
          >
            {statusFilterOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            sx={{
              textTransform: "none",
              backgroundColor: "#059669",
              "&:hover": { backgroundColor: "#047857" },
            }}
          >
            Lọc
          </Button>
          <Button
            variant="outlined"
            onClick={handleResetFilters}
            sx={{ textTransform: "none" }}
          >
            Xóa bộ lọc
          </Button>
        </Stack>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 600 }}>Mã</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Giảm giá</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ngày bắt đầu</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ngày kết thúc</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : promotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <LocalOffer sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Không có khuyến mãi nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map((promo) => (
                  <TableRow key={promo.PromotionID} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{promo.Code}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${promo.Discount}%`}
                        size="small"
                        sx={{
                          backgroundColor: "#e0e7ff",
                          color: "#4f46e5",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(promo.StartDate)}</TableCell>
                    <TableCell>{formatDate(promo.EndDate)}</TableCell>
                    <TableCell>{getStatusChip(promo.Status)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(promo)}
                            sx={{ color: "#6366f1" }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {promo.Status?.toLowerCase() === "active" ? (
                          <Tooltip title="Vô hiệu hóa">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleOpenConfirmDialog("deactivate", promo)
                              }
                              sx={{ color: "#f59e0b" }}
                            >
                              <PauseCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Kích hoạt">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleOpenConfirmDialog("activate", promo)
                              }
                              sx={{ color: "#16a34a" }}
                            >
                              <PlayCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenConfirmDialog("delete", promo)}
                            sx={{ color: "#ef4444" }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {pagination.totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <Pagination
              count={pagination.totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingPromotion ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới"}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Mã khuyến mãi"
              value={formData.Code}
              onChange={handleFormChange("Code")}
              error={!!errors.Code}
              helperText={errors.Code}
              fullWidth
              placeholder="VD: SUMMER2024"
            />
            <TextField
              label="Giảm giá (%)"
              type="number"
              value={formData.Discount}
              onChange={handleFormChange("Discount")}
              error={!!errors.Discount}
              helperText={errors.Discount}
              fullWidth
              inputProps={{ min: 0, max: 100 }}
            />
            <TextField
              label="Ngày bắt đầu"
              type="date"
              value={formData.StartDate}
              onChange={handleFormChange("StartDate")}
              error={!!errors.StartDate}
              helperText={errors.StartDate}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Ngày kết thúc"
              type="date"
              value={formData.EndDate}
              onChange={handleFormChange("EndDate")}
              error={!!errors.EndDate}
              helperText={errors.EndDate}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Trạng thái"
              value={formData.Status}
              onChange={handleFormChange("Status")}
              fullWidth
            >
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="inactive">Đã tắt</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{ textTransform: "none", color: "#64748b" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePromotion}
            disabled={actionLoading}
            sx={{
              textTransform: "none",
              backgroundColor: "#059669",
              "&:hover": { backgroundColor: "#047857" },
            }}
          >
            {actionLoading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : editingPromotion ? (
              "Cập nhật"
            ) : (
              "Tạo mới"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {confirmDialog.type === "delete"
            ? "Xác nhận xóa"
            : confirmDialog.type === "activate"
            ? "Xác nhận kích hoạt"
            : "Xác nhận vô hiệu hóa"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.type === "delete"
              ? `Bạn có chắc chắn muốn xóa khuyến mãi "${confirmDialog.promotion?.Code}"?`
              : confirmDialog.type === "activate"
              ? `Bạn có chắc chắn muốn kích hoạt khuyến mãi "${confirmDialog.promotion?.Code}"?`
              : `Bạn có chắc chắn muốn vô hiệu hóa khuyến mãi "${confirmDialog.promotion?.Code}"?`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseConfirmDialog}
            sx={{ textTransform: "none", color: "#64748b" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color={confirmDialog.type === "delete" ? "error" : "primary"}
            onClick={handleConfirmAction}
            disabled={actionLoading}
            sx={{ textTransform: "none" }}
          >
            {actionLoading ? <CircularProgress size={20} /> : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

