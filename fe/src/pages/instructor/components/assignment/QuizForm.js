import React from "react";

export default function QuizForm({
  form,
  setField,
  courses = [],
  units = [],
  onCourseChange = () => { },
}) {
  return (
    <div>
      <div style={s.group}>
        <label style={s.label}>Tiêu đề bài tập (*Bắt buộc)</label>
        <input
          type="text"
          placeholder="Nhập mô tiêu đề bài tập..."
          style={s.input}
          value={form.title || ""}
          onChange={(e) => setField("title", e.target.value)}
        />
      </div>

      <div style={s.group}>
        <label style={s.label}>Mô tả (*Bắt buộc)</label>
        <textarea
          placeholder="Nhập mô tả bài tập..."
          style={s.textarea}
          value={form.description || ""}
          onChange={(e) => setField("description", e.target.value)}
        />
      </div>

      <div style={s.row}>
        <div style={{ ...s.group, flex: 1 }}>
          <label style={s.label}>Khóa Học (Course)</label>
          <select
            style={s.select}
            value={form.courseId || ""}
            onChange={(e) => onCourseChange(e.target.value || null)}
          >
            <option value="">Chọn khóa học</option>
            {courses.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div style={{ ...s.group, flex: 1 }}>
          <label style={s.label}>Chương Học (Unit)</label>
          <select
            style={s.select}
            value={form.unitId || ""}
            onChange={(e) => setField("unitId", e.target.value ? Number(e.target.value) : null)} disabled={!form.courseId}
          >
            <option value="">Chọn chương học</option>
            {units.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={s.group}>
        <label style={s.label}>Hạn Nộp (*Có thể để trống)</label>
        <input
          type="datetime-local"
          style={s.input}
          value={form.deadline || ""}
          onChange={(e) => setField("deadline", e.target.value)}
        />
      </div>
    </div>
  );
}

const s = {
  group: { marginBottom: 20 },
  row: { display: "flex", gap: 16, marginBottom: 20 },
  label: { display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none" },
  textarea: { width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", minHeight: 120, resize: "vertical", fontFamily: "inherit" },
  select: { width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" },
};
