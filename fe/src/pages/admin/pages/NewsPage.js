import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
  CircularProgress,
  Alert,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Avatar,
  Stack,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Add,
  Search,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Article,
  UploadFile,
  MoreVert,
} from "@mui/icons-material";
import newsService from "../../../apiServices/newsService";
import { toast } from "react-toastify";
import { cloudinaryUpload } from "../../../utils/cloudinaryUpload";
import "./style.css";

const BASE_API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:9999/api";
const API_HOST = BASE_API_URL.replace(/\/api\/?$/, "");

const STATUS_FILTERS = [
  { key: "all", status: null },
  { key: "published", status: "published" },
  { key: "pending", status: "pending" },
  { key: "rejected", status: "rejected" },
  { key: "deleted", status: "deleted" },
];

const PAGE_SIZE = 10;

const buildImageUrl = (path) => {
  if (!path) return "";
  // Nếu đã là URL đầy đủ (Cloudinary hoặc http/https), trả về trực tiếp
  if (path.startsWith("http")) return path;
  // Nếu là path tương đối, build URL từ API host (cho backward compatibility)
  return `${API_HOST}${path.startsWith("/") ? path : `/${path}`}`;
};

export default function NewsPage() {
  const showToast = (severity, message) => {
    const content = (
      <div style={{ whiteSpace: "pre-line" }}>{String(message || "")}</div>
    );
    switch (severity) {
      case "success":
        return toast.success(content);
      case "error":
        return toast.error(content);
      case "warn":
        return toast.warn(content);
      case "info":
      default:
        return toast.info(content);
    }
  };
  const [tabValue, setTabValue] = useState(0);
  const [selectedNews, setSelectedNews] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    Title: "",
    Content: "",
    Image: "",
    Status: "pending",
    StaffID: 1, // TODO: Lấy từ auth context
  });

  // Menu & dialog xem chi tiết
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNewsForView, setSelectedNewsForView] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedNewsToReject, setSelectedNewsToReject] = useState(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all news once, then filter & paginate on the client like LearnersPage
      const response = await newsService.getAllNews();
      const list =
        (Array.isArray(response?.data) && response.data) ||
        (Array.isArray(response) && response) ||
        [];
      setAllNews(list);
    } catch (error) {
      setError("Không thể tải danh sách tin tức");
      setAllNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleResetSearch = () => {
    setSearchInput("");
    setPage(1);
    setSearchQuery("");
  };

  const handleMenuOpen = (event, newsItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedNewsForView(newsItem);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenViewDialog = () => {
    setViewDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedNewsForView(null);
  };

  const handleOpenRejectDialog = () => {
    if (selectedNewsForView) {
      setSelectedNewsToReject(selectedNewsForView);
      setRejectReason("");
      setRejectDialogOpen(true);
    }
  };

  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false);
    setSelectedNewsToReject(null);
    setRejectReason("");
  };

  const handleTriggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setImageUploadError(null);

      const imageUrl = await cloudinaryUpload(file, setUploadingImage);

      if (!imageUrl) {
        throw new Error("Không thể tải ảnh lên Cloudinary");
      }

      setFormData((prev) => ({
        ...prev,
        Image: imageUrl,
      }));
    } catch (uploadError) {
      setImageUploadError(
        uploadError?.message || "Không thể tải ảnh lên. Vui lòng thử lại."
      );
    } finally {
      setUploadingImage(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleOpenDialog = (newsItem = null) => {
    setImageUploadError(null);
    if (newsItem) {
      setFormData({
        Title: newsItem.Title || "",
        Content: newsItem.Content || "",
        Image: newsItem.Image || "",
        Status: newsItem.Status || "pending",
        StaffID: newsItem.StaffID || 1,
      });
      setSelectedNews(newsItem);
    } else {
      setFormData({
        Title: "",
        Content: "",
        Image: "",
        Status: "pending",
        StaffID: 1,
      });
      setSelectedNews(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedNews(null);
    setImageUploadError(null);
    setUploadingImage(false);
    setFormData({
      Title: "",
      Content: "",
      Image: "",
      Status: "pending",
      StaffID: 1,
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.Title || !formData.Content) {
        setError("Vui lòng điền đầy đủ thông tin");
        return;
      }

      if (selectedNews) {
        await newsService.updateNews(selectedNews.NewsID, formData);
      } else {
        await newsService.createNews(formData);
      }

      handleCloseDialog();
      loadNews();
    } catch (error) {
      setError(error.message || "Không thể lưu tin tức");
    }
  };

  const handleDelete = async () => {
    if (!selectedNews) return;
    try {
      await newsService.deleteNews(selectedNews.NewsID);
      setOpenDeleteDialog(false);
      loadNews();
    } catch (error) {
      setError(error.message || "Không thể xóa tin tức");
    }
  };

  const handleApprove = async (newsItem) => {
    try {
      await newsService.approveNews(newsItem.NewsID);
      loadNews();
    } catch (error) {
      setError(error.message || "Không thể duyệt tin tức");
    }
  };

  const handleReject = async (newsItem, reason) => {
    try {
      await newsService.rejectNews(newsItem.NewsID, reason);
      loadNews();
    } catch (error) {
      setError(error.message || "Không thể từ chối tin tức");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return { bg: "#dcfce7", color: "#16a34a" };
      case "pending":
        return { bg: "#e0e7ff", color: "#6366f1" };
      case "rejected":
        return { bg: "#fee2e2", color: "#dc2626" };
      case "deleted":
        return { bg: "#f3f4f6", color: "#6b7280" };
      default:
        return { bg: "#f1f5f9", color: "#64748b" };
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "Đang tuyển sinh";
      case "pending":
        return "Chờ duyệt";
      case "rejected":
        return "Đã từ chối";

      default:
        return status || "Unknown";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case "pending":
        return <HourglassEmpty sx={{ fontSize: 16 }} />;
      case "rejected":
        return <Cancel sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  // Client-side filtering & pagination (aligned with LearnersPage pattern)
  const filteredNews = useMemo(() => {
    const status =
      tabValue === 1
        ? "published"
        : tabValue === 2
        ? "pending"
        : tabValue === 3
        ? "rejected"
        : tabValue === 4
        ? "deleted"
        : null;

    const search = searchQuery.trim().toLowerCase();

    return allNews.filter((item) => {
      const matchesStatus = !status || item.Status?.toLowerCase() === status;
      const matchesSearch =
        !search ||
        item.Title?.toLowerCase().includes(search) ||
        item.Content?.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [allNews, tabValue, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNews.length / PAGE_SIZE) || 1
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const displayNews = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return filteredNews.slice(startIndex, endIndex);
  }, [filteredNews, page]);

  const statusCounts = useMemo(() => {
    const counts = {
      all: allNews.length,
      published: 0,
      pending: 0,
      rejected: 0,
      deleted: 0,
    };
    allNews.forEach((item) => {
      const statusKey = (item.Status || "").toLowerCase();
      if (counts[statusKey] !== undefined) {
        counts[statusKey] += 1;
      }
    });
    return counts;
  }, [allNews]);

  const allCount = statusCounts.all ?? 0;
  const publishedCount = statusCounts.published ?? 0;
  const pendingCount = statusCounts.pending ?? 0;
  const rejectedCount = statusCounts.rejected ?? 0;

  return (
    <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Quản lý Tin tức
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Xem, duyệt hoặc từ chối tin tức do staff gửi lên
            </Typography>
          </Box>
        </Box>

        {/* Search */}
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}
        >
          <TextField
            placeholder="Tìm kiếm tin tức..."
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#fff",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<Search />}
            sx={{
              textTransform: "none",
              backgroundColor: "#667eea",
              "&:hover": { backgroundColor: "#5568d3" },
              borderRadius: 2,
              px: 3,
            }}
          >
            Tìm kiếm
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={handleResetSearch}
            disabled={!searchInput && !searchQuery}
            sx={{
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Xóa
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => {
            setTabValue(newValue);
            setPage(1);
          }}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "14px",
              minHeight: "48px",
            },
            "& .Mui-selected": {
              color: "#667eea",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#667eea",
            },
          }}
        >
          <Tab label={`Tất cả (${allCount})`} />
          <Tab label={`Đang tuyển sinh (${publishedCount})`} />
          <Tab label={`Chờ duyệt (${pendingCount})`} />
          <Tab label={`Đã từ chối (${rejectedCount})`} />
        </Tabs>
      </Box>

      {/* News Grid */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ảnh</TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày đăng</TableCell>
                <TableCell>Tác giả</TableCell>
                <TableCell>Nội dung</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress sx={{ color: "#667eea" }} />
                  </TableCell>
                </TableRow>
              ) : displayNews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Stack alignItems="center" spacing={1} py={4}>
                      <Article sx={{ fontSize: 48, color: "#cbd5e0" }} />
                      <Typography variant="subtitle1" color="text.secondary">
                        Không có tin tức nào
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery
                          ? "Thử điều chỉnh từ khóa tìm kiếm"
                          : "Tạo tin tức đầu tiên để bắt đầu"}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                displayNews.map((newsItem) => {
                  const imageSrc = buildImageUrl(newsItem.Image || "");
                  return (
                    <TableRow key={newsItem.NewsID} hover>
                      <TableCell>
                        {newsItem.Image ? (
                          <Box
                            component="img"
                            src={imageSrc}
                            alt={newsItem.Title}
                            sx={{
                              width: 80,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 2,
                              border: "1px solid #e2e8f0",
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <Avatar
                            variant="rounded"
                            sx={{
                              width: 60,
                              height: 60,
                              bgcolor: "#e2e8f0",
                              color: "#94a3b8",
                            }}
                          >
                            <Article />
                          </Avatar>
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {newsItem.Title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(newsItem.Status)}
                          size="small"
                          icon={getStatusIcon(newsItem.Status)}
                          sx={{
                            backgroundColor: getStatusColor(newsItem.Status).bg,
                            color: getStatusColor(newsItem.Status).color,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {newsItem.PostedDate
                          ? new Date(newsItem.PostedDate).toLocaleDateString(
                              "vi-VN"
                            )
                          : "—"}
                      </TableCell>
                      <TableCell>{newsItem.StaffName || "—"}</TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {newsItem.Content}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, newsItem)}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        )}
      </Card>

      {/* Menu hành động: chỉ có "Xem" */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            minWidth: 180,
          },
        }}
      >
        {selectedNewsForView && (
          <MenuItem onClick={handleOpenViewDialog}>Xem chi tiết</MenuItem>
        )}
      </Menu>

      {/* Dialog xem chi tiết + duyệt / từ chối */}
      <Dialog
        open={viewDialogOpen && Boolean(selectedNewsForView)}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {selectedNewsForView?.Title || "Chi tiết tin tức"}
        </DialogTitle>
        <DialogContent dividers>
          {selectedNewsForView && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {selectedNewsForView.Image && (
                <Box
                  component="img"
                  src={buildImageUrl(selectedNewsForView.Image)}
                  alt={selectedNewsForView.Title}
                  sx={{
                    width: "100%",
                    maxHeight: 260,
                    objectFit: "cover",
                    borderRadius: 2,
                    mb: 2,
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <Typography variant="subtitle2" sx={{ color: "#64748b" }}>
                Tác giả: <strong>{selectedNewsForView.StaffName || "—"}</strong>
              </Typography>
              <Typography variant="subtitle2" sx={{ color: "#64748b" }}>
                Ngày đăng:{" "}
                <strong>
                  {selectedNewsForView.PostedDate
                    ? new Date(selectedNewsForView.PostedDate).toLocaleString(
                        "vi-VN"
                      )
                    : "—"}
                </strong>
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
                >
                  {selectedNewsForView.Content}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={handleCloseViewDialog}
            sx={{ textTransform: "none", color: "#64748b" }}
          >
            Đóng
          </Button>
          {selectedNewsForView &&
            selectedNewsForView.Status?.toLowerCase() === "pending" && (
              <>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleOpenRejectDialog}
                  sx={{ textTransform: "none" }}
                >
                  Từ chối
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={async () => {
                    await handleApprove(selectedNewsForView);
                    handleCloseViewDialog();
                  }}
                  sx={{ textTransform: "none" }}
                >
                  Duyệt
                </Button>
              </>
            )}
        </DialogActions>
      </Dialog>

      {/* Dialog nhập lý do từ chối tin tức */}
      <Dialog
        open={rejectDialogOpen}
        onClose={handleCloseRejectDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ fontWeight: 700, pb: 2, borderBottom: "2px solid #e2e8f0" }}
        >
          Từ chối tin tức
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedNewsToReject && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2, color: "#64748b" }}>
                Vui lòng nhập lý do từ chối:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Nội dung chưa phù hợp với định hướng truyền thông, vui lòng chỉnh sửa lại."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={handleCloseRejectDialog}
            sx={{
              textTransform: "none",
              color: "#64748b",
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={async () => {
              const trimmed = rejectReason.trim();
              if (!trimmed) {
                showToast("warn", "Vui lòng nhập lý do từ chối.");
                return;
              }
              if (!selectedNewsToReject) {
                handleCloseRejectDialog();
                return;
              }
              await handleReject(selectedNewsToReject, trimmed);
              handleCloseRejectDialog();
              handleCloseViewDialog();
            }}
            variant="contained"
            color="error"
            sx={{
              textTransform: "none",
            }}
            disabled={!rejectReason || rejectReason.trim() === ""}
          >
            Xác nhận từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
