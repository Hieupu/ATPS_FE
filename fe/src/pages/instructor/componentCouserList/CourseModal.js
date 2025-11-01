// src/pages/instructor/componentCouserList/CourseModal.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Chip,
  InputAdornment,
  Paper,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Title as TitleIcon,
  Description as DescriptionIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";

export default function CourseModal({
  open,
  type,
  data = {},
  onChange,
  onClose,
  onSubmit,
  loading,
}) {
  // Loại modal hiện tại
  const isCourse = type.includes("Course");
  const isUnit = type.includes("Unit");
  const isLesson = type.includes("Lesson");
  const isMaterial = type.includes("Material");

  // Config UI theo loại
  const getModalConfig = () => {
    if (isCourse) {
      return {
        title: "Khóa học",
        color: "#5b5bff",
        gradient: "linear-gradient(135deg, #5b5bff 0%, #4a4acc 100%)",
        icon: "📚",
      };
    }
    if (isUnit) {
      return {
        title: "Unit",
        color: "#10b981",
        gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        icon: "📖",
      };
    }
    if (isLesson) {
      return {
        title: "Bài học",
        color: "#f59e0b",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        icon: "🎓",
      };
    }
    return {
      title: "Tài liệu",
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      icon: "📄",
    };
  };

  const config = getModalConfig();

  const handleChange = (key, value) => onChange({ ...data, [key]: value });

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: config.gradient,
          color: "#fff",
          px: 3,
          py: 2.5,
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontSize: "2rem" }}>{config.icon}</Typography>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {type.includes("create") ? "Tạo mới" : "Cập nhật"} {config.title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {type.includes("create")
                ? `Điền thông tin để tạo ${config.title.toLowerCase()} mới`
                : `Chỉnh sửa thông tin ${config.title.toLowerCase()}`}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Body */}
      <DialogContent sx={{ p: 3, bgcolor: "#fafafa" }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            bgcolor: "#fff",
            borderRadius: 3,
            border: "1px solid #e5e7eb",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Title */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <TitleIcon sx={{ fontSize: 18, color: config.color }} />
                Tiêu đề
                <Chip
                  label="Bắt buộc"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    bgcolor: "#fee2e2",
                    color: "#dc2626",
                  }}
                />
              </Typography>
              <TextField
                placeholder={`Nhập tiêu đề ${config.title.toLowerCase()}...`}
                fullWidth
                variant="outlined"
                value={data.Title || ""}
                onChange={(e) => handleChange("Title", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#f9fafb",
                    transition: "all 0.3s",
                    "&:hover": {
                      bgcolor: "#fff",
                      "& fieldset": { borderColor: config.color },
                    },
                    "&.Mui-focused": {
                      bgcolor: "#fff",
                      "& fieldset": {
                        borderColor: config.color,
                        borderWidth: 2,
                      },
                    },
                  },
                }}
              />
            </Box>

            {/* Description for Course & Unit */}
            {(isCourse || isUnit) && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 18, color: config.color }} />
                  Mô tả
                </Typography>
                <TextField
                  placeholder={`Nhập mô tả chi tiết về ${config.title.toLowerCase()}...`}
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  value={data.Description || ""}
                  onChange={(e) => handleChange("Description", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#f9fafb",
                      transition: "all 0.3s",
                      "&:hover": {
                        bgcolor: "#fff",
                        "& fieldset": { borderColor: config.color },
                      },
                      "&.Mui-focused": {
                        bgcolor: "#fff",
                        "& fieldset": {
                          borderColor: config.color,
                          borderWidth: 2,
                        },
                      },
                    },
                  }}
                />
              </Box>
            )}

            {/* Course fields */}
            {isCourse && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <TimeIcon sx={{ fontSize: 18, color: config.color }} />
                      Thời lượng
                    </Typography>
                    <TextField
                      type="number"
                      inputProps={{ step: "0.1", min: 0 }}
                      placeholder="VD: 40"
                      fullWidth
                      variant="outlined"
                      value={data.Duration || ""}
                      onChange={(e) => handleChange("Duration", e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography
                              variant="body2"
                              sx={{ color: "#6b7280" }}
                            >
                              giờ
                            </Typography>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#f9fafb",
                          transition: "all 0.3s",
                          "&:hover": {
                            bgcolor: "#fff",
                            "& fieldset": { borderColor: config.color },
                          },
                          "&.Mui-focused": {
                            bgcolor: "#fff",
                            "& fieldset": {
                              borderColor: config.color,
                              borderWidth: 2,
                            },
                          },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <MoneyIcon sx={{ fontSize: 18, color: config.color }} />
                      Học phí
                    </Typography>
                    <TextField
                      type="number"
                      placeholder="VD: 2000000"
                      fullWidth
                      variant="outlined"
                      value={data.Fee || ""}
                      onChange={(e) => handleChange("Fee", e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography
                              variant="body2"
                              sx={{ color: "#6b7280" }}
                            >
                              VND
                            </Typography>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#f9fafb",
                          transition: "all 0.3s",
                          "&:hover": {
                            bgcolor: "#fff",
                            "& fieldset": { borderColor: config.color },
                          },
                          "&.Mui-focused": {
                            bgcolor: "#fff",
                            "& fieldset": {
                              borderColor: config.color,
                              borderWidth: 2,
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>
              </>
            )}

            {/* Unit field (tùy ý – cho phép text tự do) */}
            {isUnit && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <TimeIcon sx={{ fontSize: 18, color: config.color }} />
                  Thời lượng
                </Typography>
                <TextField
                  placeholder="VD: 5 giờ / 2 tuần"
                  fullWidth
                  variant="outlined"
                  value={data.Duration || ""}
                  onChange={(e) => handleChange("Duration", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#f9fafb",
                      transition: "all 0.3s",
                      "&:hover": {
                        bgcolor: "#fff",
                        "& fieldset": { borderColor: config.color },
                      },
                      "&.Mui-focused": {
                        bgcolor: "#fff",
                        "& fieldset": {
                          borderColor: config.color,
                          borderWidth: 2,
                        },
                      },
                    },
                  }}
                />
              </Box>
            )}

            {/* Lesson fields — CHUYỂN SANG GIỜ */}
            {isLesson && (
              <>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <TimeIcon sx={{ fontSize: 18, color: config.color }} />
                      Thời lượng (giờ)
                    </Typography>
                    <TextField
                      type="number"
                      inputProps={{ step: "0.1", min: 0 }}
                      placeholder="VD: 1.5"
                      fullWidth
                      variant="outlined"
                      value={data.Time || ""}
                      onChange={(e) => handleChange("Time", e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography
                              variant="body2"
                              sx={{ color: "#6b7280" }}
                            >
                              giờ
                            </Typography>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#f9fafb",
                          transition: "all 0.3s",
                          "&:hover": {
                            bgcolor: "#fff",
                            "& fieldset": { borderColor: config.color },
                          },
                          "&.Mui-focused": {
                            bgcolor: "#fff",
                            "& fieldset": {
                              borderColor: config.color,
                              borderWidth: 2,
                            },
                          },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <FileIcon sx={{ fontSize: 18, color: config.color }} />
                      Loại bài học
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      value={data.Type || "video"}
                      onChange={(e) => handleChange("Type", e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#f9fafb",
                          transition: "all 0.3s",
                          "&:hover": {
                            bgcolor: "#fff",
                            "& fieldset": { borderColor: config.color },
                          },
                          "&.Mui-focused": {
                            bgcolor: "#fff",
                            "& fieldset": {
                              borderColor: config.color,
                              borderWidth: 2,
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="video">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <VideoIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
                          Video
                        </Box>
                      </MenuItem>
                      <MenuItem value="document">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <ArticleIcon
                            sx={{ fontSize: 18, color: "#3b82f6" }}
                          />
                          Document
                        </Box>
                      </MenuItem>
                    </TextField>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: "#374151",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <UploadIcon sx={{ fontSize: 18, color: config.color }} />
                    Tệp đính kèm
                  </Typography>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "#f9fafb",
                      border: "2px dashed #d1d5db",
                      borderRadius: 2,
                      textAlign: "center",
                      transition: "all 0.3s",
                      "&:hover": { borderColor: config.color, bgcolor: "#fff" },
                    }}
                  >
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<UploadIcon />}
                      sx={{
                        bgcolor: config.color,
                        color: "#fff",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        "&:hover": {
                          bgcolor: config.color,
                          filter: "brightness(0.9)",
                        },
                      }}
                    >
                      {data.FileURL || data.file
                        ? "Thay đổi file"
                        : "Chọn file"}
                      <input
                        type="file"
                        hidden
                        onChange={(e) => {
                          if (e.target.files.length > 0) {
                            handleChange("file", e.target.files[0]);
                          }
                        }}
                      />
                    </Button>

                    {(data.FileURL || data.file) && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: "#fff",
                          borderRadius: 2,
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <FileIcon
                            sx={{ color: config.color, fontSize: 24 }}
                          />
                          <Box sx={{ flex: 1, textAlign: "left" }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#374151" }}
                            >
                              {data.file
                                ? data.file.name
                                : data.FileURL?.split("/").pop()}
                            </Typography>
                            {data.file && (
                              <Typography
                                variant="caption"
                                sx={{ color: "#6b7280" }}
                              >
                                {formatFileSize(data.file.size)}
                              </Typography>
                            )}
                          </Box>
                          {data.FileURL && !data.file && (
                            <Button
                              size="small"
                              href={data.FileURL}
                              target="_blank"
                              sx={{ textTransform: "none" }}
                            >
                              Xem
                            </Button>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                </Box>
              </>
            )}

            {/* Material fields */}
            {isMaterial && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <FileIcon sx={{ fontSize: 18, color: config.color }} />
                  File URL
                </Typography>
                <TextField
                  placeholder="https://example.com/file.pdf"
                  fullWidth
                  variant="outlined"
                  value={data.FileURL || ""}
                  onChange={(e) => handleChange("FileURL", e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#f9fafb",
                      transition: "all 0.3s",
                      "&:hover": {
                        bgcolor: "#fff",
                        "& fieldset": { borderColor: config.color },
                      },
                      "&.Mui-focused": {
                        bgcolor: "#fff",
                        "& fieldset": {
                          borderColor: config.color,
                          borderWidth: 2,
                        },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          bgcolor: "#fafafa",
          borderTop: "1px solid #e5e7eb",
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{
            color: "#6b7280",
            borderColor: "#d1d5db",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: 2,
            transition: "all 0.2s",
            "&:hover": { bgcolor: "#f3f4f6", borderColor: "#9ca3af" },
          }}
        >
          Hủy
        </Button>

        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            background: config.gradient,
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1,
            minWidth: 120,
            borderRadius: 2,
            boxShadow: `0 4px 12px ${config.color}40`,
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: `0 6px 16px ${config.color}60`,
              transform: "translateY(-1px)",
            },
            "&.Mui-disabled": { bgcolor: "#d1d5db", color: "#fff" },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : (
            <>💾 Lưu</>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
