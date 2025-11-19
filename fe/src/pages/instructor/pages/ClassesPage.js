// pages/ClassesPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box } from "@mui/material";
import ClassesLayout from "../components/class/ClassesLayout";

// Tạm giống mẫu course nhưng chỉnh lại cho đúng route
const BASE_URL = "http://localhost:9999/api/instructor";
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

  // filter/search state vẫn để ở page để sau dễ sync URL nếu cần
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchClasses = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get("/classes");
      const data = res.data || [];

      const mapped = data.map((c, index) => {
        const statusRaw = (c.Status || "").toLowerCase();
        let uiStatus = "upcoming";
        if (statusRaw.includes("ongoing") || statusRaw.includes("đang")) {
          uiStatus = "ongoing";
        } else if (
          statusRaw.includes("completed") ||
          statusRaw.includes("finished") ||
          statusRaw.includes("kết")
        ) {
          uiStatus = "completed";
        }

        const palette = ["#667eea", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
        const thumbnail = palette[index % palette.length];

        return {
          id: c.ClassID,
          courseName: c.CourseTitle,
          className: c.Name,
          classCode: c.Name,
          instructorName: c.InstructorName,

          students: Number(c.StudentCount ?? 0),
          totalStudents: Number(c.Maxstudent ?? 0),

          fee: c.Fee,
          numOfSession: c.Numofsession,

          status: uiStatus,
          startDatePlan: c.OpendatePlan,
          endDatePlan: c.EnddatePlan,
          startDate: c.Opendate,
          endDate: c.Enddate,

          zoomId: c.ZoomID,
          zoomPass: c.Zoompass,

          progress: 0,
          attendanceRate: 0,
          nextSession: "-",
          schedule: "",
          thumbnail,
          pendingAssignments: 0,
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
