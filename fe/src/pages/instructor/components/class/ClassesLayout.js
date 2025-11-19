import React, { useState } from "react";
import {
  Box,
  Grid,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  Search,
  FilterList,
  MoreVert,
  People,
  Assignment,
  Assessment,
  EditCalendar,
  CloudUpload,
  NoteAlt,
  Poll,
  Visibility,
} from "@mui/icons-material";
import ClassCardItem from "./ClassCardItem";

export default function ClassesLayout({
  classes,
  loading,
  tabValue,
  setTabValue,
  searchQuery,
  setSearchQuery,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  const handleMenuOpen = (event, cls) => {
    setAnchorEl(event.currentTarget);
    setSelectedClass(cls);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClass(null);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "ongoing":
        return {
          label: "Ongoing",
          color: "#16a34a",
          bg: "#dcfce7",
        };
      case "upcoming":
        return {
          label: "Upcoming",
          color: "#d97706",
          bg: "#fef3c7",
        };
      case "completed":
        return {
          label: "Completed",
          color: "#2563eb",
          bg: "#dbeafe",
        };
      default:
        return {
          label: "Unknown",
          color: "#64748b",
          bg: "#f1f5f9",
        };
    }
  };

  const getFilteredClasses = () => {
    let filtered = classes || [];

    switch (tabValue) {
      case 1:
        filtered = filtered.filter((c) => c.status === "ongoing");
        break;
      case 2:
        filtered = filtered.filter((c) => c.status === "upcoming");
        break;
      case 3:
        filtered = filtered.filter((c) => c.status === "completed");
        break;
      default:
        break;
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.classCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const allCount = classes.length;
  const ongoingCount = classes.filter((c) => c.status === "ongoing").length;
  const upcomingCount = classes.filter((c) => c.status === "upcoming").length;
  const completedCount = classes.filter((c) => c.status === "completed").length;

  return (
    <div className="instructor-page">
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
              My Classes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage classes assigned to you by Admin
            </Typography>
          </Box>
        </Box>

        {/* Search & Filter */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search by class name or code..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            variant="outlined"
            startIcon={<FilterList />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              borderColor: "#e2e8f0",
              color: "#64748b",
              "&:hover": {
                borderColor: "#667eea",
                backgroundColor: "#f0f4ff",
              },
            }}
          >
            Filter
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "14px",
              minHeight: "48px",
            },
            "& .Mui-selected": { color: "#667eea" },
            "& .MuiTabs-indicator": { backgroundColor: "#667eea" },
          }}
        >
          <Tab label={`All (${allCount})`} />
          <Tab label={`Ongoing (${ongoingCount})`} />
          <Tab label={`Upcoming (${upcomingCount})`} />
          <Tab label={`Completed (${completedCount})`} />
        </Tabs>
      </Box>

      {/* Class Grid */}
      <Grid container spacing={3}>
        {getFilteredClasses().map((cls) => (
          <Grid item xs={12} sm={6} md={3} lg={3} key={cls.id}>
            <ClassCardItem
              cls={cls}
              loading={loading}
              getStatusConfig={getStatusConfig}
              onMenuOpen={handleMenuOpen}
            />
          </Grid>
        ))}
      </Grid>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Visibility sx={{ fontSize: 18, mr: 1.5 }} /> View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <People sx={{ fontSize: 18, mr: 1.5 }} /> Student List
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Assignment sx={{ fontSize: 18, mr: 1.5 }} /> Assignments
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Assessment sx={{ fontSize: 18, mr: 1.5 }} /> Exams
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditCalendar sx={{ fontSize: 18, mr: 1.5 }} /> Request Schedule
          Change
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <CloudUpload sx={{ fontSize: 18, mr: 1.5 }} /> Upload Materials
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <NoteAlt sx={{ fontSize: 18, mr: 1.5 }} /> Class Notes
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Poll sx={{ fontSize: 18, mr: 1.5 }} /> Create Survey
        </MenuItem>
      </Menu>
    </div>
  );
}
