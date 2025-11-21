import { useState, useEffect, useMemo } from "react";
import {
  getAssignmentsApi,
  createAssignmentApi,
  updateAssignmentApi,
  patchAssignmentStatusApi,
} from "../../../apiServices/assignmentService";
import dayjs from "dayjs";

export default function useAssignment() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // form + dialogs
  const [form, setForm] = useState({
    AssignmentID: null,
    Title: "",
    Description: "",
    Deadline: "",
    Type: "assignment",
    UnitID: "",
  });
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [statusTarget, setStatusTarget] = useState({ id: null, next: "inactive" });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAssignmentsApi();
      setAssignments(res?.assignments ?? []);
    } catch (err) {
      setError(err?.message || "Không tải được danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const total = assignments.length;
    const open = assignments.filter(a => (a.Status ?? "").toLowerCase() === "active").length;
    const deleted = assignments.filter(a => (a.Status ?? "").toLowerCase() === "deleted").length;
    return { total, open, deleted, grading: open };
  }, [assignments]);

  const filtered = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    const base = assignments.filter(a => {
      const t = (a.Title ?? "").toLowerCase();
      const c = (a.ClassName ?? "").toLowerCase();
      return !term || t.includes(term) || c.includes(term);
    });
    if (tabValue === 1) return base.filter(a => (a.Type ?? "").toLowerCase() === "assignment");
    if (tabValue === 2) return base.filter(a => (a.Type ?? "").toLowerCase() === "exam");
    return base;
  }, [assignments, searchQuery, tabValue]);

  // CRUD
  const submitCreate = async () => {
    try {
      setBusy(true);
      await createAssignmentApi({
        title: form.Title,
        description: form.Description,
        deadline: form.Deadline,
        type: form.Type,
        unitId: form.UnitID ? Number(form.UnitID) : undefined,
      });
      setSuccess("Tạo bài tập thành công");
      setOpenCreate(false);
      await loadData();
    } catch (err) {
      setError(err?.message || "Không thể tạo bài tập");
    } finally {
      setBusy(false);
    }
  };

  const submitEdit = async () => {
    try {
      setBusy(true);
      await updateAssignmentApi(form.AssignmentID, {
        title: form.Title,
        description: form.Description,
        deadline: form.Deadline,
        type: form.Type,
        unitId: form.UnitID ? Number(form.UnitID) : undefined,
      });
      setSuccess("Cập nhật bài tập thành công");
      setOpenEdit(false);
      await loadData();
    } catch (err) {
      setError(err?.message || "Không thể cập nhật bài tập");
    } finally {
      setBusy(false);
    }
  };

  const submitStatus = async () => {
    try {
      setBusy(true);
      await patchAssignmentStatusApi(statusTarget.id, statusTarget.next);
      setSuccess("Cập nhật trạng thái thành công");
      setOpenStatus(false);
      await loadData();
    } catch (err) {
      setError(err?.message || "Không thể cập nhật trạng thái");
    } finally {
      setBusy(false);
    }
  };

  const editFromItem = (item) => {
    setForm({
      AssignmentID: item.AssignmentID,
      Title: item.Title ?? "",
      Description: item.Description ?? "",
      Deadline: item.Deadline ? dayjs(item.Deadline).format("YYYY-MM-DD") : "",
      Type: item.Type ?? "assignment",
      UnitID: item.UnitID ?? "",
    });
    setOpenEdit(true);
  };

  return {
    assignments, filtered, stats,
    loading, busy, error, success, setError, setSuccess,
    tabValue, setTabValue, searchQuery, setSearchQuery,
    form, setForm,
    openCreate, setOpenCreate, openEdit, setOpenEdit,
    openStatus, setOpenStatus, statusTarget, setStatusTarget,
    submitCreate, submitEdit, submitStatus, editFromItem,
  };
}