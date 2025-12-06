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
import "./style.css";

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

export default function PromotionsPage() {
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
      console.log("[PromotionsPage] API response:", response);

      // Backend trả về: { success: true, data: [...], pagination: {...} }
      // promotionService.getPromotions() trả về response.data (axios wrap)
      // Nên response = { success: true, data: [...], pagination: {...} }

      // Kiểm tra response format
      if (!response) {
        throw new Error("Không nhận được response từ server");
      }

      // Lấy items từ response
      const items = response?.data || response?.items || [];
      const paginationInfo = response?.pagination || {};

      console.log("[PromotionsPage] Parsed items count:", items?.length || 0);
      console.log("[PromotionsPage] Parsed pagination:", paginationInfo);

      // Đảm bảo items là array
      if (!Array.isArray(items)) {
        console.error("[PromotionsPage] Items is not an array:", items);
        throw new Error("Dữ liệu không đúng định dạng");
      }

      setPromotions(items);
      setPagination({
        total: paginationInfo.total || items.length || 0,
        totalPages:
          paginationInfo.totalPages ||
          Math.ceil((items.length || 0) / limit) ||
          1,
      });
    } catch (error) {
      console.error("Lỗi tải promotions:", error);
      setPromotions([]);
      setPagination({ total: 0, totalPages: 1 });
      setToast({
        open: true,
        severity: "error",
        message: error?.message || "Không thể tải danh sách promotion",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPromotions = useMemo(() => {
    return promotions.filter((promotion) => {
      if (filters.status === "all") return true;
      return (promotion.Status || "").toLowerCase() === filters.status;
    });
  }, [promotions, filters]);

  const stats = useMemo(() => {
    const total = promotions.length;
    const active = promotions.filter(
      (p) => (p.Status || "").toLowerCase() === "active"
    ).length;
    const inactive = promotions.filter(
      (p) => (p.Status || "").toLowerCase() === "inactive"
    ).length;
    const expired = promotions.filter(
      (p) => (p.Status || "").toLowerCase() === "expired"
    ).length;
    return { total, active, inactive, expired };
  }, [promotions]);

  const handleFilterChange = (field, value) => {
    setPendingFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    setFilters(pendingFilters);
    setPage(1);
  };

  const clearFilters = () => {
    const reset = { search: "", status: "all" };
    setPendingFilters(reset);
    setFilters(reset);
    setPage(1);
  };

  const openCreateDialog = () => {
    setFormData(initialFormData);
    setErrors({});
    setEditingPromotion(null);
    setDialogOpen(true);
  };

  const openEditDialog = (promotion) => {
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
    setErrors({});
    setEditingPromotion(promotion);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPromotion(null);
    setFormData(initialFormData);
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // Clear error khi user thay đổi giá trị
      if (errors[field]) {
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[field];
          return newErrors;
        });
      }

      // Validate real-time cho ngày
      if (field === "StartDate" || field === "EndDate") {
        const newErrors = { ...errors };

        // Clear error của field đang thay đổi
        delete newErrors[field];

        // Validate lại nếu cả 2 ngày đều có giá trị
        if (updated.StartDate && updated.EndDate) {
          const startDate = dayjs(updated.StartDate);
          const endDate = dayjs(updated.EndDate);

          if (endDate.isBefore(startDate, "day")) {
            newErrors.EndDate = "Ngày kết thúc phải sau ngày bắt đầu";
          } else {
            delete newErrors.EndDate;
          }
        }

        setErrors(newErrors);
      }

      return updated;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Code.trim()) newErrors.Code = "Vui lòng nhập mã promotion";
    if (formData.Code && !/^[A-Za-z0-9_-]{3,20}$/.test(formData.Code.trim())) {
      newErrors.Code = "Mã promotion chỉ gồm chữ/số (3-20 ký tự)";
    }

    if (formData.Discount === "" || formData.Discount === null) {
      newErrors.Discount = "Vui lòng nhập phần trăm giảm";
    } else {
      const discountValue = Number(formData.Discount);
      if (
        Number.isNaN(discountValue) ||
        discountValue < 0 ||
        discountValue > 100
      ) {
        newErrors.Discount = "Discount phải nằm trong 0 - 100";
      }
    }

    if (!formData.StartDate) {
      newErrors.StartDate = "Vui lòng chọn ngày bắt đầu";
    }

    // Validate ngày kết thúc phải sau hoặc bằng ngày bắt đầu
    if (formData.EndDate) {
      if (!formData.StartDate) {
        newErrors.EndDate = "Vui lòng chọn ngày bắt đầu trước";
      } else {
        const startDate = dayjs(formData.StartDate);
        const endDate = dayjs(formData.EndDate);

        // Ngày kết thúc phải sau hoặc bằng ngày bắt đầu
        if (endDate.isBefore(startDate, "day")) {
          newErrors.EndDate = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu";
        }
        // Cho phép cùng ngày (promotion có hiệu lực trong 1 ngày)
        // Nếu muốn bắt buộc sau ngày bắt đầu, thay dòng trên bằng:
        // if (endDate.isBefore(startDate, "day") || endDate.isSame(startDate, "day")) {
        //   newErrors.EndDate = "Ngày kết thúc phải sau ngày bắt đầu";
        // }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitPromotion = async () => {
    if (!validateForm()) return;

    try {
      setActionLoading(true);
      if (editingPromotion) {
        // Khi update, không gửi CreateBy (giữ nguyên giá trị cũ)
        const updatePayload = {
          Code: formData.Code.trim().toUpperCase(),
          Discount: Number(formData.Discount),
          StartDate: formData.StartDate,
          EndDate: formData.EndDate || null,
          Status: formData.Status,
        };

        await promotionService.updatePromotion(
          editingPromotion.PromotionID,
          updatePayload
        );
        setToast({
          open: true,
          severity: "success",
          message: "Cập nhật promotion thành công",
        });
      } else {
        // Khi tạo mới, gửi CreateBy
        const createPayload = {
          Code: formData.Code.trim().toUpperCase(),
          Discount: Number(formData.Discount),
          StartDate: formData.StartDate,
          EndDate: formData.EndDate || null,
          Status: formData.Status,
          CreateBy: user?.AccID || user?.accId || null,
        };

        await promotionService.createPromotion(createPayload);
        setToast({
          open: true,
          severity: "success",
          message: "Tạo promotion mới thành công",
        });
      }

      closeDialog();
      fetchPromotions();
    } catch (error) {
      console.error("Lỗi lưu promotion:", error);
      setToast({
        open: true,
        severity: "error",
        message: error?.message || "Không thể lưu promotion",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirmDialog = (type, promotion) => {
    setConfirmDialog({
      open: true,
      type,
      promotion,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      type: null,
      promotion: null,
    });
  };

  const handleDeletePromotion = async () => {
    if (!confirmDialog.promotion) return;
    try {
      setActionLoading(true);
      await promotionService.deletePromotion(
        confirmDialog.promotion.PromotionID
      );
      setToast({
        open: true,
        severity: "success",
        message: "Đã xóa promotion",
      });
      closeConfirmDialog();
      fetchPromotions();
    } catch (error) {
      console.error("Lỗi xóa promotion:", error);
      setToast({
        open: true,
        severity: "error",
        message: error?.message || "Không thể xóa promotion",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (promotion) => {
    try {
      setActionLoading(true);
      const isInactive = promotion.Status?.toLowerCase() === "inactive";
      if (isInactive) {
        await promotionService.activatePromotion(promotion.PromotionID);
        setToast({
          open: true,
          severity: "success",
          message: "Đã kích hoạt promotion",
        });
      } else {
        await promotionService.deactivatePromotion(promotion.PromotionID);
        setToast({
          open: true,
          severity: "info",
          message: "Đã tắt promotion",
        });
      }
      fetchPromotions();
    } catch (error) {
      console.error("Lỗi đổi trạng thái promotion:", error);
      setToast({
        open: true,
        severity: "error",
        message: error?.message || "Không thể đổi trạng thái",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Không giới hạn";
    return dayjs(date).format("DD/MM/YYYY");
  };

  const renderStatusChip = (statusKey) => {
    const config = statusStyles[statusKey] || statusStyles.inactive;
    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.bg,
          color: config.color,
          fontWeight: 600,
        }}
      />
    );
  };

  return (
    <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Quản lý Promotion
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Theo dõi và cấu hình các chương trình khuyến mãi/ưu đãi
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openCreateDialog}
            sx={{ backgroundColor: "#6366f1", textTransform: "none" }}
          >
            Thêm promotion
          </Button>
        </Stack>
      </Stack>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: "Tổng promotion",
            value: stats.total,
            color: "#6366f1",
          },
          {
            label: "Đang hoạt động",
            value: stats.active,
            color: "#22c55e",
          },
          {
            label: "Đã tắt",
            value: stats.inactive,
            color: "#0ea5e9",
          },
          {
            label: "Đã hết hạn",
            value: stats.expired,
            color: "#f97316",
          },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 8px 30px rgba(15,23,42,0.08)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <CardContent>
                <LocalOffer sx={{ color: card.color, mb: 1 }} />
                <Typography
                  variant="body2"
                  sx={{ color: "#94a3b8", fontWeight: 600 }}
                >
                  {card.label}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: "#0f172a" }}
                >
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 600, mb: 2 }}>
          Bộ lọc & tìm kiếm
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              placeholder="Tìm theo mã promotion hoặc người tạo"
              fullWidth
              size="small"
              value={pendingFilters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Trạng thái"
              value={pendingFilters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              {statusFilterOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={applyFilters}
              sx={{ textTransform: "none" }}
            >
              Áp dụng
            </Button>
            <Button
              variant="text"
              onClick={clearFilters}
              sx={{ textTransform: "none", color: "#ef4444" }}
            >
              Xóa lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ p: 8, display: "flex", justifyContent: "center" }}>
            <CircularProgress sx={{ color: "#6366f1" }} />
          </Box>
        ) : filteredPromotions.length === 0 ? (
          <Box sx={{ p: 8, textAlign: "center" }}>
            <LocalOffer sx={{ fontSize: 48, color: "#cbd5f5", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#475569" }}>
              Không có promotion nào trùng bộ lọc
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Hãy thử điều chỉnh bộ lọc hoặc tạo promotion mới
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Mã</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Giảm giá</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Hiệu lực</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Người tạo</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPromotions.map((promotion) => (
                    <TableRow key={promotion.PromotionID} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {promotion.Code}
                      </TableCell>
                      <TableCell>{promotion.Discount}%</TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatDate(promotion.StartDate)} -{" "}
                            {formatDate(promotion.EndDate)}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#94a3b8" }}
                          >
                            {promotion.EndDate
                              ? `${
                                  dayjs(promotion.EndDate).diff(
                                    dayjs(promotion.StartDate),
                                    "day"
                                  ) + 1
                                } ngày`
                              : "Không giới hạn"}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {promotion.CreatedByUsername || "Admin"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          {promotion.CreatedByEmail || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {renderStatusChip(
                          (promotion.Status || "").toLowerCase()
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <Tooltip title="Sửa promotion">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => openEditDialog(promotion)}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip
                            title={
                              promotion.Status?.toLowerCase() === "inactive"
                                ? "Kích hoạt"
                                : "Vô hiệu hóa"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(promotion)}
                                disabled={actionLoading}
                              >
                                {promotion.Status?.toLowerCase() ===
                                "inactive" ? (
                                  <PlayCircle
                                    fontSize="small"
                                    sx={{ color: "#16a34a" }}
                                  />
                                ) : (
                                  <PauseCircle
                                    fontSize="small"
                                    sx={{ color: "#f97316" }}
                                  />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Xóa promotion">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  openConfirmDialog("delete", promotion)
                                }
                                disabled={actionLoading}
                              >
                                <Delete
                                  fontSize="small"
                                  sx={{ color: "#ef4444" }}
                                />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          </>
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingPromotion ? "Chỉnh sửa promotion" : "Thêm promotion mới"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Mã promotion"
              value={formData.Code}
              onChange={(e) => handleInputChange("Code", e.target.value)}
              error={!!errors.Code}
              helperText={errors.Code}
              placeholder="Ví dụ: WELCOME50"
              inputProps={{ style: { textTransform: "uppercase" } }}
            />
            <TextField
              label="% giảm"
              type="number"
              value={formData.Discount}
              onChange={(e) => handleInputChange("Discount", e.target.value)}
              error={!!errors.Discount}
              helperText={errors.Discount}
              inputProps={{ min: 0, max: 100 }}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Ngày bắt đầu"
                type="date"
                fullWidth
                value={formData.StartDate}
                onChange={(e) => handleInputChange("StartDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!errors.StartDate}
                helperText={errors.StartDate}
                inputProps={{
                  max: formData.EndDate || undefined, // Không cho chọn sau ngày kết thúc nếu đã có
                }}
              />
              <TextField
                label="Ngày kết thúc (tuỳ chọn)"
                type="date"
                fullWidth
                value={formData.EndDate}
                onChange={(e) => handleInputChange("EndDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!errors.EndDate}
                helperText={
                  errors.EndDate || "Để trống nếu không giới hạn thời gian"
                }
                inputProps={{
                  min: formData.StartDate || undefined, // Không cho chọn trước ngày bắt đầu
                }}
              />
            </Stack>
            <TextField
              select
              label="Trạng thái"
              value={formData.Status}
              onChange={(e) => handleInputChange("Status", e.target.value)}
            >
              <MenuItem value="active">Đang chạy</MenuItem>
              <MenuItem value="inactive">Đã tắt</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDialog} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={submitPromotion}
            disabled={actionLoading}
            sx={{ textTransform: "none" }}
          >
            {editingPromotion ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận thao tác</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Bạn có chắc chắn muốn{" "}
            {confirmDialog.type === "delete" ? "xóa" : "thực hiện hành động"}{" "}
            promotion <strong>{confirmDialog.promotion?.Code}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeConfirmDialog} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeletePromotion}
            disabled={actionLoading}
            sx={{ textTransform: "none" }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
