// pages/ClassesPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box } from "@mui/material";
import ClassesLayout from "../components/class/ClassesLayout";

// Tạm giống mẫu course nhưng chỉnh lại cho đúng route
const BASE_URL = "https://atps-be.onrender.com/api/instructor";
const apiClient = axios.create({
  baseURL: BASE_URL,
});

// luôn gắn token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/classes");
      const data = res.data || [];

      const mapped = data.map((c) => {
        const isOngoing = c.openDate
          ? new Date(c.openDate) <= new Date()
          : new Date(c.openDatePlan) <= new Date();

        const isCompleted =
          c.completedSessions >= c.totalSessions && c.totalSessions > 0;

        const uiStatus = isCompleted
          ? "completed"
          : isOngoing
          ? "ongoing"
          : "upcoming";

        const progress =
          c.totalSessions > 0
            ? Math.round((c.completedSessions / c.totalSessions) * 100)
            : 0;

        let nextSessionDisplay = "-";
        if (c.nextSessionDate) {
          const date = new Date(c.nextSessionDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          if (date.toDateString() === today.toDateString()) {
            nextSessionDisplay = "Hôm nay";
          } else if (date.toDateString() === tomorrow.toDateString()) {
            nextSessionDisplay = "Ngày mai";
          } else {
            nextSessionDisplay = date.toLocaleDateString("vi-VN", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
            });
          }
        }

        return {
          id: c.classId,
          className: c.className,
          courseName: c.courseTitle || c.className,
          courseImage: c.courseImage || "/images/default-class.jpg",
          courseLevel: c.courseLevel,

          students: c.currentStudents,
          totalStudents: c.maxStudents,

          fee: Number(c.fee),
          totalSessions: c.totalSessions,
          completedSessions: c.completedSessions,
          progress,

          status: uiStatus,
          startDatePlan: c.openDatePlan,
          startDate: c.openDate,

          hasSessionToday: c.hasSessionToday,
          nextSession: nextSessionDisplay,
          schedule: c.scheduleSummary || "Chưa có lịch",

          isTodayClass: c.hasSessionToday,
        };
      });

      setClasses(mapped);
    } catch (err) {
      console.error("Failed to load classes:", err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <ClassesLayout
        classes={classes}
        loading={loading}
        tabValue={tabValue}
        setTabValue={setTabValue}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </Box>
  );
}
