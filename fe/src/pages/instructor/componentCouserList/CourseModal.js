// src/pages/instructor/components/CourseModal.js
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
} from "@mui/material";

export default function CourseModal({
  open,
  type,
  data = {},
  onChange,
  onClose,
  onSubmit,
  loading,
}) {
  // Xác định loại modal hiện tại
  const isCourse = type.includes("Course");
  const isUnit = type.includes("Unit");
  const isLesson = type.includes("Lesson");
  const isMaterial = type.includes("Material");

  // Hàm xử lý thay đổi dữ liệu
  const handleChange = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(91, 91, 255, 0.12)",
        },
      }}
    >
      {/* ===== TIÊU ĐỀ ===== */}
      <DialogTitle
        sx={{
          color: "#5b5bff",
          fontWeight: 600,
          fontSize: "1.25rem",
          pb: 1,
        }}
      >
        {type.includes("create") ? "Tạo mới" : "Cập nhật"}{" "}
        {isCourse
          ? "Khóa học"
          : isUnit
          ? "Unit"
          : isLesson
          ? "Bài học"
          : "Tài liệu"}
      </DialogTitle>

      {/* ===== NỘI DUNG FORM ===== */}
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            pt: 2,
          }}
        >
          {/* Trường Tiêu đề - Luôn hiển thị */}
          <TextField
            label="Tiêu đề"
            fullWidth
            variant="outlined"
            value={data.Title || ""}
            onChange={(e) => handleChange("Title", e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fafafa",
                "&:hover fieldset": {
                  borderColor: "#5b5bff",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#5b5bff",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#5b5bff",
              },
            }}
          />

          {/* Trường Mô tả - Chỉ cho Course và Unit */}
          {(isCourse || isUnit) && (
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={data.Description || ""}
              onChange={(e) => handleChange("Description", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fafafa",
                  "&:hover fieldset": {
                    borderColor: "#5b5bff",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#5b5bff",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#5b5bff",
                },
              }}
            />
          )}

          {/* Các trường đặc biệt cho Course */}
          {isCourse && (
            <>
              <TextField
                label="Thời lượng (giờ)"
                type="number"
                fullWidth
                variant="outlined"
                value={data.Duration || ""}
                onChange={(e) => handleChange("Duration", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fafafa",
                    "&:hover fieldset": {
                      borderColor: "#5b5bff",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#5b5bff",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#5b5bff",
                  },
                }}
              />
              <TextField
                label="Học phí (VND)"
                type="number"
                fullWidth
                variant="outlined"
                value={data.Fee || ""}
                onChange={(e) => handleChange("Fee", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fafafa",
                    "&:hover fieldset": {
                      borderColor: "#5b5bff",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#5b5bff",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#5b5bff",
                  },
                }}
              />
            </>
          )}

          {/* Trường Thời lượng cho Unit */}
          {isUnit && (
            <TextField
              label="Thời lượng (VD: 5h)"
              fullWidth
              variant="outlined"
              value={data.Duration || ""}
              onChange={(e) => handleChange("Duration", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fafafa",
                  "&:hover fieldset": {
                    borderColor: "#5b5bff",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#5b5bff",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#5b5bff",
                },
              }}
            />
          )}

          {/* Các trường đặc biệt cho Lesson */}
          {isLesson && (
            <>
              <TextField
                label="Thời gian (phút)"
                type="number"
                fullWidth
                variant="outlined"
                value={data.Time || ""}
                onChange={(e) => handleChange("Time", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fafafa",
                    "&:hover fieldset": {
                      borderColor: "#5b5bff",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#5b5bff",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#5b5bff",
                  },
                }}
              />
              <TextField
                select
                label="Loại"
                fullWidth
                variant="outlined"
                value={data.Type || "video"}
                onChange={(e) => handleChange("Type", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fafafa",
                    "&:hover fieldset": {
                      borderColor: "#5b5bff",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#5b5bff",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#5b5bff",
                  },
                }}
              >
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="document">Document</MenuItem>
              </TextField>
              <TextField
                label="File URL"
                fullWidth
                variant="outlined"
                value={data.FileURL || ""}
                onChange={(e) => handleChange("FileURL", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fafafa",
                    "&:hover fieldset": {
                      borderColor: "#5b5bff",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#5b5bff",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#5b5bff",
                  },
                }}
              />
            </>
          )}

          {/* Trường File URL cho Material */}
          {isMaterial && (
            <TextField
              label="File URL"
              fullWidth
              variant="outlined"
              value={data.FileURL || ""}
              onChange={(e) => handleChange("FileURL", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#fafafa",
                  "&:hover fieldset": {
                    borderColor: "#5b5bff",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#5b5bff",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#5b5bff",
                },
              }}
            />
          )}
        </Box>
      </DialogContent>

      {/* ===== CÁC NÚT HÀNH ĐỘNG ===== */}
      <DialogActions
        sx={{
          justifyContent: "flex-end",
          gap: 1.5,
          px: 3,
          pb: 2.5,
        }}
      >
        {/* Nút Hủy */}
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: "#64748b",
            borderColor: "#e2e8f0",
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: "#f1f5f9",
              borderColor: "#cbd5e1",
            },
          }}
        >
          Hủy
        </Button>

        {/* Nút Lưu */}
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: "#5b5bff",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            minWidth: 100,
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "#4a4acc",
              boxShadow: "0 4px 12px rgba(91, 91, 255, 0.3)",
            },
            "&.Mui-disabled": {
              bgcolor: "#c7d2fe",
              color: "#fff",
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
