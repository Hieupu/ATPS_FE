import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  GridView as GridViewIcon,
  Article as ArticleIcon,
  AttachMoney as AttachMoneyIcon,
  LocalOffer as LocalOfferIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarTodayIcon,
  EventBusy as EventBusyIcon,
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Class as ClassIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Book as BookIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import "../pages/style.css";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon />,
    path: "/admin/dashboard",
    type: "single",
  },
  {
    id: "general-info",
    label: "Thông tin chung",
    icon: <ArticleIcon />,
    type: "dropdown",
    children: [
      {
        id: "news",
        label: "Quản lý tin tức",
        icon: <ArticleIcon />,
        path: "/admin/news",
      },
    ],
  },
  {
    id: "statistics",
    label: "Thống kê",
    icon: <BarChartIcon />,
    type: "dropdown",
    children: [
      {
        id: "revenue",
        label: "Doanh thu",
        icon: <TrendingUpIcon />,
        path: "/admin/statistics/revenue",
      },
      {
        id: "learners",
        label: "Học viên",
        icon: <PeopleIcon />,
        path: "/admin/statistics/learners",
      },
      {
        id: "classes",
        label: "Lớp học",
        icon: <ClassIcon />,
        path: "/admin/statistics/classes",
      },
      {
        id: "staff",
        label: "Nhân viên",
        icon: <GroupIcon />,
        path: "/admin/statistics/staff",
      },
    ],
  },
  {
    id: "user-management",
    label: "Quản lý người dùng",
    icon: <PeopleIcon />,
    type: "dropdown",
    children: [
      {
        id: "learners",
        label: "Quản lý học sinh",
        icon: <PeopleIcon />,
        path: "/admin/users/learners",
      },
      {
        id: "instructors",
        label: "Quản lý giảng viên",
        icon: <PeopleIcon />,
        path: "/admin/users/instructors",
      },
      {
        id: "staff",
        label: "Quản lý nhân viên",
        icon: <PeopleIcon />,
        path: "/admin/users/staff",
      },
      {
        id: "admins",
        label: "Quản lý admin",
        icon: <PeopleIcon />,
        path: "/admin/users/admins",
      },
    ],
  },
  {
    id: "class-schedule",
    label: "Lớp học & Lịch học",
    icon: <SchoolIcon />,
    type: "dropdown",
    children: [
      {
        id: "classes",
        label: "Quản lý lớp học",
        icon: <ClassIcon />,
        path: "/admin/classes",
      },
      {
        id: "instructor-calendar",
        label: "Lịch giảng viên",
        icon: <CalendarTodayIcon />,
        path: "/admin/instructor-calendar",
      },
      {
        id: "instructor-leave",
        label: "Lịch nghỉ giảng viên",
        icon: <EventBusyIcon />,
        path: "/admin/instructor-leave",
      },
    ],
  },
  {
    id: "course-management",
    label: "Quản lý khóa học",
    icon: <BookIcon />,
    type: "single",
    path: "/admin/courses",
  },
  {
    id: "finance",
    label: "Quản lý tài chính",
    icon: <AttachMoneyIcon />,
    type: "dropdown",
    children: [
      {
        id: "payment-history",
        label: "Lịch sử thanh toán",
        icon: <ReceiptIcon />,
        path: "/admin/finance/payment-history",
      },
      {
        id: "promotions",
        label: "Quản lý promotion",
        icon: <LocalOfferIcon />,
        path: "/admin/finance/promotions",
      },
      {
        id: "payroll",
        label: "Báo cáo lương giảng viên",
        icon: <ReceiptIcon />,
        path: "/admin/finance/payroll",
      },
      {
        id: "refunds",
        label: "Xử lý hoàn tiền",
        icon: <AccountBalanceWalletIcon />,
        path: "/admin/finance/refunds",
      },
    ],
  },
  {
    id: "system",
    label: "Hệ thống",
    icon: <SettingsIcon />,
    type: "dropdown",
    children: [
      {
        id: "payment-gateways",
        label: "Quản lý cổng thanh toán",
        icon: <PaymentIcon />,
        path: "/admin/system/payment-gateways",
      },
      {
        id: "notification-templates",
        label: "Quản lý mẫu gửi mail",
        icon: <EmailIcon />,
        path: "/admin/system/notification-templates",
      },
      {
        id: "timeslots",
        label: "Quản lý ca học",
        icon: <ScheduleIcon />,
        path: "/admin/system/timeslots",
      },
    ],
  },
];

export function SidebarAdmin() {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  // Auto-expand menu if child is active
  useEffect(() => {
    const activeMenus = {};
    menuItems.forEach((item) => {
      if (item.type === "dropdown" && item.children) {
        const hasActiveChild = item.children.some(
          (child) => location.pathname === child.path
        );
        if (hasActiveChild) {
          activeMenus[item.id] = true;
        }
      }
    });
    setExpandedMenus(activeMenus);
  }, [location.pathname]);

  const toggleMenu = (menuId, e) => {
    e?.stopPropagation();
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleChildClick = () => {
    // Đóng dropdown khi click vào child item
    // Không cần làm gì vì NavLink sẽ tự động navigate
  };

  const isMenuActive = (item) => {
    if (item.type === "single") {
      return location.pathname === item.path;
    }
    if (item.type === "dropdown" && item.children) {
      return item.children.some((child) => location.pathname === child.path);
    }
    return false;
  };

  return (
    <div className="admin-sidebar">
      {/* LOGO */}
      <div className="sidebar-header">
        <div className="sidebar-header-icon">
          <GridViewIcon sx={{ fontSize: 24 }} />
        </div>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
          ATPS Admin
        </h3>
      </div>

      {/* NAV LIST */}
      <div className="sidebar-nav">
        {menuItems.map((item) => {
          if (item.type === "single") {
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            );
          }

          if (item.type === "dropdown") {
            const isExpanded = expandedMenus[item.id] || isMenuActive(item);
            const isActive = isMenuActive(item);

            return (
              <div key={item.id} className="sidebar-dropdown">
                <div
                  className={`sidebar-link ${isActive ? "active" : ""} ${
                    isExpanded ? "expanded" : ""
                  }`}
                  onClick={(e) => toggleMenu(item.id, e)}
                  style={{ cursor: "pointer" }}
                >
                  {item.icon}
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isExpanded ? (
                    <ExpandLessIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <ExpandMoreIcon sx={{ fontSize: 18 }} />
                  )}
                </div>
                {isExpanded && item.children && (
                  <div className="sidebar-dropdown-children">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.id}
                        to={child.path}
                        onClick={handleChildClick}
                        className={({ isActive }) =>
                          `sidebar-link-child ${isActive ? "active" : ""}`
                        }
                      >
                        {child.icon}
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
