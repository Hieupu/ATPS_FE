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
  Male as MaleIcon, Female as FemaleIcon, Transgender as OtherIcon
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
        borderRadius: "24px",
        background: "white",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <SectionHeader
          icon={<PersonIcon />}
          title="Personal Information"
          subtitle="Update your personal details here"
        />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Address"
              value={profile.account?.Email || ""}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
              helperText="Email address cannot be changed"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  bgcolor: "#f9fafb",
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
      pb: 2,
      borderBottom: "2px solid #f0f0f0",
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: "12px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {React.cloneElement(icon, { sx: { color: "white", fontSize: 28 } })}
    </Box>
    <Box>
      <Typography variant="h5" fontWeight="700">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  </Box>
);

const RoleSpecificFields = ({ profile, formData, isEditing, onInputChange }) => {
  console.log('formData:', formData);
  const commonFields = (
    <>
      <Grid item xs={12} md={6}>
        <FormTextField
          label="Full Name"
          name="FullName"
          value={formData.FullName || ""}
          disabled={!isEditing}
          onChange={onInputChange}
          icon={<PersonIcon />}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <GenderSelect
          label="Gender"
          name="Gender"
          value={formData.Gender || formData.account?.Gender || ""} // Sửa ở đây
          disabled={!isEditing}
          onChange={onInputChange}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormTextField
          label="Phone Number"
          name="Phone"
          value={formData.Phone || ""}
          disabled={!isEditing}
          onChange={onInputChange}
          icon={<PhoneIcon />}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormTextField
          label="Date of Birth"
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
          label="Job"
          name="Job"
          value={formData.Job || ""}
          disabled={!isEditing}
          onChange={onInputChange}
          icon={<WorkIcon />}
        />
      </Grid>
      <Grid item xs={12}>
        <FormTextField
          label="Address"
          name="Address"
          value={formData.Address || ""}
          disabled={!isEditing}
          onChange={onInputChange}
          icon={<HomeIcon />}
          multiline
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
            label="Major"
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
  // Hàm để lấy icon dựa trên giá trị hiện tại
  const getGenderIcon = (genderValue) => {
    switch (genderValue) {
      case "male":
        return <MaleIcon sx={{ color: "#6366f1" }} />;
      case "female":
        return <FemaleIcon sx={{ color: "#6366f1" }} />;
      case "other":
        return <OtherIcon sx={{ color: "#6366f1" }} />;
      default:
        return <OtherIcon sx={{ color: "#6366f1" }} />;
    }
  };

  return (
    <TextField
      fullWidth
      select
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {getGenderIcon(value)}
          </InputAdornment>
        ),
      }}
      SelectProps={{
        native: true,
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "12px",
          "&:hover fieldset": {
            borderColor: "#6366f1",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#6366f1",
          },
        },
      }}
    >
      <option value="">Select Gender</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </TextField>
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
    InputLabelProps={InputLabelProps}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          {React.cloneElement(icon, { sx: { color: "#6366f1" } })}
        </InputAdornment>
      ),
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: "12px",
        "&:hover fieldset": {
          borderColor: "#6366f1",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#6366f1",
        },
      },
    }}
  />
);

const ActionButtons = ({ loading, onSave, onCancel }) => (
  <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
    <Button
      variant="contained"
      startIcon={<SaveIcon />}
      onClick={onSave}
      disabled={loading}
      sx={{
        borderRadius: "12px",
        px: 4,
        py: 1.5,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
        textTransform: "none",
        fontSize: "16px",
        fontWeight: 600,
        "&:hover": {
          boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
          transform: "translateY(-2px)",
        },
        transition: "all 0.3s ease",
      }}
    >
      Save Changes
    </Button>
    <Button
      variant="outlined"
      onClick={onCancel}
      sx={{
        borderRadius: "12px",
        px: 4,
        py: 1.5,
        borderColor: "#667eea",
        color: "#667eea",
        textTransform: "none",
        fontSize: "16px",
        fontWeight: 600,
        "&:hover": {
          borderColor: "#764ba2",
          color: "#764ba2",
          bgcolor: "rgba(102, 126, 234, 0.04)",
        },
      }}
    >
      Cancel
    </Button>
  </Box>
);

export default PersonalInformation;