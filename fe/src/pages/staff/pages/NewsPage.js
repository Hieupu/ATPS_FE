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
  Stack,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Add,
  Search,
  HourglassEmpty,
  Article,
  MoreVert,
} from "@mui/icons-material";
import newsService from "../../../apiServices/newsService";
import { cloudinaryUpload } from "../../../utils/cloudinaryUpload";
import { useAuth } from "../../../contexts/AuthContext";

// Màn staff: quản lý tin tức của riêng mình, gửi admin duyệt

const STATUS_FILTERS = [
  { key: "all", status: null, label: "Tất cả" },
  { key: "pending", status: "pending", label: "Chờ duyệt" },
  { key: "published", status: "published", label: "Đã duyệt" },
  { key: "rejected", status: "rejected", label: "Bị từ chối" },
];

const PAGE_SIZE = 10;

export default function StaffNewsPage() {
  const { user } = useAuth();
  const staffId = user?.StaffID;

  const [tabValue, setTabValue] = useState(0);
  const [selectedNews, setSelectedNews] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("edit"); // "view" | "edit"
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
    Status: "pending", // Staff tạo tin → mặc định chờ duyệt
    StaffID: staffId || null,
  });

  // Menu hành động cho từng tin
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNewsForMenu, setSelectedNewsForMenu] = useState(null);

  useEffect(() => {
    loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      // BE đã lọc theo StaffID cho role staff
      const response = await newsService.getAllNews({
        page: 1,
        limit: 1000,
      });
      const list =
        (Array.isArray(response?.data) && response.data) ||
        (Array.isArray(response) && response) ||
        [];
      setAllNews(list);
    } catch (err) {
      console.error("[StaffNewsPage] loadNews error:", err);
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
    setSelectedNewsForMenu(newsItem);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuView = () => {
    if (selectedNewsForMenu) {
      handleOpenDialog(selectedNewsForMenu, "view");
    }
    handleMenuClose();
  };

  const handleMenuEdit = () => {
    if (selectedNewsForMenu) {
      handleOpenDialog(selectedNewsForMenu, "edit");
    }
    handleMenuClose();
  };

  const handleMenuDelete = () => {
    if (selectedNewsForMenu) {
      handleOpenDeleteDialog(selectedNewsForMenu);
    }
    handleMenuClose();
  };

  const handleOpenDialog = (newsItem = null, mode = "edit") => {
    setImageUploadError(null);
    if (newsItem) {
      setFormData({
        Title: newsItem.Title || "",
        Content: newsItem.Content || "",
        Image: newsItem.Image || "",
        Status: newsItem.Status || "pending",
        StaffID: staffId || newsItem.StaffID || null,
      });
      setSelectedNews(newsItem);
    } else {
      setFormData({
        Title: "",
        Content: "",
        Image: "",
        Status: "pending",
        StaffID: staffId || null,
      });
      setSelectedNews(null);
    }
    setDialogMode(mode);
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
      StaffID: staffId || null,
    });
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

  const handleSave = async () => {
    try {
      if (!formData.Title || !formData.Content) {
        setError("Vui lòng điền đầy đủ tiêu đề và nội dung");
        return;
      }
      const payload = {
        ...formData,
        // StaffID sẽ được BE gắn dựa trên tài khoản đăng nhập
        Status: "pending", // Staff chỉ tạo/chỉnh sửa tin ở trạng thái chờ duyệt
      };

      if (selectedNews) {
        // Cho phép sửa khi pending hoặc rejected
        if (
          selectedNews.Status !== "pending" &&
          selectedNews.Status !== "rejected"
        ) {
          setError(
            "Chỉ có thể chỉnh sửa tin tức ở trạng thái Chờ duyệt hoặc Bị từ chối"
          );
          return;
        }
        await newsService.updateNews(selectedNews.NewsID, payload);
      } else {
        await newsService.createNews(payload);
      }

      handleCloseDialog();
      loadNews();
    } catch (err) {
      console.error("[StaffNewsPage] handleSave error:", err);
      setError(err.message || "Không thể lưu tin tức");
    }
  };

  const handleOpenDeleteDialog = (newsItem) => {
    setSelectedNews(newsItem);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedNews(null);
  };

  const handleDelete = async () => {
    if (!selectedNews) return;
    try {
      // Chỉ cho xóa khi pending hoặc rejected
      if (
        selectedNews.Status !== "pending" &&
        selectedNews.Status !== "rejected"
      ) {
        setError(
          "Chỉ có thể xóa tin tức ở trạng thái Chờ duyệt hoặc Bị từ chối"
        );
        setOpenDeleteDialog(false);
        return;
      }

      await newsService.deleteNews(selectedNews.NewsID);
      setOpenDeleteDialog(false);
      loadNews();
    } catch (err) {
      console.error("[StaffNewsPage] handleDelete error:", err);
      setError(err.message || "Không thể xóa tin tức");
    }
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "published":
        return { bg: "#dcfce7", color: "#16a34a", label: "Đã duyệt" };
      case "pending":
        return { bg: "#e0e7ff", color: "#6366f1", label: "Chờ duyệt" };
      case "rejected":
        return { bg: "#fee2e2", color: "#dc2626", label: "Bị từ chối" };
      case "deleted":
        return { bg: "#f3f4f6", color: "#6b7280", label: "Đã xóa" };
      default:
        return { bg: "#f3f4f6", color: "#6b7280", label: status || "Khác" };
    }
  };

  // Lọc theo tab + search
  const filteredNews = useMemo(() => {
    const statusFilter = STATUS_FILTERS[tabValue]?.status;
    let list = allNews;

    if (statusFilter) {
      list = list.filter(
        (n) => (n.Status || "").toLowerCase() === statusFilter
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          (n.Title || "").toLowerCase().includes(q) ||
          (n.Content || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [allNews, tabValue, searchQuery]);

  // Phân trang client-side
  const paginatedNews = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredNews.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredNews, page]);

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / PAGE_SIZE));

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Tin tức của tôi
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Tạo và quản lý tin tức, gửi admin duyệt để hiển thị cho học viên.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog(null)}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Tạo tin mới
        </Button>
      </Box>

      {/* Thanh tìm kiếm */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Tìm theo tiêu đề hoặc nội dung"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 280 }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Tìm kiếm
          </Button>
          <Button
            variant="text"
            onClick={handleResetSearch}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Xóa bộ lọc
          </Button>
        </Box>
      </Card>

      {/* Tabs trạng thái */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          mb: 2,
          "& .MuiTab-root": { textTransform: "none" },
        }}
      >
        <Tab label={`Tất cả (${allNews.length})`} />
        <Tab
          label={`Chờ duyệt (${
            allNews.filter((n) => (n.Status || "").toLowerCase() === "pending")
              .length
          })`}
        />
        <Tab
          label={`Đã duyệt (${
            allNews.filter(
              (n) => (n.Status || "").toLowerCase() === "published"
            ).length
          })`}
        />
        <Tab
          label={`Bị từ chối (${
            allNews.filter((n) => (n.Status || "").toLowerCase() === "rejected")
              .length
          })`}
        />
      </Tabs>

      {/* Danh sách tin */}
      <Card sx={{ p: 2 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
            }}
          >
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Đang tải tin tức...</Typography>
          </Box>
        ) : filteredNews.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center", color: "#64748b" }}>
            <Article sx={{ fontSize: 40, mb: 1, color: "#cbd5f5" }} />
            <Typography>Chưa có tin tức nào phù hợp.</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ảnh</TableCell>
                    <TableCell>Tiêu đề</TableCell>
                    <TableCell>Ngày đăng</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="right">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedNews.map((news) => {
                    const statusInfo = getStatusColor(news.Status);
                    const canEdit =
                      news.Status === "pending" ||
                      news.Status === "rejected" ||
                      !news.Status;
                    const canDelete = canEdit;

                    return (
                      <TableRow key={news.NewsID}>
                        <TableCell>
                          {news.Image ? (
                            <Box
                              component="img"
                              src={news.Image}
                              alt={news.Title}
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
                            <Typography
                              variant="body2"
                              sx={{ color: "#9ca3af", fontStyle: "italic" }}
                            >
                              Không có ảnh
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, maxWidth: 360 }}
                              noWrap
                            >
                              {news.Title}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {news.PostedDate
                              ? new Date(news.PostedDate).toLocaleString(
                                  "vi-VN"
                                )
                              : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusInfo.label}
                            size="small"
                            sx={{
                              backgroundColor: statusInfo.bg,
                              color: statusInfo.color,
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, news)}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          </>
        )}
      </Card>

      {/* Thông báo lỗi */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Menu hành động: Xem/Chỉnh sửa, Xóa */}
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
        {selectedNewsForMenu && (
          <>
            <MenuItem onClick={handleMenuView}>Xem</MenuItem>
            {(selectedNewsForMenu.Status === "pending" ||
              selectedNewsForMenu.Status === "rejected" ||
              !selectedNewsForMenu.Status) && (
              <MenuItem onClick={handleMenuEdit}>Chỉnh sửa</MenuItem>
            )}
            {(selectedNewsForMenu.Status === "pending" ||
              selectedNewsForMenu.Status === "rejected" ||
              !selectedNewsForMenu.Status) && (
              <MenuItem onClick={handleMenuDelete}>Xóa</MenuItem>
            )}
          </>
        )}
      </Menu>

      {/* Dialog tạo/chỉnh sửa tin */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "view"
            ? "Xem chi tiết tin tức"
            : selectedNews
            ? "Chỉnh sửa tin tức"
            : "Tạo tin tức mới"}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Tiêu đề"
              fullWidth
              InputProps={{ readOnly: dialogMode === "view" }}
              value={formData.Title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, Title: e.target.value }))
              }
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Nội dung
              </Typography>
              <TextareaAutosize
                minRows={6}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  resize: "vertical",
                  backgroundColor:
                    dialogMode === "view" ? "#f9fafb" : "inherit",
                }}
                readOnly={dialogMode === "view"}
                value={formData.Content}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    Content: e.target.value,
                  }))
                }
              />
            </Box>

            {/* Ảnh đại diện */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Ảnh minh họa (tuỳ chọn)
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleTriggerImageUpload}
                  disabled={uploadingImage || dialogMode === "view"}
                  startIcon={<Article />}
                  sx={{ textTransform: "none" }}
                >
                  {uploadingImage ? "Đang tải ảnh..." : "Chọn ảnh từ máy"}
                </Button>
                {formData.Image && (
                  <Typography
                    variant="body2"
                    sx={{ color: "#4b5563", maxWidth: 260 }}
                    noWrap
                  >
                    {formData.Image}
                  </Typography>
                )}
              </Box>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageFileChange}
              />
              {formData.Image && (
                <Box
                  sx={{
                    mt: 1,
                    maxWidth: 240,
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Box
                    component="img"
                    src={formData.Image}
                    alt="Preview"
                    sx={{
                      width: "100%",
                      maxHeight: 160,
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </Box>
              )}
              {imageUploadError && (
                <Alert
                  severity="error"
                  sx={{ mt: 1 }}
                  onClose={() => setImageUploadError(null)}
                >
                  {imageUploadError}
                </Alert>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            {dialogMode === "view" ? "Đóng" : "Hủy"}
          </Button>
          {dialogMode !== "view" && (
            <Button onClick={handleSave} variant="contained" color="primary">
              Lưu & gửi duyệt
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xóa tin tức</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Bạn có chắc muốn xóa tin{" "}
            <strong>{selectedNews?.Title || ""}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Hủy
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
