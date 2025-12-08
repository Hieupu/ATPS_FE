import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Tooltip,
  Paper,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DescriptionIcon from "@mui/icons-material/Description";
// --- MỚI THÊM: Icon Download ---
import DownloadIcon from "@mui/icons-material/Download";

const MATERIAL_STATUS_OPTIONS = ["VISIBLE", "HIDDEN"];

export default function MaterialsSection({
  materials,
  loadingMaterials,
  onCreateMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [initialValues, setInitialValues] = useState(null);

  const handleOpenCreate = () => {
    setDialogMode("create");
    setInitialValues({
      MaterialID: null,
      Title: "",
      Status: "VISIBLE",
      file: null,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (material) => {
    setDialogMode("edit");
    setInitialValues({
      MaterialID: material.MaterialID,
      Title: material.Title || "",
      Status: material.Status || "VISIBLE",
      file: null,
      existingFileName: material.FileURL
        ? material.FileURL.split("/").pop()
        : "",
      existingFileUrl: material.FileURL || "",
    });
    setDialogOpen(true);
  };

  const handleSubmitDialog = async (values) => {
    const payload = {
      Title: values.Title,
      Status: values.Status,
      file: values.file || undefined,
    };
    try {
      if (dialogMode === "create") {
        await onCreateMaterial(payload);
      } else {
        await onUpdateMaterial(values.MaterialID, payload);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error("Material dialog submit error:", err);
    }
  };

  const handleDeleteClick = async (material) => {
    if (!window.confirm(`Xóa tài liệu "${material.Title}"?`)) return;
    try {
      await onDeleteMaterial(material.MaterialID);
    } catch (err) {
      console.error("Delete material error:", err);
    }
  };

  const renderStatusChip = (status) => {
    const isVisible = status === "VISIBLE";
    return (
      <Chip
        size="small"
        variant="outlined"
        color={isVisible ? "success" : "default"}
        icon={isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
        label={isVisible ? "Hiển thị" : "Ẩn"}
      />
    );
  };

  return (
    <Box>
      {/* Header giống CurriculumSection */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: 2,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Tài liệu khóa học
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Quản lý các tài liệu đính kèm hỗ trợ cho khóa học
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            size="large"
            sx={{
              bgcolor: "white",
              color: "#667eea",
              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
              px: 3,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Thêm tài liệu mới
          </Button>
        </Stack>
      </Paper>

      {/* Nội dung */}
      {loadingMaterials ? (
        <Box
          sx={{
            py: 6,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={48} />
        </Box>
      ) : !materials || materials.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 2,
            border: "2px dashed",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chưa có tài liệu nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Thêm các file PDF, slide hoặc tài liệu tham khảo để hỗ trợ học viên.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Thêm tài liệu đầu tiên
          </Button>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tên tài liệu</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tài liệu</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((m, idx) => (
                <TableRow key={m.MaterialID} hover>
                  <TableCell>{idx + 1}</TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <DescriptionIcon fontSize="small" sx={{ opacity: 0.7 }} />
                      <Typography variant="body2" fontWeight={500} noWrap>
                        {m.Title}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* --- Cột: Tài liệu (ĐÃ CHỈNH SỬA) --- */}
                  <TableCell>
                    {m.FileURL ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          component="a"
                          href={m.FileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="body2"
                          color="primary"
                          sx={{
                            textDecoration: "underline",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {m.FileURL.split("/").pop() || "Xem tài liệu"}
                        </Typography>

                        {/* Nút Download */}
                        <Tooltip title="Tải xuống">
                          <IconButton
                            component="a"
                            href={m.FileURL}
                            download // Thuộc tính HTML5 hỗ trợ tải xuống
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            sx={{ color: "text.secondary" }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Không có file
                      </Typography>
                    )}
                  </TableCell>

                  {/* Trạng thái */}
                  <TableCell>{renderStatusChip(m.Status)}</TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Chỉnh sửa tài liệu">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(m)}
                          sx={{ "&:hover": { bgcolor: "primary.light" } }}
                        >
                          <EditIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa tài liệu">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(m)}
                          sx={{ "&:hover": { bgcolor: "error.light" } }}
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <MaterialFormDialog
        open={dialogOpen}
        mode={dialogMode}
        initialValues={initialValues}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmitDialog}
      />
    </Box>
  );
}

function MaterialFormDialog({ open, onClose, mode, initialValues, onSubmit }) {
  const [values, setValues] = useState({
    MaterialID: null,
    Title: "",
    Status: "VISIBLE",
    file: null,
    existingFileName: "",
    existingFileUrl: "",
  });

  useEffect(() => {
    if (open && initialValues) {
      setValues((prev) => ({ ...prev, ...initialValues }));
    }
  }, [open, initialValues]);

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setValues((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleSave = () => {
    onSubmit(values);
  };

  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {isEdit ? "Chỉnh sửa tài liệu" : "Thêm tài liệu mới"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Tên tài liệu"
            placeholder="Ví dụ: Slide chương 1, Tài liệu tham khảo..."
            fullWidth
            required
            value={values.Title}
            onChange={handleChange("Title")}
          />

          <TextField
            select
            label="Trạng thái"
            fullWidth
            value={values.Status}
            onChange={handleChange("Status")}
          >
            {MATERIAL_STATUS_OPTIONS.map((st) => (
              <MenuItem key={st} value={st}>
                {st === "VISIBLE" ? "Hiển thị" : "Ẩn"}
              </MenuItem>
            ))}
          </TextField>

          {/* Upload file giống style LessonFormDialog */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              File tài liệu
            </Typography>

            <Button
              component="label"
              variant="outlined"
              fullWidth
              sx={{
                py: 2,
                justifyContent: "flex-start",
                borderStyle: "dashed",
                borderWidth: 2,
                "&:hover": { borderStyle: "dashed" },
              }}
            >
              {values.file ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <DescriptionIcon color="primary" />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {values.file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      File mới sẽ được upload sau khi lưu.
                    </Typography>
                  </Box>
                </Stack>
              ) : values.existingFileName || values.existingFileUrl ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <DescriptionIcon color="action" />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {values.existingFileName ||
                        values.existingFileUrl.split("/").pop()}
                    </Typography>
                    {values.existingFileUrl && (
                      <Typography
                        variant="caption"
                        color="primary"
                        sx={{ textDecoration: "underline" }}
                        component="a"
                        href={values.existingFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Xem file hiện tại
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Nếu không chọn file mới, hệ thống sẽ giữ nguyên file này.
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Stack direction="row" spacing={2} alignItems="center">
                  <AddIcon />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Chọn file tài liệu (PDF, DOCX, PPTX, ...)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dung lượng phù hợp với quy định hệ thống.
                    </Typography>
                  </Box>
                </Stack>
              )}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button variant="contained" onClick={handleSave}>
          {isEdit ? "Cập nhật" : "Tạo tài liệu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
