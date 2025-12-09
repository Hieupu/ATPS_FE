import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
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
  Paper,
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
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Article,
  UploadFile,
} from "@mui/icons-material";
import newsService from "../../../apiServices/newsService";
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

const buildImageUrl = (path) => {
  if (!path) return "";
  // Nếu đã là URL đầy đủ (Cloudinary hoặc http/https), trả về trực tiếp
  if (path.startsWith("http")) return path;
  // Nếu là path tương đối, build URL từ API host (cho backward compatibility)
  return `${API_HOST}${path.startsWith("/") ? path : `/${path}`}`;
};

export default function NewsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedNews, setSelectedNews] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    published: 0,
    pending: 0,
    rejected: 0,
    deleted: 0,
  });
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

  const fetchStatusCounts = useCallback(async () => {
    try {
      const responses = await Promise.all(
        STATUS_FILTERS.map(({ status }) =>
          newsService.getAllNews({
            page: 1,
            limit: 1,
            status,
          })
        )
      );

      const nextCounts = responses.reduce((acc, res, index) => {
        const total =
          res?.pagination?.total ??
          res?.total ??
          (Array.isArray(res?.data) ? res.data.length : 0);
        acc[STATUS_FILTERS[index].key] = total;
        return acc;
      }, {});

      setStatusCounts((prev) => ({ ...prev, ...nextCounts }));
    } catch (fetchError) {
      console.error("Error fetching news counts:", fetchError);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [tabValue, page, searchQuery]);

  useEffect(() => {
    fetchStatusCounts();
  }, [fetchStatusCounts]);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);

      let status = null;
      if (tabValue === 1) status = "published";
      else if (tabValue === 2) status = "pending";
      else if (tabValue === 3) status = "rejected";
      else if (tabValue === 4) status = "deleted";

      const params = {
        page,
        limit: 10,
        status,
        search: searchQuery,
      };

      const response = await newsService.getAllNews(params);
      setNews(response?.data || []);
      setTotalPages(response?.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error loading news:", error);
      setError("Không thể tải danh sách tin tức");
      setNews([]);
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
      console.error("Error uploading image:", uploadError);
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
      await fetchStatusCounts();
    } catch (error) {
      console.error("Error saving news:", error);
      setError(error.message || "Không thể lưu tin tức");
    }
  };

  const handleDelete = async () => {
    if (!selectedNews) return;
    try {
      await newsService.deleteNews(selectedNews.NewsID);
      setOpenDeleteDialog(false);
      loadNews();
      await fetchStatusCounts();
    } catch (error) {
      console.error("Error deleting news:", error);
      setError(error.message || "Không thể xóa tin tức");
    }
  };

  const handleApprove = async (newsItem) => {
    try {
      await newsService.approveNews(newsItem.NewsID);
      loadNews();
      await fetchStatusCounts();
    } catch (error) {
      console.error("Error approving news:", error);
      setError(error.message || "Không thể duyệt tin tức");
    }
  };

  const handleReject = async (newsItem) => {
    try {
      await newsService.rejectNews(newsItem.NewsID);
      loadNews();
      await fetchStatusCounts();
    } catch (error) {
      console.error("Error rejecting news:", error);
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
        return "Đã xuất bản";
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

  const displayNews = news;
  const allCount = statusCounts.all ?? news.length;
  const publishedCount = statusCounts.published ?? 0;
  const pendingCount = statusCounts.pending ?? 0;
  const rejectedCount = statusCounts.rejected ?? 0;
  const deletedCount = statusCounts.deleted ?? 0;

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
              Quản lý và cập nhật nội dung hiển thị công khai trên website
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: "#667eea",
              textTransform: "none",
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#5568d3",
              },
            }}
          >
            Tạo tin tức mới
          </Button>
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
          <Tab label={`Đã xuất bản (${publishedCount})`} />
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
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(newsItem)}
                            >
                              <Edit fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                          {newsItem.Status?.toLowerCase() === "pending" && (
                            <>
                              <Tooltip title="Duyệt">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleApprove(newsItem)}
                                >
                                  <CheckCircle fontSize="inherit" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Từ chối">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleReject(newsItem)}
                                >
                                  <Cancel fontSize="inherit" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedNews(newsItem);
                                setOpenDeleteDialog(true);
                              }}
                            >
                              <Delete fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
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

      {/* Create/Edit News Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {selectedNews ? "Chỉnh sửa tin tức" : "Tạo tin tức mới"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Tiêu đề"
              fullWidth
              required
              value={formData.Title}
              onChange={(e) =>
                setFormData({ ...formData, Title: e.target.value })
              }
              placeholder="Nhập tiêu đề tin tức"
            />
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleImageFileChange}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="outlined"
                startIcon={<UploadFile />}
                onClick={handleTriggerImageUpload}
                disabled={uploadingImage}
                sx={{ textTransform: "none" }}
              >
                {uploadingImage ? "Đang tải..." : "Chọn ảnh"}
              </Button>
              {formData.Image && (
                <Button
                  variant="text"
                  color="error"
                  onClick={() => setFormData({ ...formData, Image: "" })}
                  sx={{ textTransform: "none" }}
                >
                  Xóa ảnh
                </Button>
              )}
            </Stack>
            {imageUploadError && (
              <Typography variant="caption" color="error">
                {imageUploadError}
              </Typography>
            )}
            {formData.Image && (
              <Box
                component="img"
                src={buildImageUrl(formData.Image)}
                alt="News preview"
                sx={{
                  width: "100%",
                  maxHeight: 220,
                  objectFit: "cover",
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 600, color: "#374151" }}
              >
                Nội dung <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <TextareaAutosize
                minRows={8}
                placeholder="Nhập nội dung tin tức..."
                value={formData.Content}
                onChange={(e) =>
                  setFormData({ ...formData, Content: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </Box>
            <TextField
              label="Trạng thái"
              select
              fullWidth
              SelectProps={{
                native: true,
              }}
              value={formData.Status}
              onChange={(e) =>
                setFormData({ ...formData, Status: e.target.value })
              }
            >
              <option value="pending">Chờ duyệt</option>
              <option value="published">Đã xuất bản</option>
              <option value="rejected">Đã từ chối</option>
         
            </TextField>
          </Box>
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
            onClick={handleSave}
            sx={{
              textTransform: "none",
              backgroundColor: "#667eea",
              "&:hover": { backgroundColor: "#5568d3" },
            }}
          >
            {selectedNews ? "Cập nhật" : "Tạo"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa tin tức "{selectedNews?.Title}"? Hành động
            này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ textTransform: "none", color: "#64748b" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            sx={{
              textTransform: "none",
              backgroundColor: "#ef4444",
              "&:hover": { backgroundColor: "#dc2626" },
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
