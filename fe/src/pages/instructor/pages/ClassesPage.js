import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box } from "@mui/material";
import ClassesLayout from "../components/class/ClassesLayout";

const BASE_URL = `${process.env.REACT_APP_API_URL}/instructor`;
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
        if (
          ["CLOSE", "CANCEL", "COMPLETED", "CANCELLED"].includes(c.classStatus)
        ) {
          uiStatus = "completed";
        } else if (["ACTIVE", "ON_GOING", "APPROVED"].includes(c.classStatus)) {
          uiStatus = "ongoing";
        } else {
          const start = c.openDate
            ? new Date(c.openDate)
            : new Date(c.openDatePlan);
          const now = new Date();
          uiStatus = start <= now ? "ongoing" : "upcoming";
        }

        return {
          id: c.classId,

          className: c.className,
          classStatus: c.classStatus,
          status: uiStatus,

          courseTitle: c.courseTitle,
          courseImage: c.courseImage || "/images/default-class.jpg",
          courseLevel: c.courseLevel,

          fee: Number(c.fee),
          currentStudents: c.currentStudents,
          maxStudents: c.maxStudents,

          totalSessions: c.totalSessions || c.planSessions,
          finishedSessions: c.finishedSessions,
          progressPercent: c.progressPercent || 0,

          startDate: c.openDate || c.openDatePlan,
          endDate: c.endDate || c.endDatePlan,

          nextSessionDate: c.nextSessionDate,
          hasSessionToday: c.hasSessionToday,

          scheduleSummary: c.scheduleSummary,
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
