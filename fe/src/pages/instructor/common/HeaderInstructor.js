import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
  Box,
  MenuList,
  Button,
} from "@mui/material";
import {
  Notifications,
  Person,
  Logout,
  Dashboard,
  Settings,
  School,
  BarChart,
  Assignment,
  Group,
} from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import {
  listNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from "../../../apiServices/notificationService";

export function HeaderInstructor() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        if (!user) return;
        const data = await listNotificationsApi(20);
        const list = data.notifications || [];
        setNotifications(list);
        setUnreadCount(
          list.filter((n) => (n.Status || "").toLowerCase() !== "read").length
        );
      } catch (e) {
        console.error("Error loading notifications:", e);
      }
    };
    load();
  }, [user]);

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <AppBar
      sx={{
        background: "#ffffff",
        color: "#111827",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "none",
        ml: "250px",
        width: "calc(100% - 250px)",
        zIndex: 900,
      }}
      position="fixed"
    >
      <Toolbar sx={{ py: 1, display: "flex", justifyContent: "space-between" }}>
        {/* Left side - Greeting */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 45,
              height: 45,
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <School sx={{ fontSize: 28, color: "#1d4ed8" }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#111827",
                fontSize: "1.1rem",
                lineHeight: 1.2,
              }}
            >
              {getGreeting()},{" "}
              {user?.username || user?.Username || "Giảng viên"}! 👋
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              Quản lý khóa học của bạn
            </Typography>
          </Box>
        </Box>

        {/* Right side - Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Quick Actions */}
          <Button
            startIcon={<Dashboard sx={{ color: "#4b5563" }} />}
            sx={{
              color: "#374151",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.9rem",
              "&:hover": {
                background: "#f3f4f6",
                color: "#1d4ed8",
              },
            }}
            onClick={() => navigate("/instructor/courses")}
          >
            Khóa học
          </Button>

          <Button
            startIcon={<BarChart sx={{ color: "#4b5563" }} />}
            sx={{
              color: "#374151",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.9rem",
              "&:hover": {
                background: "#f3f4f6",
                color: "#1d4ed8",
              },
            }}
            onClick={() => navigate("/instructor/dashboard")}
          >
            Thống kê
          </Button>

          {/* Notifications */}
          <IconButton
            onClick={(e) => setNotifAnchor(e.currentTarget)}
            sx={{
              color: "#374151",
              "&:hover": { background: "#f3f4f6" },
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <Notifications sx={{ color: "#374151" }} />
            </Badge>
          </IconButton>

          {/* Notifications Menu */}
          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={() => setNotifAnchor(null)}
            PaperProps={{
              sx: {
                width: 360,
                maxHeight: 420,
                mt: 1,
                borderRadius: 2,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Thông báo
              </Typography>
              <Button
                size="small"
                onClick={async () => {
                  await markAllNotificationsReadApi();
                  setUnreadCount(0);
                  setNotifications((prev) =>
                    prev.map((n) => ({ ...n, Status: "read" }))
                  );
                }}
              >
                Đánh dấu đã đọc
              </Button>
            </Box>
            <MenuList dense>
              {notifications.length === 0 ? (
                <MenuItem disabled>Chưa có thông báo</MenuItem>
              ) : (
                notifications.map((n) => (
                  <MenuItem
                    key={n.NotificationID}
                    onClick={async () => {
                      await markNotificationReadApi(n.NotificationID);
                      setNotifications((prev) =>
                        prev.map((x) =>
                          x.NotificationID === n.NotificationID
                            ? { ...x, Status: "read" }
                            : x
                        )
                      );
                      setUnreadCount((c) =>
                        Math.max(
                          0,
                          c -
                            ((n.Status || "").toLowerCase() !== "read" ? 1 : 0)
                        )
                      );
                      setNotifAnchor(null);
                    }}
                    sx={{
                      whiteSpace: "normal",
                      alignItems: "start",
                      gap: 1,
                      py: 1.5,
                      "&:hover": {
                        background: "#f0f9ff",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor:
                          (n.Status || "").toLowerCase() === "read"
                            ? "transparent"
                            : "primary.main",
                        mt: 1,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">{n.Content}</Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", mt: 0.5, display: "block" }}
                      ></Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </MenuList>
          </Menu>

          {/* Avatar Menu */}
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar
              src={user?.ProfilePicture || user?.profilePicture || undefined}
              alt={user?.username || user?.Username || "Avatar"}
              sx={{
                width: 48,
                height: 48,
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                border: "2px solid #e5e7eb",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                fontWeight: 700,
                fontSize: "1.2rem",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)",
                  transform: "scale(1.05)",
                  boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)",
                },
              }}
            >
              {user?.username?.charAt(0).toUpperCase() ||
                user?.Username?.charAt(0).toUpperCase() ||
                "G"}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                minWidth: 220,
                borderRadius: 2,
                mt: 1.5,
                background: "#ffffff",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {/* User Info */}
            <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #e5e7eb" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {user?.username || user?.Username || "Giảng viên"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                {user?.email || user?.Email || "instructor@atps.edu"}
              </Typography>
            </Box>

            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/profile");
              }}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                color: "#374151",
                "&:hover": {
                  background: "#f0f9ff",
                  color: "#1e40af",
                },
              }}
            >
              <Person sx={{ mr: 1, color: "#475569" }} />
              Hồ sơ cá nhân
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/instructor/courses");
              }}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                color: "#374151",
                "&:hover": {
                  background: "#f0f9ff",
                  color: "#1e40af",
                },
              }}
            >
              <Dashboard sx={{ mr: 1, color: "#475569" }} />
              Quản lý khóa học
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/instructor/assignments");
              }}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                color: "#374151",
                "&:hover": {
                  background: "#f0f9ff",
                  color: "#1e40af",
                },
              }}
            >
              <Assignment sx={{ mr: 1, color: "#6b7280" }} />
              Bài tập
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/instructor/settings");
              }}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                color: "#374151",
                "&:hover": {
                  background: "#f0f9ff",
                  color: "#1e40af",
                },
              }}
            >
              <Settings sx={{ mr: 1, color: "#6b7280" }} />
              Cài đặt
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem
              onClick={() => {
                handleMenuClose();
                handleLogout();
              }}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                color: "#dc2626",
                "&:hover": {
                  background: "#fef2f2",
                  color: "#b91c1c",
                },
              }}
            >
              <Logout sx={{ mr: 1, color: "#dc2626" }} />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
