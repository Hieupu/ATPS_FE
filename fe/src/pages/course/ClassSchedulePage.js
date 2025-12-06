// ClassSchedulePage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  Skeleton,
  Button,
  useTheme,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { getScheduleClassesApi } from "../../apiServices/courseService";
import AppHeader from "../../components/Header/AppHeader";
import HeroSection from "./components/HeroSection";
import EmptyState from "./components/EmptyState";
import CompactCourseCard from "./components/CompactCourseCard";
import FilterSection from "./components/FilterSection";

const ClassSchedulePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [filters, setFilters] = useState({});
  const theme = useTheme();
  const navigate = useNavigate();
  console.log("khoa hoc" , courses)

  useEffect(() => {
    fetchClasses();
  }, [filters]); // Refetch khi filters thay đổi

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      // Clean filters object - chỉ gửi những filter có giá trị
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => 
          value !== null && value !== undefined && value !== ''
        )
      );
      
      const result = await getScheduleClassesApi(cleanFilters);
      console.log("getScheduleClassesApi", result);
      
      const classes = result.data || [];

      // Xử lý data như trước...
      const coursesMap = {};
      classes.forEach((classItem) => {
        const courseId = classItem.CourseID;
        if (!coursesMap[courseId]) {
          coursesMap[courseId] = {
            CourseID: courseId,
            CourseTitle: classItem.CourseTitle,
            CourseImage: classItem.CourseImage,
            CourseLevel: classItem.CourseLevel,
            CourseDuration: classItem.CourseDuration,
            Numofsession: classItem.Numofsession,
            classes: [],
          };
        }
        coursesMap[courseId].classes.push(classItem);
      });

      const coursesArray = Object.values(coursesMap)
        .map((course) => ({
          ...course,
          classes: course.classes.sort((a, b) => {
            const dateA = new Date(a.Opendate || a.OpendatePlan || "9999-12-31");
            const dateB = new Date(b.Opendate || b.OpendatePlan || "9999-12-31");
            return dateA - dateB;
          }),
        }))
        .slice(0, 10);

      setCourses(coursesArray);
      if (coursesArray.length > 0) {
        setExpandedCourseId(coursesArray[0].CourseID);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Các hàm helper giữ nguyên...
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Sắp cập nhật";
    const date = new Date(dateString);
    const options = { day: "numeric", month: "long", year: "numeric" };
    return date.toLocaleDateString("vi-VN", options);
  }, []);

  const formatTime = useCallback((timeString) => {
    if (!timeString) return "";
    return timeString.slice(0, 5);
  }, []);

  const hasActiveFilters = Object.keys(filters).some(
  key => filters[key] !== null && 
         filters[key] !== undefined && 
         filters[key] !== ''
);

  const getScheduleInfo = useCallback((weeklySchedule) => {
    if (!weeklySchedule || weeklySchedule.length === 0) {
      return { days: "Chưa xác định", time: "" };
    }

    const daysMap = {
      Monday: "T2",
      Tuesday: "T3",
      Wednesday: "T4",
      Thursday: "T5",
      Friday: "T6",
      Saturday: "T7",
      Sunday: "CN",
    };

    const days = weeklySchedule
      .map((s) => daysMap[s.Day] || s.Day)
      .join("/");

    const firstSchedule = weeklySchedule[0];
    const time = `${formatTime(firstSchedule.StartTime)} - ${formatTime(
      firstSchedule.EndTime
    )}`;

    return { days, time };
  }, [formatTime]);

  const getClassStatus = useCallback((classItem) => {
    if (classItem.displayStatus === "FULL") {
      return { label: "ĐÃ ĐẦY", color: "error", variant: "filled" };
    }
    if (classItem.enrollmentPercentage >= 90) {
      return { label: "SẮP ĐẦY", color: "warning", variant: "filled" };
    }
    return { label: "CÒN CHỖ", color: "success", variant: "filled" };
  }, []);

  const getLevelInfo = useCallback((level) => {
    const config = {
      BEGINNER: { label: "CƠ BẢN", color: "success" },
      INTERMEDIATE: { label: "TRUNG CẤP", color: "warning" },
      ADVANCED: { label: "NÂNG CAO", color: "error" },
    };
    return config[level] || { label: level, color: "default" };
  }, []);

  const handleToggleExpand = useCallback((courseId) => {
    setExpandedCourseId(expandedCourseId === courseId ? null : courseId);
  }, [expandedCourseId]);

  const handleCourseClick = useCallback((courseId, e) => {
    e.stopPropagation();
    navigate(`/courses/${courseId}`);
  }, [navigate]);

  const handleInstructorClick = useCallback((instructorId, e) => {
    e.stopPropagation();
    navigate(`/instructors/${instructorId}`);
  }, [navigate]);

  const handleRegisterClick = useCallback((courseId, e) => {
    e.stopPropagation();
    navigate(`/courses/${courseId}`);
  }, [navigate]);

  return (
    <Box sx={{ 
      minHeight: "100vh",
      margin: 0,
      padding: 0,
      backgroundColor: theme.palette.grey[50]
    }}>
      <AppHeader />
      
      <HeroSection />
      
      <Container maxWidth="lg" sx={{ 
        pt: { xs: 2, md: 3 },
        pb: 4,
        px: { xs: 1.5, sm: 2 }
      }}>
        {/* Filter Section */}
        <FilterSection
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Kết quả tìm kiếm */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Lớp sắp khai giảng
            {courses.length > 0 && (
              <Typography component="span" sx={{ ml: 1, color: "text.secondary" }}>
               ({courses.reduce((total, course) => total + (course.classes?.length || 0), 0)} lớp)
              </Typography>
            )}
          </Typography>
          
          {hasActiveFilters && (
            <Button
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              size="small"
              variant="outlined"
            >
              Xóa bộ lọc
            </Button>
          )}
        </Box>

        {/* Compact Courses List */}
        {loading ? (
          <Box sx={{ mt: 2 }}>
            {Array.from(new Array(2)).map((_, index) => (
              <Card key={index} sx={{ 
                mb: 2, 
                p: 1.5, 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 1 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height={20} />
                    <Skeleton variant="text" width="40%" height={16} />
                  </Box>
                  <Skeleton variant="text" width={40} height={16} />
                </Box>
              </Card>
            ))}
          </Box>
        ) : (
          <Box>
            {courses.map((course) => (
              <CompactCourseCard 
                key={course.CourseID} 
                course={course}
                expandedCourseId={expandedCourseId}
                onToggleExpand={handleToggleExpand}
                onCourseClick={handleCourseClick}
                onInstructorClick={handleInstructorClick}
                onRegisterClick={handleRegisterClick}
                formatDate={formatDate}
                getScheduleInfo={getScheduleInfo}
                getClassStatus={getClassStatus}
                getLevelInfo={getLevelInfo}
              />
            ))}

            {courses.length === 0 && (
              <EmptyState 
                onRetry={fetchClasses}
                message={Object.keys(filters).length > 0 
                  ? "Không tìm thấy lớp học phù hợp với bộ lọc của bạn"
                  : "Hiện chưa có lớp học nào sắp khai giảng"
                }
              />
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ClassSchedulePage;