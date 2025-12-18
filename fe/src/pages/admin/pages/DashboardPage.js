import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Paper,
  LinearProgress,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  School,
  People,
  AttachMoney,
  CheckCircle,
  ArrowUpward,
  ArrowDownward,
  Add,
  Assignment,
  Assessment,
  Class,
  PersonAdd,
  Description,
  HighlightOff,
  Publish,
  MenuBook,
  Edit,
  Delete,
  Article,
  Reply,
  LocalOffer,
  Cancel,
} from "@mui/icons-material";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../../apiServices/dashboardService";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  // Quick Actions
  const quickActions = [
    {
      title: "Quản lý lớp học",
      icon: <Add />,
      color: "#667eea",
      bgColor: "#f0f4ff",
      link: "/admin/classes",
    },
    {
      title: "Quản lý khóa học",
      icon: <Description />,
      color: "#10b981",
      bgColor: "#f0fdf4",
      link: "/admin/courses",
    },
    {
      title: "Quản lý giảng viên",
      icon: <PersonAdd />,
      color: "#f59e0b",
      bgColor: "#fffbeb",
      link: "/admin/instructors",
    },
    {
      title: "Quản lý học viên",
      icon: <People />,
      color: "#ec4899",
      bgColor: "#fdf2f8",
      link: "/admin/learners",
    },
    {
      title: "Thống kê",
      icon: <Assessment />,
      color: "#06b6d4",
      bgColor: "#f0fdfa",
      link: "/admin/reports",
    },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, activitiesResponse] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivities(10),
      ]);

      setStats(statsResponse.data);
      setRecentActivities(activitiesResponse.data || []);
    } catch (error) {
      setError("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "N/A";
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return time.toLocaleDateString("vi-VN");
  };

  const activityIconMap = {
    school: <School sx={{ fontSize: 20 }} />,
    people: <People sx={{ fontSize: 20 }} />,
    attach_money: <AttachMoney sx={{ fontSize: 20 }} />,
    highlight_off: <HighlightOff sx={{ fontSize: 20 }} />,
    publish: <Publish sx={{ fontSize: 20 }} />,
    menu_book: <MenuBook sx={{ fontSize: 20 }} />,
    edit: <Edit sx={{ fontSize: 20 }} />,
    delete: <Delete sx={{ fontSize: 20 }} />,
    check_circle: <CheckCircle sx={{ fontSize: 20 }} />,
    article: <Article sx={{ fontSize: 20 }} />,
    reply: <Reply sx={{ fontSize: 20 }} />,
    local_offer: <LocalOffer sx={{ fontSize: 20 }} />,
    cancel: <Cancel sx={{ fontSize: 20 }} />,
  };

  const getIconForActivity = (iconType) =>
    activityIconMap[iconType] || <CheckCircle sx={{ fontSize: 20 }} />;

  // Tạo stats cards từ dữ liệu thực
  const statsCards = stats
    ? [
        {
          title: "Tổng số lớp học",
          value: stats.classes?.total || 0,
          change: `${stats.classes?.change >= 0 ? "+" : ""}${
            stats.classes?.change || 0
          }%`,
          trend: stats.classes?.change >= 0 ? "up" : "down",
          icon: <Class sx={{ fontSize: 32 }} />,
          color: "#667eea",
          bgColor: "#f0f4ff",
        },
        {
          title: "Tổng số học viên",
          value: stats.learners?.total || 0,
          change: `${stats.learners?.change >= 0 ? "+" : ""}${
            stats.learners?.change || 0
          }%`,
          trend: stats.learners?.change >= 0 ? "up" : "down",
          icon: <People sx={{ fontSize: 32 }} />,
          color: "#10b981",
          bgColor: "#f0fdf4",
        },
        {
          title: "Doanh thu tháng này",
          value: formatCurrency(stats.revenue?.monthly || 0),
          change: `${stats.revenue?.change >= 0 ? "+" : ""}${
            stats.revenue?.change || 0
          }%`,
          trend: stats.revenue?.change >= 0 ? "up" : "down",
          icon: <AttachMoney sx={{ fontSize: 32 }} />,
          color: "#805ad5",
          bgColor: "#faf5ff",
        },
        {
          title: "Tỷ lệ hoàn thành",
          value: `${stats.completionRate || 0}%`,
          change: "",
          trend: "up",
          icon: <CheckCircle sx={{ fontSize: 32 }} />,
          color: "#f59e0b",
          bgColor: "#fffbeb",
        },
        {
          title: "Tổng số khóa học",
          value: stats.courses?.total || 0,
          change: "",
          trend: "up",
          icon: <Description sx={{ fontSize: 32 }} />,
          color: "#06b6d4",
          bgColor: "#f0fdfa",
        },
        {
          title: "Tin tức",
          value: stats.news?.total || 0,
          change: "",
          trend: "up",
          icon: <Assignment sx={{ fontSize: 32 }} />,
          color: "#ec4899",
          bgColor: "#fdf2f8",
        },
        {
          title: "Yêu cầu hoàn tiền",
          value: stats.refunds?.total || 0,
          change: "",
          trend: "up",
          icon: <AttachMoney sx={{ fontSize: 32 }} />,
          color: "#ef4444",
          bgColor: "#fef2f2",
        },
        {
          title: "Promotion đang hoạt động",
          value: stats.promotions?.active || 0,
          change: "",
          trend: "up",
          icon: <CheckCircle sx={{ fontSize: 32 }} />,
          color: "#22c55e",
          bgColor: "#f0fdf4",
        },
      ]
    : [];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
        }}
      >
        <CircularProgress sx={{ color: "#667eea" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadDashboardData}>
          Thử lại
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Quick Actions */}
      <Card
        sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", mb: 3 }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Chuyển hướng nhanh
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    textAlign: "center",
                    "&:hover": {
                      borderColor: action.color,
                      transform: "translateY(-4px)",
                      boxShadow: `0 8px 16px ${action.color}20`,
                    },
                  }}
                  onClick={() => navigate(action.link)}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: action.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: action.color,
                      mx: "auto",
                      mb: 1.5,
                    }}
                  >
                    {React.cloneElement(action.icon, {
                      sx: {
                        fontSize: 24,
                      },
                    })}
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      fontSize: "13px",
                      color: "#1e293b",
                    }}
                  >
                    {action.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontSize: "11px", color: "#64748b" }}
                  >
                    {action.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} lg={3} key={index}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: stat.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  {stat.change && (
                    <Chip
                      label={stat.change}
                      size="small"
                      icon={
                        stat.trend === "up" ? (
                          <ArrowUpward sx={{ fontSize: 14 }} />
                        ) : (
                          <ArrowDownward sx={{ fontSize: 14 }} />
                        )
                      }
                      sx={{
                        backgroundColor:
                          stat.trend === "up" ? "#dcfce7" : "#fee2e2",
                        color: stat.trend === "up" ? "#16a34a" : "#dc2626",
                        fontWeight: 600,
                        height: 28,
                      }}
                    />
                  )}
                </Box>
                <Typography variant="body2" sx={{ mb: 0.5, color: "#64748b" }}>
                  {stat.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activities */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Hoạt động gần đây
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {recentActivities.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ color: "#64748b", textAlign: "center", py: 4 }}
              >
                Chưa có hoạt động nào
              </Typography>
            ) : (
              recentActivities.map((activity, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    "&:hover": {
                      backgroundColor: "#fff",
                      borderColor: activity.color || "#667eea",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      backgroundColor: `${activity.color || "#667eea"}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: activity.color || "#667eea",
                    }}
                  >
                    {getIconForActivity(activity.icon)}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      {activity.title}
                    </Typography>
                    {activity.description && (
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", display: "block", mb: 0.5 }}
                      >
                        {activity.description}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      {formatTimeAgo(activity.timestamp)}
                    </Typography>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
