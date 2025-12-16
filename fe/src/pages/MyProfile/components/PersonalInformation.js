// components/PersonalInformation.js
import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Transgender as OtherIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

const PersonalInformation = ({
  profile,
  formData,
  isEditing,
  loading,
  onInputChange,
  onSaveProfile,
  onCancelEdit,
}) => {
  return (
    <Card
      sx={{
        borderRadius: "16px",
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e0e0e0",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <SectionHeader
          icon={<PersonIcon />}
          title="Thông tin cá nhân"
          subtitle="Cập nhật thông tin cá nhân của bạn tại đây"
        />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Địa chỉ email"
              value={profile.account?.Email || ""}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#1a237e" }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "10px",
                  backgroundColor: "#fafafa",
                  "&.Mui-disabled": {
                    backgroundColor: "#f5f5f5",
                  },
                },
              }}
              helperText="Email không thể thay đổi"
              sx={{
                "& .MuiFormHelperText-root": {
                  fontSize: "0.75rem",
                  color: "#757575",
                  ml: 0,
                },
              }}
            />
          </Grid>
          
          <RoleSpecificFields
            profile={profile}
            formData={formData}
            isEditing={isEditing}
            onInputChange={onInputChange}
          />
        </Grid>

        {isEditing && (
          <ActionButtons
            loading={loading}
            onSave={onSaveProfile}
            onCancel={onCancelEdit}
          />
        )}
      </CardContent>
    </Card>
  );
};

const SectionHeader = ({ icon, title, subtitle }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      mb: 3,
      pb: 2.5,
      borderBottom: "1px solid #e0e0e0",
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: "10px",
        backgroundColor: "#1a237e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 3px 8px rgba(26, 35, 126, 0.15)",
      }}
    >
      {React.cloneElement(icon, { 
        sx: { 
          color: "white", 
          fontSize: 24 
        } 
      })}
    </Box>
    <Box>
      <Typography 
        variant="h6" 
        fontWeight="600"
        sx={{ color: "#1a237e" }}
      >
        {title}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          color: "#757575",
          fontSize: "0.875rem",
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  </Box>
);

const MultilineTextField = ({
  label,
  name,
  value,
  disabled,
  onChange,
  icon,
  rows = 2,
}) => (
  <TextField
    fullWidth
    label={label}
    name={name}
    value={value}
    onChange={onChange}
    disabled={disabled}
    multiline
    rows={rows}
    InputLabelProps={{
      sx: {
        fontSize: "0.875rem",
        "&.Mui-focused": {
          color: "#1a237e",
        },
      },
    }}
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment 
            position="start"
            sx={{
              alignSelf: 'flex-start',
              marginTop: '10px',
              marginRight: '8px',
            }}
          >
            {React.cloneElement(icon, { 
              sx: { 
                color: disabled ? "#bdbdbd" : "#1a237e",
                fontSize: 20 
              } 
            })}
          </InputAdornment>
        ),
      },
    }}
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: "10px",
        alignItems: 'flex-start',
        paddingTop: '8px',
        backgroundColor: disabled ? "#f5f5f5" : "#ffffff",
        '&:hover fieldset': {
          borderColor: disabled ? "#e0e0e0" : "#1a237e",
        },
        '&.Mui-focused fieldset': {
          borderColor: "#1a237e",
          borderWidth: 2,
        },
      },
      '& .MuiInputBase-inputMultiline': {
        marginTop: '4px',
      },
    }}
  />
);

const RoleSpecificFields = ({ profile, formData, isEditing, onInputChange }) => {
  const commonFields = (
    <>
      <Grid item xs={12} md={6}>
        <FormTextField
          label="Họ và tên"
          name="FullName"
          value={formData.FullName || ""}
          disabled={!isEditing}
          onChange={onInputChange}
          icon={<PersonIcon />}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <GenderSelect
          label="Giới tính"
          name="Gender"
          value={formData.Gender || formData.account?.Gender || ""}
          disabled={!isEditing}
          onChange={onInputChange}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormTextField
          label="Số điện thoại"
          name="Phone"
          value={formData.Phone || ""}
          disabled={!isEditing}
          onChange={onInputChange}
          icon={<PhoneIcon />}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormTextField
          label="Ngày sinh"
          name="DateOfBirth"
          type="date"
          value={formData.DateOfBirth ? new Date(formData.DateOfBirth).toLocaleDateString('en-CA') : ""}
          disabled={!isEditing}
          onChange={onInputChange}
          icon={<CalendarIcon />}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormTextField
          label="Nghề nghiệp"
          name="Job"
          value={formData.Job || ""}
          disabled={!isEditing}
          onChange={onInputChange}
          icon={<WorkIcon />}
        />
      </Grid>
      
 <Grid item xs={12}>
  <MultilineTextField
    label="Địa chỉ"
    name="Address"
    value={formData.Address || ""}
    disabled={!isEditing}
    onChange={onInputChange}
    icon={<HomeIcon />}
    rows={2}
  />
</Grid>
    </>
  );

  if (profile.Role === "instructor") {
    return (
      <>
        {commonFields}
        <Grid item xs={12} md={6}>
          <FormTextField
            label="Chuyên ngành"
            name="Major"
            value={formData.Major || ""}
            disabled={!isEditing}
            onChange={onInputChange}
            icon={<SchoolIcon />}
          />
        </Grid>
      </>
    );
  }

  return commonFields;
};

const GenderSelect = ({
  label,
  name,
  value,
  disabled,
  onChange,
}) => {
  const getGenderIcon = (genderValue) => {
    switch (genderValue) {
      case "male":
        return <MaleIcon sx={{ color: "#1a237e" }} />;
      case "female":
        return <FemaleIcon sx={{ color: "#1a237e" }} />;
      case "other":
        return <OtherIcon sx={{ color: "#1a237e" }} />;
      default:
        return <OtherIcon sx={{ color: "#1a237e" }} />;
    }
  };

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel 
        sx={{ 
          fontSize: "0.875rem",
          "&.Mui-focused": {
            color: "#1a237e",
          }
        }}
      >
        {label}
      </InputLabel>
      <Select
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        sx={{
          borderRadius: "10px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#e0e0e0",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1a237e",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1a237e",
            borderWidth: 2,
          },
        }}
      >
        <MenuItem value="">
          <em>Chọn giới tính</em>
        </MenuItem>
        <MenuItem value="male">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MaleIcon sx={{ fontSize: 20, color: "#1a237e" }} />
            <span>Nam</span>
          </Box>
        </MenuItem>
        <MenuItem value="female">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FemaleIcon sx={{ fontSize: 20, color: "#1a237e" }} />
            <span>Nữ</span>
          </Box>
        </MenuItem>
        <MenuItem value="other">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <OtherIcon sx={{ fontSize: 20, color: "#1a237e" }} />
            <span>Khác</span>
          </Box>
        </MenuItem>
      </Select>
    </FormControl>
  );
};

const FormTextField = ({
  label,
  name,
  value,
  disabled,
  onChange,
  icon,
  type = "text",
  multiline = false,
  rows = 1,
  InputLabelProps,
}) => (
  <TextField
    fullWidth
    label={label}
    name={name}
    type={type}
    value={value}
    onChange={onChange}
    disabled={disabled}
    multiline={multiline}
    rows={rows}
    InputLabelProps={{
      ...InputLabelProps,
      sx: {
        fontSize: "0.875rem",
        "&.Mui-focused": {
          color: "#1a237e",
        },
      },
    }}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          {React.cloneElement(icon, { 
            sx: { 
              color: disabled ? "#bdbdbd" : "#1a237e",
              fontSize: 20 
            } 
          })}
        </InputAdornment>
      ),
      sx: {
        borderRadius: "10px",
        backgroundColor: disabled ? "#f5f5f5" : "#ffffff",
        "&:hover fieldset": {
          borderColor: disabled ? "#e0e0e0" : "#1a237e",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#1a237e",
          borderWidth: 2,
        },
      },
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
      },
    }}
  />
);

const ActionButtons = ({ loading, onSave, onCancel }) => (
  <Box 
    sx={{ 
      mt: 4, 
      display: "flex", 
      gap: 2,
      flexWrap: "wrap",
      justifyContent: "flex-end",
    }}
  >
    <Button
      variant="outlined"
      onClick={onCancel}
      sx={{
        borderRadius: "10px",
        px: 3,
        py: 1,
        minWidth: 120,
        borderColor: "#d32f2f",
        color: "#d32f2f",
        borderWidth: 2,
        textTransform: "none",
        fontSize: "0.9375rem",
        fontWeight: 500,
        "&:hover": {
          backgroundColor: "#ffebee",
          borderColor: "#d32f2f",
          borderWidth: 2,
        },
        transition: "all 0.2s ease",
      }}
    >
      Hủy bỏ
    </Button>
    
    <Button
      variant="contained"
      startIcon={<SaveIcon />}
      onClick={onSave}
      disabled={loading}
      sx={{
        borderRadius: "10px",
        px: 4,
        py: 1,
        minWidth: 140,
        backgroundColor: "#1a237e",
        textTransform: "none",
        fontSize: "0.9375rem",
        fontWeight: 500,
        "&:hover": {
          backgroundColor: "#283593",
          boxShadow: "0 4px 12px rgba(26, 35, 126, 0.3)",
          transform: "translateY(-1px)",
        },
        "&.Mui-disabled": {
          backgroundColor: "#e0e0e0",
          color: "#9e9e9e",
        },
        transition: "all 0.2s ease",
        boxShadow: "0 3px 10px rgba(26, 35, 126, 0.2)",
      }}
    >
      {loading ? "Đang lưu..." : "Lưu thay đổi"}
    </Button>
  </Box>
);

export default PersonalInformation;