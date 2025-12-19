import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  Button,
} from "@mui/material";
import {
  AttachMoney,
  TrendingUp,
  Class as ClassIcon,
  People,
  PersonAdd,
  CheckCircle,
  EmojiEvents,
  Assessment,
  School,
  Person,
  Schedule,
  Group,
  DateRange,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import dashboardService from "../../../../apiServices/dashboardService";
import "../style.css";

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0)
  );
const formatNumber = (value = 0) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0));
const formatPercent = (value = 0) => `${Number(value || 0).toFixed(1)}%`;

const buildPieColors = ["#6366f1", "#10b981", "#f97316", "#f43f5e"];

const DateField = ({ label, value, onChange, min }) => (
  <TextField
    type="date"
    size="small"
    label={label}
    value={value ? value.format("YYYY-MM-DD") : ""}
    InputLabelProps={{ shrink: true }}
    inputProps={{
      min: min ? min.format("YYYY-MM-DD") : undefined,
    }}
    onChange={(event) => {
      const nextValue = dayjs(event.target.value);
      if (nextValue.isValid()) {
        onChange(nextValue);
      }
    }}
  />
);

const getPresetRange = (period) => {
  const today = dayjs();
  switch (period) {
    case "week":
      return [today.subtract(6, "day"), today];
    case "month":
      return [today.startOf("month"), today];
    case "quarter": {
      const startMonth = Math.floor(today.month() / 3) * 3;
      const start = today.month(startMonth).startOf("month");
      return [start, today];
    }
    case "year":
      return [today.startOf("year"), today];
    default:
      return null;
  }
};

const createReportsPage = (defaultView = "all") => {
  const ReportsPage = () => {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [rangeStats, setRangeStats] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState("month");
    const [startDate, setStartDate] = useState(dayjs().startOf("month"));
    const [endDate, setEndDate] = useState(dayjs());

    const viewMode = useMemo(() => {
      if (defaultView && defaultView !== "all") return defaultView;
      if (location.pathname.includes("/statistics/revenue")) return "revenue";
      if (location.pathname.includes("/statistics/learners")) return "learners";
      if (location.pathname.includes("/statistics/classes")) return "classes";
      if (location.pathname.includes("/statistics/staff")) return "staff";
      return "all";
    }, [location.pathname]);

    useEffect(() => {
      if (selectedPeriod === "custom") return;
      const preset = getPresetRange(selectedPeriod);
      if (preset) {
        const [from, to] = preset;
        setStartDate(from);
        setEndDate(to);
      }
    }, [selectedPeriod]);

    useEffect(() => {
      const fetchStats = async () => {
        try {
          setLoading(true);
          setError(null);
          const from = startDate.format("YYYY-MM-DD");
          const to = endDate.format("YYYY-MM-DD");
          const [agg, range] = await Promise.all([
            dashboardService.getDashboardStats(),
            dashboardService.getStatsByDateRange(from, to),
          ]);
          setStats(agg.data || agg);
          setRangeStats(range.data || range);
        } catch (err) {
          setError(err?.message || "Không thể tải thống kê");
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    }, [startDate, endDate, selectedPeriod]);

    const revenue = stats?.revenue || {};
    const learners = stats?.learners || {};
    const enrollments = stats?.enrollments || {};
    const classes = stats?.classes || {};
    const courses = stats?.courses || {};
    const instructors = stats?.instructors || {};
    const staff = stats?.staff || {};
    const admins = stats?.admins || {};

    const showRevenue = viewMode === "all" || viewMode === "revenue";
    const showLearners = viewMode === "all" || viewMode === "learners";
    const showClasses = viewMode === "all" || viewMode === "classes";
    const showStaff = viewMode === "all" || viewMode === "staff";

    const paymentsRange = rangeStats?.payments || {};
    const invoicesSuccess = paymentsRange.success ?? revenue.success ?? 0;
    const invoicesByStatus =
      paymentsRange.statusBreakdown ?? revenue.statusBreakdown ?? [];

    const periodRevenueValue = rangeStats?.revenue ?? revenue.monthly ?? 0;
    const periodLabelMap = {
      week: "Tuần",
      month: "Tháng",
      quarter: "Quý",
      year: "Năm",
      custom: "Kỳ chọn",
    };
    const periodLabel = periodLabelMap[selectedPeriod] || "Tháng";

    const revenueChart = [
      { name: "Tổng", value: revenue.total || 0 },
      { name: periodLabel, value: periodRevenueValue || 0 },
      { name: "Khoảng chọn", value: rangeStats?.revenue || 0 },
    ];

    const learnerPie = [
      { name: "Mới", value: learners.newThisMonth || 0 },
      {
        name: "Hiện hữu",
        value: Math.max(
          (learners.total || 0) - (learners.newThisMonth || 0),
          0
        ),
      },
    ];

    if (loading) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress sx={{ color: "#667eea", mr: 2 }} />
          <Typography color="text.secondary">Đang tải thống kê...</Typography>
        </Box>
      );
    }

    const headerTitle = {
      all: "Báo cáo & Thống kê",
      revenue: "Báo cáo doanh thu",
      learners: "Báo cáo học viên",
      classes: "Báo cáo lớp học",
      staff: "Báo cáo nhân sự",
    }[viewMode];

    return (
      <Box sx={{ p: 2, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <div>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {headerTitle}
            </Typography>
            <Typography color="text.secondary">
              Chỉ hiển thị dữ liệu phù hợp với màn hiện tại
            </Typography>
          </div>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Kỳ báo cáo</InputLabel>
              <Select
                value={selectedPeriod}
                label="Kỳ báo cáo"
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <MenuItem value="week">Tuần này</MenuItem>
                <MenuItem value="month">Tháng này</MenuItem>
                <MenuItem value="quarter">Quý này</MenuItem>
                <MenuItem value="year">Năm nay</MenuItem>
                <MenuItem value="custom">Tùy chọn</MenuItem>
              </Select>
            </FormControl>
            {selectedPeriod === "custom" && (
              <>
                <DateField
                  label="Từ ngày"
                  value={startDate}
                  onChange={(val) => setStartDate(val)}
                />
                <DateField
                  label="Đến ngày"
                  value={endDate}
                  min={startDate}
                  onChange={(val) => setEndDate(val)}
                />
              </>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {showRevenue && (
          <SectionBlock
            title="Doanh thu"
            subtitle="Số liệu từ bảng payment, promotion, refund"
          >
            <Grid container spacing={2}>
              <StatCard
                icon={<AttachMoney />}
                label="Tổng doanh thu"
                value={formatCurrency(revenue.total)}
                chip={`+${revenue.change || 0}% so với kỳ trước`}
              />
              <StatCard
                icon={<TrendingUp />}
                label={`Doanh thu ${periodLabel.toLowerCase()}`}
                value={formatCurrency(periodRevenueValue)}
              />
              <StatCard
                icon={<DateRange />}
                label="Theo khoảng chọn"
                value={formatCurrency(rangeStats?.revenue)}
              />
              <StatCard
                icon={<CheckCircle />}
                label="Hóa đơn thành công"
                value={formatNumber(invoicesSuccess)}
              />
            </Grid>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={7}>
                <Card sx={{ height: 320 }}>
                  <CardContent>
                    <Typography fontWeight={600} mb={2}>
                      So sánh doanh thu
                    </Typography>
                    <ResponsiveContainer width="100%" height={240}>
                      <RechartsBarChart data={revenueChart}>
                        <XAxis dataKey="name" />
                        <YAxis
                          tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`}
                        />
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                        <Bar
                          dataKey="value"
                          fill="#6366f1"
                          radius={[6, 6, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={5}>
                <Card sx={{ height: 320 }}>
                  <CardContent>
                    <Typography fontWeight={600} mb={2}>
                      Hóa đơn theo trạng thái
                    </Typography>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          dataKey="value"
                          data={invoicesByStatus}
                          outerRadius={90}
                        >
                          {invoicesByStatus.map((entry, idx) => (
                            <Cell
                              key={entry.name}
                              fill={buildPieColors[idx % buildPieColors.length]}
                            />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </SectionBlock>
        )}

        {showLearners && (
          <SectionBlock title="Học viên">
            <Grid container spacing={2}>
              <StatCard
                icon={<People />}
                label="Tổng học viên"
                value={formatNumber(learners.total)}
              />
              <StatCard
                icon={<PersonAdd />}
                label="Học viên mới"
                value={formatNumber(learners.newThisMonth)}
              />

              <StatCard
                icon={<CheckCircle />}
                label="Đăng ký tháng này"
                value={formatNumber(enrollments.thisMonth)}
              />
              <StatCard
                icon={<Schedule />}
                label="Đăng ký tháng trước"
                value={formatNumber(enrollments.lastMonth)}
              />
            </Grid>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: 320 }}>
                  <CardContent>
                    <Typography fontWeight={600} mb={2}>
                      Cơ cấu học viên
                    </Typography>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          dataKey="value"
                          data={learnerPie}
                          outerRadius={100}
                        >
                          {learnerPie.map((entry, idx) => (
                            <Cell
                              key={entry.name}
                              fill={buildPieColors[idx % buildPieColors.length]}
                            />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: 320 }}>
                  <CardContent>
                    <Typography fontWeight={600} mb={2}>
                      Xu hướng học viên mới
                    </Typography>
                    <ResponsiveContainer width="100%" height={240}>
                      <RechartsBarChart
                        data={[
                          {
                            name: "Tháng trước",
                            value: learners.newLastMonth || 0,
                          },
                          {
                            name: "Tháng này",
                            value: learners.newThisMonth || 0,
                          },
                        ]}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="value"
                          fill="#10b981"
                          radius={[6, 6, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography fontWeight={600} mb={1.5}>
                      Tổng đăng ký theo khoảng chọn
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h3"
                          fontWeight={700}
                          color="primary"
                        >
                          {formatNumber(rangeStats?.enrollments)}
                        </Typography>
                        <Typography color="text.secondary">
                          Tính từ {startDate.format("DD/MM")} đến{" "}
                          {endDate.format("DD/MM")}
                        </Typography>
                      </Box>
                      <Button variant="outlined">Xuất danh sách đăng ký</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </SectionBlock>
        )}

        {showClasses && (
          <SectionBlock title="Lớp học & Khóa học">
            <Grid container spacing={2}>
              <StatCard
                icon={<ClassIcon />}
                label="Tổng lớp"
                value={formatNumber(classes.total)}
                chip={`+${classes.change || 0}% so với tháng trước`}
              />
              <StatCard
                icon={<School />}
                label="Khóa học"
                value={formatNumber(courses.total)}
              />
              <StatCard
                icon={<Assessment />}
                label="Tỷ lệ hoàn thành"
                value={formatPercent(stats?.completionRate)}
              />
              <StatCard
                icon={<DateRange />}
                label="Lớp mới khoảng chọn"
                value={formatNumber(rangeStats?.classes)}
              />
            </Grid>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={8}>
                <Card sx={{ height: 320 }}>
                  <CardContent>
                    <Typography fontWeight={600} mb={2}>
                      Lớp học mới theo tháng (
                      {classes.year || new Date().getFullYear()})
                    </Typography>
                    <ResponsiveContainer width="100%" height={240}>
                      <RechartsBarChart data={classes.newByMonth || []}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="value"
                          fill="#667eea"
                          radius={[6, 6, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: 320 }}>
                  <CardContent>
                    <Typography fontWeight={600} mb={2}>
                      Khóa học theo trạng thái
                    </Typography>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          dataKey="value"
                          data={Object.entries(courses.byStatus || {}).map(
                            ([name, value]) => ({ name, value })
                          )}
                          outerRadius={90}
                        >
                          {Object.keys(courses.byStatus || {}).map(
                            (entry, idx) => (
                              <Cell
                                key={entry}
                                fill={
                                  buildPieColors[idx % buildPieColors.length]
                                }
                              />
                            )
                          )}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </SectionBlock>
        )}

        {showStaff && (
          <SectionBlock title="Nhân sự">
            <Grid container spacing={2}>
              <StatCard
                icon={<Person />}
                label="Giảng viên"
                value={formatNumber(instructors.total)}
              />
              <StatCard
                icon={<Group />}
                label="Nhân viên"
                value={formatNumber(staff.total)}
              />
              <StatCard
                icon={<CheckCircle />}
                label="Quản trị"
                value={formatNumber(admins.total)}
              />
              <StatCard
                icon={<Schedule />}
                label="Tỷ lệ điểm danh (30 ngày)"
                value={formatPercent(instructors.attendanceRate)}
              />
            </Grid>
            {instructors.topEarners && instructors.topEarners.length > 0 && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography fontWeight={600} mb={2}>
                        Top 5 giảng viên có lương thực tế cao nhất
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart
                          data={instructors.topEarners.map((instructor) => ({
                            name: instructor.name,
                            income: instructor.income,
                            classes: instructor.activeClasses,
                          }))}
                          layout="vertical"
                        >
                          <XAxis
                            type="number"
                            tickFormatter={(v) => formatCurrency(v)}
                          />
                          <YAxis type="category" dataKey="name" width={150} />
                          <Tooltip
                            formatter={(value, name) => {
                              if (name === "income")
                                return formatCurrency(value);
                              return value;
                            }}
                            labelFormatter={(label) => `Giảng viên: ${label}`}
                          />
                          <Legend />
                          <Bar
                            dataKey="income"
                            fill="#f97316"
                            name="Lương thực tế"
                            radius={[0, 6, 6, 0]}
                          />
                          <Bar
                            dataKey="classes"
                            fill="#6366f1"
                            name="Lớp đang dạy"
                            radius={[0, 6, 6, 0]}
                          />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </SectionBlock>
        )}
      </Box>
    );
  };

  return ReportsPage;
};

const SectionBlock = ({ title, subtitle, actions, children }) => (
  <Box sx={{ mb: 4 }}>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography color="text.secondary">{subtitle}</Typography>
      </Box>
      {actions}
    </Box>
    {children}
  </Box>
);

const StatCard = ({ icon, label, value, chip }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: "#eef2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4338ca",
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {label}
            </Typography>
          </Box>
        </Box>
        {chip && (
          <Chip
            label={chip}
            size="small"
            sx={{ mt: 1.5, backgroundColor: "#dcfce7", color: "#15803d" }}
          />
        )}
      </CardContent>
    </Card>
  </Grid>
);

export default createReportsPage;
