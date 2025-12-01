import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CoursesLayout from "../components/course/CoursesLayout";

const BASE_URL = "https://atps-be.onrender.com/api/instructor/courses";
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

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewCourse, setPreviewCourse] = useState(null);

  const navigate = useNavigate();

  // Load list courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/courses");
      setCourses(res.data || []);
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Create course
  const handleCreateCourse = async (formData) => {
    try {
      const res = await apiClient.post("/courses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const created = res.data?.data;
      if (created) {
        setCourses((prev) => [...prev, created]);
        return created;
      }
    } catch (err) {
      console.error("Create course failed:", err);
      throw err;
    }
  };

  // Update course meta
  const handleUpdateCourse = async (courseId, formData) => {
    try {
      await apiClient.put(`/courses/${courseId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchCourses();
    } catch (err) {
      console.error("Update course failed:", err);
      throw err;
    }
  };

  // Delete course
  const handleDeleteCourse = async (courseId) => {
    try {
      await apiClient.delete(`/courses/${courseId}`);
      setCourses((prev) => prev.filter((c) => c.CourseID !== courseId));
    } catch (err) {
      console.error("Delete course failed:", err);
      throw err;
    }
  };

  // Submit course for review
  const handleSubmitCourse = async (courseId) => {
    try {
      const res = await apiClient.post(`/courses/${courseId}/submit`);
      const status = res.data?.status || "IN_REVIEW";
      setCourses((prev) =>
        prev.map((c) =>
          c.CourseID === courseId ? { ...c, Status: status } : c
        )
      );
    } catch (err) {
      console.error("Submit course failed:", err);
      throw err;
    }
  };

  // Open builder
  const handleOpenBuilder = (courseId) => {
    navigate(`/instructor/courses/${courseId}`);
  };

  const handlePreviewCourse = async (course) => {
    try {
      const res = await apiClient.get(`/courses/${course.CourseID}`);

      setPreviewCourse(res.data?.data || res.data);
    } catch (err) {
      console.error("Failed to load course detail for preview:", err);
    }
  };

  return (
    <CoursesLayout
      courses={courses}
      loading={loading}
      onCreateCourse={handleCreateCourse}
      onUpdateCourse={handleUpdateCourse}
      onDeleteCourse={handleDeleteCourse}
      onSubmitCourse={handleSubmitCourse}
      onOpenBuilder={handleOpenBuilder}
      onPreviewCourse={handlePreviewCourse}
      previewCourse={previewCourse}
      closePreview={() => setPreviewCourse(null)}
    />
  );
}
