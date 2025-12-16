import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import uploadService from "../../../apiServices/uploadService";
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateFullName,
  validateConfirmPassword,
} from "../../../utils/validate";

const statusOptions = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
  { value: "banned", label: "Bị khóa" },
];

const genderOptions = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const UserFormModal = ({
  open,
  onClose,
  onSubmit,
  title,
  formData,
  setFormData,
  errors,
  setErrors,
  saving = false,
  isEditing = false,
  // Props cho instructor-specific fields
  showInstructorFields = false,
  instructorService = null,
  // Props cho learner-specific (hide inactive status, show banned)
  showLearnerStatus = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const loadingMsg = document.createElement("div");
    loadingMsg.textContent = "Đang tải ảnh lên...";
    loadingMsg.style.cssText =
      "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999;";
    document.body.appendChild(loadingMsg);

    try {
      const result = await uploadService.uploadAvatar(file);
      setFormData((prev) => ({
        ...prev,
        ProfilePicture: result.url || result.data?.url,
      }));
      document.body.removeChild(loadingMsg);
      alert("Tải ảnh thành công!");
    } catch (error) {
      if (document.body.contains(loadingMsg)) {
        document.body.removeChild(loadingMsg);
      }
      alert(error?.message || "Không thể tải ảnh");
    }
  };

  const handleCVUpload = async (event) => {
    if (!instructorService) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const loadingMsg = document.createElement("div");
    loadingMsg.textContent = "Đang tải CV lên...";
    loadingMsg.style.cssText =
      "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999;";
    document.body.appendChild(loadingMsg);

    try {
      const result = await instructorService.uploadCV(file);
      setFormData((prev) => ({
        ...prev,
        CV: result.url || result.data?.url,
      }));
      if (errors.CV) {
        setErrors((prev) => {
          const { CV: _, ...rest } = prev;
          return rest;
        });
      }
      document.body.removeChild(loadingMsg);
      alert("Tải CV thành công!");
    } catch (error) {
      if (document.body.contains(loadingMsg)) {
        document.body.removeChild(loadingMsg);
      }
      alert(error?.message || "Không thể tải CV");
    }
  };

  const handleClose = () => {
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={showInstructorFields ? "md" : "sm"}
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {/* FullName */}
          <TextField
            label="Họ tên"
            value={formData.FullName || ""}
            onChange={(e) => handleFieldChange("FullName", e.target.value)}
            fullWidth
            required
            error={!!errors.FullName}
            helperText={errors.FullName}
          />

          {/* Email and Phone */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Email"
              value={formData.Email || ""}
              onChange={(e) => handleFieldChange("Email", e.target.value)}
              fullWidth
              required
              error={!!errors.Email}
              helperText={errors.Email}
            />
            <TextField
              label="Điện thoại"
              value={formData.Phone || ""}
              onChange={(e) => handleFieldChange("Phone", e.target.value)}
              fullWidth
              error={!!errors.Phone}
              helperText={errors.Phone}
            />
          </Stack>

          {/* Password */}
          {!isEditing && (
            <>
              <TextField
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                value={formData.Password || ""}
                onChange={(e) => handleFieldChange("Password", e.target.value)}
                fullWidth
                required
                error={!!errors.Password}
                helperText={errors.Password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Nhập lại mật khẩu"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.ConfirmPassword || ""}
                onChange={(e) =>
                  handleFieldChange("ConfirmPassword", e.target.value)
                }
                fullWidth
                required
                error={!!errors.ConfirmPassword}
                helperText={errors.ConfirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}
          {isEditing && (
            <>
              <TextField
                label="Đặt lại mật khẩu (tùy chọn)"
                type={showPassword ? "text" : "password"}
                value={formData.Password || ""}
                onChange={(e) => handleFieldChange("Password", e.target.value)}
                fullWidth
                error={!!errors.Password}
                helperText={errors.Password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {formData.Password && (
                <TextField
                  label="Nhập lại mật khẩu"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.ConfirmPassword || ""}
                  onChange={(e) =>
                    handleFieldChange("ConfirmPassword", e.target.value)
                  }
                  fullWidth
                  error={!!errors.ConfirmPassword}
                  helperText={errors.ConfirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </>
          )}

          {/* Instructor-specific fields */}
          {showInstructorFields && (
            <>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  select
                  label="Loại giảng viên"
                  value={formData.Type || "parttime"}
                  onChange={(e) => handleFieldChange("Type", e.target.value)}
                  fullWidth
                  required
                >
                  <MenuItem value="parttime">Part-time</MenuItem>
                  <MenuItem value="fulltime">Full-time</MenuItem>
                </TextField>
                <TextField
                  select
                  label="Giới tính"
                  value={formData.Gender || "other"}
                  onChange={(e) => handleFieldChange("Gender", e.target.value)}
                  fullWidth
                >
                  {genderOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Trạng thái"
                  value={formData.Status || "active"}
                  onChange={(e) => handleFieldChange("Status", e.target.value)}
                  fullWidth
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Chuyên môn"
                  value={formData.Major || ""}
                  onChange={(e) => handleFieldChange("Major", e.target.value)}
                  fullWidth
                  required
                  error={!!errors.Major}
                  helperText={errors.Major}
                  placeholder="Ví dụ: Full Stack Development"
                />
                <TextField
                  label="Nghề nghiệp"
                  value={formData.Job || ""}
                  onChange={(e) => handleFieldChange("Job", e.target.value)}
                  fullWidth
                  placeholder="Ví dụ: Giảng viên, Developer"
                />
              </Stack>

              <TextField
                label="Phí giảng dạy (VND)"
                type="number"
                value={formData.InstructorFee || ""}
                onChange={(e) =>
                  handleFieldChange(
                    "InstructorFee",
                    parseFloat(e.target.value) || null
                  )
                }
                fullWidth
                inputProps={{ min: 0, step: 1000 }}
                placeholder="Ví dụ: 500000"
                error={!!errors.InstructorFee}
                helperText={
                  errors.InstructorFee ||
                  "Phí giảng dạy phải từ 1,000 VND trở lên"
                }
              />
            </>
          )}

          {/* Common fields: Status, Gender (if not instructor) */}
          {!showInstructorFields && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Trạng thái"
                value={formData.Status || "active"}
                onChange={(e) => handleFieldChange("Status", e.target.value)}
                fullWidth
              >
                {statusOptions
                  .filter(
                    (opt) =>
                      showLearnerStatus
                        ? opt.value !== "inactive" // For learners: hide "inactive", show "banned"
                        : true // For admin/staff: show all options
                  )
                  .map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                select
                label="Giới tính"
                value={formData.Gender || "other"}
                onChange={(e) => handleFieldChange("Gender", e.target.value)}
                fullWidth
              >
                {genderOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}

          {/* Job field (for learners) */}
          {showLearnerStatus && !showInstructorFields && (
            <TextField
              label="Nghề nghiệp"
              value={formData.Job || ""}
              onChange={(e) => handleFieldChange("Job", e.target.value)}
              fullWidth
              placeholder="Ví dụ: Sinh viên, Developer"
            />
          )}

          {/* Address and DateOfBirth */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Địa chỉ"
              value={formData.Address || ""}
              onChange={(e) => handleFieldChange("Address", e.target.value)}
              fullWidth
            />
            <TextField
              label="Ngày sinh"
              type="date"
              value={formData.DateOfBirth || ""}
              onChange={(e) => handleFieldChange("DateOfBirth", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>

          {/* Profile Picture */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Ảnh đại diện
            </Typography>
            {formData.ProfilePicture && (
              <Box sx={{ mb: 1 }}>
                <img
                  src={formData.ProfilePicture}
                  alt="avatar preview"
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: 12,
                    objectFit: "cover",
                    border: "1px solid #ddd",
                  }}
                />
              </Box>
            )}
            <input
              type="file"
              id="user-avatar-input"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarUpload}
            />
            <Button
              variant="outlined"
              component="label"
              htmlFor="user-avatar-input"
              size="small"
            >
              Chọn ảnh
            </Button>
          </Box>

          {/* CV Upload (instructor only) */}
          {showInstructorFields && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                CV <span style={{ color: "red" }}>*</span>
              </Typography>
              {formData.CV && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    CV đã tải:{" "}
                    <a
                      href={formData.CV}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1976d2" }}
                    >
                      Xem CV
                    </a>
                  </Typography>
                </Box>
              )}
              <input
                type="file"
                id="cvFile"
                accept=".pdf,.doc,.docx,image/*"
                style={{ display: "none" }}
                onChange={handleCVUpload}
              />
              <Button
                variant="outlined"
                component="label"
                htmlFor="cvFile"
                size="small"
                fullWidth
                sx={{
                  borderColor: errors.CV ? "#d32f2f" : undefined,
                }}
              >
                Chọn CV
              </Button>
              {errors.CV && (
                <Typography
                  variant="caption"
                  sx={{ color: "#d32f2f", mt: 0.5, display: "block" }}
                >
                  {errors.CV}
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          Hủy
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={saving}>
          {saving ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormModal;
