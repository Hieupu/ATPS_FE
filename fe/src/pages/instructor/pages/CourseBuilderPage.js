import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import CourseBuilderLayout from "../components/course/CourseBuilderLayout";

const BASE_URL = `${process.env.REACT_APP_API_URL}/instructor`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function CourseBuilderPage() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);

  const [units, setUnits] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [lessonsByUnit, setLessonsByUnit] = useState({});
  const [assignmentsByUnit, setAssignmentsByUnit] = useState({});
  const [loadingAssignments, setLoadingAssignments] = useState({});

  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState({});

  // -------- Course meta --------
  const fetchCourse = async () => {
    try {
      setLoadingCourse(true);
      const res = await apiClient.get(`/courses/${courseId}`);
      setCourse(res.data?.data || null);
    } catch (err) {
      console.error("Failed to load course detail:", err);
    } finally {
      setLoadingCourse(false);
    }
  };

  // -------- Units --------
  const fetchUnits = async () => {
    try {
      setLoadingUnits(true);
      const res = await apiClient.get(`/courses/${courseId}/units`);

      setUnits(res.data.units || []);
    } catch (err) {
      console.error("Failed to load units:", err);
      setUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  };

  // -------- Materials --------
  const fetchMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const res = await apiClient.get(`/courses/${courseId}/materials`);

      setMaterials(res.data.materials || []);
    } catch (err) {
      console.error("Failed to load materials:", err);
      setMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    if (!courseId) return;
    fetchCourse();
    fetchUnits();
    fetchMaterials();
  }, [courseId]);

  useEffect(() => {
    units.forEach((u) => {
      if (u.UnitID && !lessonsByUnit[u.UnitID]) {
        fetchLessonsForUnit(u.UnitID);
      }
      if (!assignmentsByUnit[u.UnitID]) {
        fetchAssignmentsForUnit(u.UnitID);
      }
    });
  }, [units]);

  // -------- Course meta handlers --------
  const handleUpdateCourseMeta = async (payload) => {
    try {
      await apiClient.put(`/courses/${courseId}`, payload);
      setCourse((prev) => (prev ? { ...prev, ...payload } : prev));
    } catch (err) {
      console.error("Update course meta failed:", err);
      throw err;
    }
  };

  const handleSubmitCourse = async () => {
    try {
      const res = await apiClient.post(`/courses/${courseId}/submit`);
      const status = res.data?.status || "IN_REVIEW";
      setCourse((prev) => (prev ? { ...prev, Status: status } : prev));
    } catch (err) {
      console.error("Submit course failed:", err);
      throw err;
    }
  };

  // -------- Unit handlers --------
  const handleCreateUnit = async (payload) => {
    try {
      console.log("CALL API CREATE UNIT:", payload);
      const res = await apiClient.post(`/courses/${courseId}/units`, payload);

      const created = res.data?.data || res.data;
      if (!created) {
        await fetchUnits();
        return;
      }

      setUnits((prev) => [...prev, created]);
      return created;
    } catch (err) {
      console.error("Create unit failed:", err);

      throw err;
    }
  };

  const handleUpdateUnit = async (unitId, payload) => {
    try {
      await apiClient.put(`/units/${unitId}`, payload);
      setUnits((prev) =>
        prev.map((u) => (u.UnitID === unitId ? { ...u, ...payload } : u))
      );
    } catch (err) {
      console.error("Update unit failed:", err);
      throw err;
    }
  };

  const handleDeleteUnit = async (unitId) => {
    try {
      await apiClient.delete(`/units/${unitId}`);
      setUnits((prev) => prev.filter((u) => u.UnitID !== unitId));
      setLessonsByUnit((prev) => {
        const clone = { ...prev };
        delete clone[unitId];
        return clone;
      });
    } catch (err) {
      console.error("Delete unit failed:", err);
      throw err;
    }
  };

  // Reorder units: nhận mảng units mới, update state & call API
  const handleReorderUnits = async (newOrderedUnits) => {
    try {
      // cập nhật OrderIndex mới
      const updated = newOrderedUnits.map((u, idx) => ({
        ...u,
        OrderIndex: idx + 1,
      }));
      setUnits(updated);

      // gọi PUT cho từng unit (đơn giản, sau tối ưu bulk sau)
      for (const u of updated) {
        await apiClient.put(`/units/${u.UnitID}`, {
          OrderIndex: u.OrderIndex,
        });
      }
    } catch (err) {
      console.error("Reorder units failed:", err);
      throw err;
    }
  };

  // -------- Lesson handlers --------
  const fetchLessonsForUnit = async (unitId) => {
    try {
      setLoadingLessons((prev) => ({ ...prev, [unitId]: true }));
      const res = await apiClient.get(`/units/${unitId}/lessons`);
      setLessonsByUnit((prev) => ({
        ...prev,
        [unitId]: res.data.lessons || [],
      }));
    } catch (err) {
      console.error("Load lessons failed:", err);
      setLessonsByUnit((prev) => ({ ...prev, [unitId]: [] }));
    } finally {
      setLoadingLessons((prev) => ({ ...prev, [unitId]: false }));
    }
  };

  const handleCreateLesson = async (unitId, payload) => {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      const res = await apiClient.post(`/units/${unitId}/lessons`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const created = res.data?.data || res.data;
      if (created) {
        setLessonsByUnit((prev) => {
          const oldList = prev[unitId] || [];
          return {
            ...prev,
            [unitId]: [...oldList, created],
          };
        });
        return created;
      }
    } catch (err) {
      console.error("Create lesson failed:", err);
      throw err;
    }
  };

  const handleUpdateLesson = async (unitId, lessonId, payload) => {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      await apiClient.put(`/units/${unitId}/lessons/${lessonId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLessonsByUnit((prev) => {
        const list = prev[unitId] || [];
        return {
          ...prev,
          [unitId]: list.map((l) =>
            l.LessonID === lessonId ? { ...l, ...payload } : l
          ),
        };
      });
    } catch (err) {
      console.error("Update lesson failed:", err);
      throw err;
    }
  };

  const handleDeleteLesson = async (unitId, lessonId) => {
    try {
      await apiClient.delete(`/units/${unitId}/lessons/${lessonId}`);
      setLessonsByUnit((prev) => {
        const list = prev[unitId] || [];
        return {
          ...prev,
          [unitId]: list.filter((l) => l.LessonID !== lessonId),
        };
      });
    } catch (err) {
      console.error("Delete lesson failed:", err);
      throw err;
    }
  };

  const handleReorderLessons = async (unitId, newOrderedLessons) => {
    try {
      setLessonsByUnit((prev) => ({
        ...prev,
        [unitId]: newOrderedLessons,
      }));

      for (const l of newOrderedLessons) {
        await apiClient.put(`/units/${unitId}/lessons/${l.LessonID}`, {
          OrderIndex: l.OrderIndex,
        });
      }

      console.log("Cập nhật thứ tự thành công cho Unit:", unitId);
    } catch (err) {
      console.error("Reorder lessons failed:", err);

      fetchLessonsForUnit(unitId);
    }
  };

  // -------- Material handlers --------
  const handleCreateMaterial = async (payload) => {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      const res = await apiClient.post(
        `/courses/${courseId}/materials`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const created = res.data?.data || res.data;
      if (created) {
        setMaterials((prev) => [...prev, created]);
        return created;
      }
    } catch (err) {
      console.error("Create material failed:", err);
      throw err;
    }
  };

  const handleUpdateMaterial = async (materialId, payload) => {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      await apiClient.put(`/materials/${materialId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMaterials((prev) =>
        prev.map((m) =>
          m.MaterialID === materialId ? { ...m, ...payload } : m
        )
      );
    } catch (err) {
      console.error("Update material failed:", err);
      throw err;
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    try {
      await apiClient.delete(`/materials/${materialId}`);
      setMaterials((prev) => prev.filter((m) => m.MaterialID !== materialId));
    } catch (err) {
      console.error("Delete material failed:", err);
      throw err;
    }
  };

  const fetchAssignmentsForUnit = async (unitId) => {
    try {
      setLoadingAssignments((prev) => ({ ...prev, [unitId]: true }));
      const res = await apiClient.get(`/units/${unitId}/assignments`);
      setAssignmentsByUnit((prev) => ({
        ...prev,
        [unitId]: res.data.assignments || [],
      }));
    } catch (err) {
      console.error("Load assignments failed:", err);
      setAssignmentsByUnit((prev) => ({ ...prev, [unitId]: [] }));
    } finally {
      setLoadingAssignments((prev) => ({ ...prev, [unitId]: false }));
    }
  };

  return (
    <CourseBuilderLayout
      course={course}
      loadingCourse={loadingCourse}
      units={units}
      loadingUnits={loadingUnits}
      lessonsByUnit={lessonsByUnit}
      loadingLessons={loadingLessons}
      materials={materials}
      loadingMaterials={loadingMaterials}
      // course meta handlers
      onUpdateCourseMeta={handleUpdateCourseMeta}
      onSubmitCourse={handleSubmitCourse}
      // unit handlers
      onCreateUnit={handleCreateUnit}
      onUpdateUnit={handleUpdateUnit}
      onDeleteUnit={handleDeleteUnit}
      onReorderUnits={handleReorderUnits}
      assignmentsByUnit={assignmentsByUnit}
      loadingAssignments={loadingAssignments}
      onLoadAssignments={fetchAssignmentsForUnit}
      // lesson handlers
      onLoadLessons={fetchLessonsForUnit}
      onCreateLesson={handleCreateLesson}
      onUpdateLesson={handleUpdateLesson}
      onDeleteLesson={handleDeleteLesson}
      onReorderLessons={handleReorderLessons}
      // materials handlers
      onCreateMaterial={handleCreateMaterial}
      onUpdateMaterial={handleUpdateMaterial}
      onDeleteMaterial={handleDeleteMaterial}
    />
  );
}
