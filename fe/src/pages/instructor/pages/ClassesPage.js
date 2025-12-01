import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box } from "@mui/material";
import ClassesLayout from "../components/class/ClassesLayout";

const BASE_URL = "http://localhost:9999/api/instructor";
const apiClient = axios.create({
  baseURL: BASE_URL,
});

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
        let uiStatus = "upcoming";

        if (["CLOSE", "CANCEL", "COMPLETED"].includes(c.classStatus)) {
          uiStatus = "completed";
        } else if (["ACTIVE", "ON_GOING"].includes(c.classStatus)) {
          uiStatus = "ongoing";
        } else {
          const isStarted = c.openDate
            ? new Date(c.openDate) <= new Date()
            : new Date(c.openDatePlan) <= new Date();
          uiStatus = isStarted ? "ongoing" : "upcoming";
        }

        let nextSessionDisplay = "-";
        if (c.nextSessionDate) {
          const date = new Date(c.nextSessionDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          if (date.getTime() === today.getTime()) {
            nextSessionDisplay = "Hôm nay";
          } else if (date.getTime() === tomorrow.getTime()) {
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
          totalSessions: c.planSessions || c.totalSessions,
          completedSessions: c.finishedSessions,
          progress: c.progressPercent || 0,
          status: uiStatus,
          classStatus: c.classStatus,
          startDatePlan: c.openDatePlan,
          startDate: c.openDate,

          endDate: c.endDate || c.endDatePlan,

          hasSessionToday: c.hasSessionToday,
          nextSession: nextSessionDisplay,
          schedule: c.scheduleSummary || "Chưa xếp lịch",
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
