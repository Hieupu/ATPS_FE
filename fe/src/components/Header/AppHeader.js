import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  Divider,
  Badge,
  MenuList,
} from "@mui/material";
import {
  School,
  Menu as MenuIcon,
  Person,
  Logout,
  Book,
  Dashboard,
  Group,
  CalendarToday,
  CheckCircle,
  Assignment,
  Folder,
  Notifications,
  AssignmentTurnedIn,
  Payment,
  Quiz
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Import AuthContext
import {
  listNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from "../../apiServices/notificationService";
import apiClient from "../../apiServices/apiClient";

const AppHeader = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sử dụng AuthContext thay vì localStorage trực tiếp
  const { user, isLearner, isInstructor, isParent, logout } = useAuth();

  // Load notifications on mount and when user changes
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
      } catch (e) {}
    };
    load();
  }, [user]);

  const navItems = [
    {
      label: "Trang chủ",
      path: "/",
    },
    {
      label: "Khoá học",
      path: "/courses",
    },
    {
      label: "Giảng viên",
      path: "/instructors",
    },
    {
      label: "Lịch khai giảng",
      path: "/openingCeremony",
    },
    {
      label: "Liên hệ",
      path: "/contact",
    },
  ];

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleLogout = () => {
    logout(); // Sử dụng logout từ AuthContext
    navigate("/auth/login");
  };

  // Menu items dựa trên role
  const getRoleSpecificMenuItems = () => {
    const items = [];

    if (isLearner) {
      items.push(
        <MenuItem
          key="my-courses"
          onClick={() => navigate("/my-courses")}
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
          <Book sx={{ mr: 1, color: "#6b7280" }} />
          Khóa học của tôi
        </MenuItem>
      );
      items.push(
        <MenuItem
          key="my-schedule"
          onClick={() => navigate("/schedule")}
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
          <CalendarToday sx={{ mr: 1, color: "#6b7280" }} />
          Lịch học
        </MenuItem>
      );
      items.push(
        <MenuItem
          key="my-attendance"
          onClick={() => navigate("/attendance")}
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
          <CheckCircle sx={{ mr: 1, color: "#6b7280" }} />
          Điểm danh
        </MenuItem>
      );
         items.push(
        <MenuItem
          key="my-exam"
          onClick={() => navigate("/exam")}
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
          <AssignmentTurnedIn sx={{ mr: 1, color: "#6b7280" }} />
         Bài kiểm tra
        </MenuItem>
      );
        items.push(
        <MenuItem
          key="my-progress"
          onClick={() => navigate("/assignments")}
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
          <Quiz sx={{ mr: 1, color: "#6b7280" }} />
          Bài tập
        </MenuItem>
      );
      items.push(
        <MenuItem
          key="my-progress"
          onClick={() => navigate("/progress")}
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
          Tiến độ
        </MenuItem>
      );
      items.push(
        <MenuItem
          key="paymenthistory"
          onClick={() => navigate("/paymenthistory")}
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
          <Payment sx={{ mr: 1, color: "#6b7280" }} />
         Lịch sử thanh toán
        </MenuItem>
      );
    }

    if (isInstructor) {
      items.push(
        <MenuItem
          key="course-manage"
          onClick={() => navigate("/instructor/courses")}
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
          <Dashboard sx={{ mr: 1, color: "#6b7280" }} />
          Quản lý khoá học
        </MenuItem>
      );
    }

    if (isParent) {
      items.push(
        <MenuItem
          key="tracking-student"
          onClick={() => navigate("/parent/tracking")}
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
          <Group sx={{ mr: 1, color: "#6b7280" }} />
          Báo cáo học tập
        </MenuItem>
      );
    }

    return items;
  };

  // Menu items cho mobile dựa trên role
  const getMobileRoleSpecificItems = () => {
    const items = [];

    if (isLearner) {
      items.push(
        <ListItem
          button
          key="my-courses-mobile"
          onClick={() => navigate("/my-courses")}
        >
          <Book sx={{ mr: 2 }} />
          <ListItemText primary="Khóa học của tôi" />
        </ListItem>
      );
      items.push(
        <ListItem
          button
          key="my-schedule-mobile"
          onClick={() => navigate("/schedule")}
        >
          <CalendarToday sx={{ mr: 2 }} />
          <ListItemText primary="Lịch học" />
        </ListItem>
      );
      items.push(
        <ListItem
          button
          key="my-attendance-mobile"
          onClick={() => navigate("/attendance")}
        >
          <CheckCircle sx={{ mr: 2 }} />
          <ListItemText primary="Điểm danh" />
        </ListItem>
      );

       items.push(
        <ListItem
          button
          key="my-exam-mobile"
          onClick={() => navigate("/exam")}
        >
          <CheckCircle sx={{ mr: 2 }} />
          <ListItemText primary="Exam" />
        </ListItem>
      );
        items.push(
        <ListItem
          button
          key="my-assignment-mobile"
          onClick={() => navigate("/assignments")}
        >
          <CheckCircle sx={{ mr: 2 }} />
          <ListItemText primary="Assignment" />
        </ListItem>
      );
      items.push(
        <ListItem
          button
          key="my-progress-mobile"
          onClick={() => navigate("/progress")}
        >
          <Assignment sx={{ mr: 2 }} />
          <ListItemText primary="Tiến độ" />
        </ListItem>
      );
      items.push(
        <ListItem
          button
          key="paymenthistory-mobile"
          onClick={() => navigate("/paymenthistory")}
        >
          <Assignment sx={{ mr: 2 }} />
          <ListItemText primary="Payment" />
        </ListItem>
      );
    }

    if (isInstructor) {
      items.push(
        <ListItem
          button
          key="course-manage-mobile"
          onClick={() => navigate("/instructor/courses")}
        >
          <Dashboard sx={{ mr: 2 }} />
          <ListItemText primary="Course Management" />
        </ListItem>
      );
    }

    if (isParent) {
      items.push(
        <ListItem
          button
          key="tracking-student-mobile"
          onClick={() => navigate("/parent/tracking")}
        >
          <Group sx={{ mr: 2 }} />
          <ListItemText primary="Tracking Student" />
        </ListItem>
      );
    }

    return items;
  };

  return (
    <>
      {/* Header chính */}
      <AppBar
        position="sticky"
        elevation={2}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          {/* Logo + tên */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              cursor: "pointer",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
            onClick={() => navigate("/")}
          >
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
                mr: 1.5,
              }}
            >
              <School sx={{ fontSize: 28, color: "white" }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: 1,
                  lineHeight: 1,
                }}
              >
                ATPS
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  letterSpacing: 0.5,
                }}
              >
                Education
              </Typography>
            </Box>
          </Box>

          {/* Menu Desktop */}
          {!isMobile ? (
            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    position: "relative",
                    fontSize: "0.95rem",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: -4,
                      left: 0,
                      width: 0,
                      height: 2,
                      background: "rgba(255, 255, 255, 0.8)",
                      transition: "width 0.3s ease",
                    },
                    "&:hover::after": {
                      width: "100%",
                    },
                  }}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </Button>
              ))}

              {/* ✅ Nếu chưa login */}
              {!user ? (
                <>
                  <Button
                    variant="outlined"
                    sx={{
                      color: "white",
                      borderColor: "rgba(255, 255, 255, 0.5)",
                      fontWeight: 600,
                      ml: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.1)",
                        borderColor: "white",
                      },
                    }}
                    onClick={() => navigate("/auth/login")}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      background: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      fontWeight: 600,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "white",
                        color: "#667eea",
                      },
                    }}
                    onClick={() => navigate("/auth/register")}
                  >
                    Register
                  </Button>
                </>
              ) : (
                <>
                  {/* Notifications bell */}
                  <IconButton
                    color="inherit"
                    onClick={(e) => setNotifAnchor(e.currentTarget)}
                    sx={{ mr: 1 }}
                  >
                    <Badge badgeContent={unreadCount} color="error">
                      <Notifications />
                    </Badge>
                  </IconButton>
                  <Menu
                    anchorEl={notifAnchor}
                    open={Boolean(notifAnchor)}
                    onClose={() => setNotifAnchor(null)}
                    PaperProps={{ sx: { width: 360, maxHeight: 420 } }}
                  >
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
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
                    <Divider />
                    <MenuList dense>
                      {notifications.length === 0 ? (
                        <MenuItem disabled>Chưa có thông báo</MenuItem>
                      ) : (
                        notifications.map((n) => {
                          // Extract payment URL from notification content
                          const extractPaymentUrl = (content) => {
                            if (!content) return null;
                            // Tìm "Link thanh toán: <url>" hoặc URL pattern
                            const urlMatch =
                              content.match(/Link thanh toán:\s*(\S+)/i) ||
                              content.match(/https?:\/\/[^\s]+/);
                            return urlMatch ? urlMatch[1] || urlMatch[0] : null;
                          };

                          // Extract OrderCode from notification content
                          const extractOrderCode = (content) => {
                            if (!content) return null;
                            const match =
                              content.match(/Mã đơn hàng:\s*(\d+)/i);
                            return match ? match[1] : null;
                          };

                          const paymentUrl =
                            n.Type === "payment"
                              ? extractPaymentUrl(n.Content)
                              : null;

                          const orderCode =
                            n.Type === "payment"
                              ? extractOrderCode(n.Content)
                              : null;

                          return (
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
                                      ((n.Status || "").toLowerCase() !== "read"
                                        ? 1
                                        : 0)
                                  )
                                );
                                setNotifAnchor(null); // Đóng menu

                                // Xử lý notification payment: redirect đến trang thanh toán
                                if (n.Type === "payment") {
                                  // Nếu có payment URL trực tiếp, dùng ngay
                                  if (paymentUrl) {
                                    window.location.href = paymentUrl;
                                  }
                                  // Nếu có OrderCode, gọi API để lấy payment link từ PayOS
                                  else if (orderCode) {
                                    try {
                                      // Gọi API để lấy payment link từ OrderCode
                                      const response = await apiClient.get(
                                        `/payment/get-link/${orderCode}`
                                      );

                                      if (response.data?.paymentUrl) {
                                        window.location.href =
                                          response.data.paymentUrl;
                                      } else {
                                        throw new Error(
                                          response.data?.message ||
                                            "Không tìm thấy payment URL"
                                        );
                                      }
                                    } catch (error) {
                                      console.error(
                                        "Error getting payment link:",
                                        error
                                      );
                                      alert(
                                        error.response?.data?.message ||
                                          `Không thể lấy link thanh toán. Mã đơn hàng: ${orderCode}`
                                      );
                                    }
                                  } else {
                                    alert(
                                      "Không tìm thấy thông tin thanh toán trong thông báo."
                                    );
                                  }
                                }
                              }}
                              sx={{
                                whiteSpace: "normal",
                                alignItems: "start",
                                gap: 1,
                                cursor:
                                  n.Type === "payment" ? "pointer" : "default",
                                "&:hover":
                                  n.Type === "payment"
                                    ? {
                                        background: "#f0f9ff",
                                      }
                                    : {},
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
                                <Typography variant="body2">
                                  {n.Content}
                                </Typography>
                                {n.Type === "payment" && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "primary.main",
                                      fontWeight: 600,
                                      mt: 0.5,
                                      display: "block",
                                    }}
                                  >
                                    → Nhấn để thanh toán
                                  </Typography>
                                )}
                              </Box>
                            </MenuItem>
                          );
                        })
                      )}
                    </MenuList>
                  </Menu>
                  <Avatar
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                      cursor: "pointer",
                      background:
                        "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                      border: "2px solid #ffffff",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                      fontWeight: 700,
                      fontSize: "1.2rem",
                      width: 48,
                      height: 48,
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
                      user?.Username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        minWidth: 200,
                        borderRadius: 2,
                        mt: 1.5,
                        background: "#ffffff",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    {/* Menu items chung */}
                    <MenuItem
                      onClick={() => navigate("/profile")}
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
                      <Person sx={{ mr: 1, color: "#6b7280" }} />
                      Profile
                    </MenuItem>


                    {/* Menu items theo role */}
                    {getRoleSpecificMenuItems()}

                    <Divider sx={{ my: 0.5 }} />
                    <MenuItem
                      onClick={handleLogout}
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
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          ) : (
            <IconButton onClick={toggleMobileMenu} sx={{ color: "white" }}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Menu Mobile */}
      <Drawer anchor="right" open={mobileMenuOpen} onClose={toggleMobileMenu}>
        <Box sx={{ width: 250, pt: 2 }}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.label} onClick={() => navigate(item.path)}>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}

            {/* Menu items theo role cho mobile */}
            {user && getMobileRoleSpecificItems()}

            {!user ? (
              <>
                <ListItem>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="primary"
                    sx={{ mb: 1 }}
                    onClick={() => navigate("/auth/login")}
                  >
                    Login
                  </Button>
                </ListItem>
                <ListItem>
                  <Button
                    variant="contained"
                    fullWidth
                    color="primary"
                    onClick={() => navigate("/auth/register")}
                  >
                    Register
                  </Button>
                </ListItem>
              </>
            ) : (
              <ListItem>
                <Button
                  variant="outlined"
                  fullWidth
                  color="primary"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default AppHeader;
