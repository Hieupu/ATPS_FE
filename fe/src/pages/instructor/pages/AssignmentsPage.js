import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import useAssignment from "../hooks/useAssignment";
import AssignmentStats from "../components/assignment/AssignmentStats";
import SearchFilterBar from "../components/assignment/SearchFilterBar";
import AssignmentList from "../components/assignment/AssignmentList";
import TypeSelectionModal from "../components/assignment/TypeSelectionModal";
import AssignmentFormDialog from "../components/assignment/AssignmentFormDialog";
import QuestionBuilderDialog from "../components/assignment/QuestionBuilderDialog";
import AssignmentPreviewDialog from "../components/assignment/AssignmentPreviewDialog";
import { getAssignmentQuestionsApi } from "../../../apiServices/assignmentService";

export default function AssignmentsPage() {
  const {
    // Data
    filtered,
    courses,
    units,
    loading,
    busy,
    error,
    success,
    setError,
    setSuccess,
    // Filters
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    stats,
    // Form + Stepper
    form,
    setField,
    formType,
    activeTab,
    setActiveTab,
    formatDate,
    onCourseChange,
    step,
    setStep,
    // Modals
    showTypeModal,
    openTypeModal,
    closeTypeModal,
    showCreateForm,
    closeCreateForm,
    // Actions
    openCreateNew,
    handleSelectType,
    goFormNext,
    proceedToPreview,
    finalizeAndFinish,
    uploadFile,
    handleDelete,
    openEdit,
  } = useAssignment();

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailForm, setDetailForm] = useState({});
  const [detailQuestions, setDetailQuestions] = useState([]);
  const handleViewDetail = async (assignmentId) => {
  const a = filtered.find((x) => x.AssignmentID === assignmentId);
  if (!a) return;

  // map dữ liệu assignment → form cho PreviewDialog
  setDetailForm({
    title: a.Title,
    description: a.Description,
    courseTitle: a.CourseTitle,
    unitTitle: a.UnitTitle,
    deadline: a.Deadline || a.deadline,
    type: a.Type,
    showAnswersAfter: a.ShowAnswersAfter,
    maxDuration: a.MaxDuration,
    fileURL: a.FileURL,
    mediaURL: a.MediaURL,
  });

  try {
    const qs = await getAssignmentQuestionsApi(assignmentId);
    setDetailQuestions(Array.isArray(qs) ? qs : []);
  } catch (err) {
    console.error("Load questions error:", err);
    setDetailQuestions([]);
    toast.error(
      err?.message || "Không thể tải danh sách câu hỏi cho bài tập này"
    );
  }

  setDetailOpen(true);
};

  const currentType = (form.type || formType || "quiz").toLowerCase();
  const wizardSteps =
    currentType === "audio" || currentType === "speaking"
      ? ["Thông tin bài tập", "Cấu hình bài nói", "Tổng quan"]
      : currentType === "video"
        ? ["Thông tin bài tập", "Video & câu hỏi", "Tổng quan"]
        : currentType === "document"
          ? ["Thông tin bài tập", "Tài liệu & câu hỏi", "Tổng quan"]
          : ["Thông tin bài tập", "Thêm câu hỏi", "Tổng quan"];

  useEffect(() => {
    if (error) toast.error(error);
    if (success) toast.success(success);
    const t = setTimeout(() => {
      setError("");
      setSuccess("");
    }, 2000);
    return () => clearTimeout(t);
  }, [error, success, setError, setSuccess]);

  return (
    <div style={styles.container}>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Quản Lý Bài Tập</h1>
          <p style={styles.subtitle}>
            Tạo và quản lý bài tập cho các khóa học của bạn
          </p>
        </div>
        <button style={styles.addButton} onClick={() => openCreateNew()}>
          <span style={styles.plusIcon}>+</span>
          Bài Tập Mới
        </button>
      </div>

      {/* Stats & Filters */}
      <AssignmentStats stats={stats} />
      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        courses={courses}
      />

      {/* List với phân trang */}
      <div>
        <h2 style={styles.sectionTitle}>
          Tất Cả Bài Tập ({filtered.length})
        </h2>
        {loading ? (
          <div style={styles.loadingState}>Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <p>
              Chưa có bài tập nào. Nhấn "Bài Tập Mới" để tạo bài tập đầu tiên!
            </p>
          </div>
        ) : (
          <AssignmentList
            assignments={filtered}
            onEdit={openEdit}
            onViewSubmissions={() => { }}
            onDelete={handleDelete}
            onViewDetail={handleViewDetail}
            itemsPerPage={6}
          />
        )}
      </div>

      {/* STEP 0 – Type selection */}
      <TypeSelectionModal
        show={showTypeModal}
        onClose={closeTypeModal}
        onSelectType={handleSelectType}
      />

      {/* STEP 1 – Thông tin bài tập */}
      <AssignmentFormDialog
        show={showCreateForm && step === 1}
        onClose={closeCreateForm}
        formType={formType}
        form={form}
        setField={setField}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        courses={courses}
        units={units}
        onCourseChange={onCourseChange}
        formatDate={formatDate}
        onSubmit={goFormNext}
        onUploadFile={uploadFile}
        busy={busy}
        wizardProps={{
          steps: wizardSteps,
          activeStep: 1,
          onPrev: undefined,
          onNext: goFormNext,
          nextLabel: "Tiếp theo",
          finish: false,
          disabled: busy,
        }}
      />

      {/* STEP 2 – Thêm câu hỏi / Cấu hình tùy loại */}
      <QuestionBuilderDialog
        show={showCreateForm && step === 2}
        onClose={closeCreateForm}
        questions={form.localQuestions || []}
        setQuestions={(qs) => setField("localQuestions", qs)}
        onSubmit={(qs) => proceedToPreview(qs)}
        busy={busy}
        form={form}
        setField={setField}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUploadFile={uploadFile}
        wizardProps={{
          steps: wizardSteps,
          activeStep: 2,
          onPrev: () => setStep(1),
          onNext: () => proceedToPreview(form.localQuestions || []),
          nextLabel: "Preview",
          finish: false,
          disabled: busy,
        }}
      />

      {/* STEP 3 – Preview */}
      <AssignmentPreviewDialog
        show={showCreateForm && step === 3}
        onClose={closeCreateForm}
        form={form}
        questions={form.localQuestions || []}
        onConfirm={finalizeAndFinish}
        busy={busy}
        courses={courses}
        units={units}
        wizardProps={{
          steps: wizardSteps,
          activeStep: 3,
          onPrev: () => setStep(2),
          onNext: () => proceedToPreview(form.localQuestions || []),
          finish: false,
          disabled: busy,
        }}
      />
      {/* VIEW MODE – Xem chi tiết bài tập từ danh sách */}
      <AssignmentPreviewDialog
        show={detailOpen}
        onClose={() => setDetailOpen(false)}
        form={detailForm}
        questions={detailQuestions}
        busy={false}
        courses={courses}
        units={units}
        wizardProps={null}
        onConfirm={null}
        viewMode={true}
      />
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F9FAFB",
    padding: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6B7280",
  },
  addButton: {
    backgroundColor: "#000",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "15px",
  },
  plusIcon: { fontSize: "20px" },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "16px",
  },
  loadingState: {
    textAlign: "center",
    padding: "40px",
    color: "#6B7280",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "2px dashed #E5E7EB",
  },
};