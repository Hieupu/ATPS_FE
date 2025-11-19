import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
/**
 * Hook quản lý danh sách câu hỏi
 */
export function useQuestions(questions, form, setQuestions, setField) {
  const [internalQuestions, setInternalQuestions] = useState([]);

  const qList = useMemo(() => {
    if (Array.isArray(questions)) return questions;
    if (form && Array.isArray(form.localQuestions)) return form.localQuestions;
    return internalQuestions;
  }, [questions, form, internalQuestions]);

  const setQList = (next) => {
    if (setQuestions) setQuestions(next);
    else if (setField) setField("localQuestions", next);
    else setInternalQuestions(next);
  };

  return [qList, setQList];
}

/**
 * Hook quản lý active tab
 */
export function useActiveTab(activeTab, setActiveTab) {
  const [internalActiveTab, setInternalActiveTab] = useState("manual");

  const curActiveTab = activeTab || internalActiveTab || "manual";

  const setTab = (tab) => {
    if (setActiveTab) setActiveTab(tab);
    else setInternalActiveTab(tab);
  };

  return [curActiveTab, setTab];
}

/**
 * Hook quản lý question form (add/edit)
 */
export function useQuestionForm() {
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState(null);

  const openForm = () => setShowQuestionForm(true);
  
  const closeForm = () => {
    setShowQuestionForm(false);
    setEditIndex(null);
    setEditData(null);
  };

  const openEditForm = (question, index) => {
    setEditIndex(index);
    setEditData(question);
    setShowQuestionForm(true);
  };

  return {
    showQuestionForm,
    editIndex,
    editData,
    openForm,
    closeForm,
    openEditForm,
  };
}

/**
 * Hook quản lý CRUD operations cho questions
 */
export function useQuestionCRUD(qList, setQList, questionForm) {
  const makeUid = (pfx = "id") =>
    `${pfx}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const handleAddQuestion = (questionData) => {
    const qUid = makeUid("q");
    const newQuestion = {
      ...questionData,
      uid: qUid,
      QuestionID: questionData.QuestionID || qUid,
      options: (questionData.options || []).map((o, i) => ({
        ...o,
        uid: o.uid || makeUid(`opt${i}`),
      })),
    };
    setQList([...qList, newQuestion]);
    questionForm.closeForm();
    return true;
  };

  const handleDeleteQuestion = (id) => {
    const filtered = qList.filter(
      (q) => q.QuestionID !== id && q.tempId !== id
    );
    setQList(filtered);
  };

  const handleEditQuestion = (q, index) => {
    questionForm.openEditForm(q, index);
  };

  const handleUpdateQuestion = (updated) => {
    const next = [...qList];
    next[questionForm.editIndex] = { ...next[questionForm.editIndex], ...updated };
    setQList(next);
    questionForm.closeForm();
  };

  return {
    handleAddQuestion,
    handleDeleteQuestion,
    handleEditQuestion,
    handleUpdateQuestion,
  };
}

/**
 * Hook quản lý file upload
 */
export function useFileUpload(onUploadFile, setField) {
  // Parse Excel => mảng câu hỏi FE: { Content, Type, Point, options, CorrectAnswer }
  const parseExcelToQuestions = async (file) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    const questions = [];
    const skipRowIndexes = new Set();

    const splitCell = (val) =>
      String(val ?? "")
        .split(/\r?\n|;/)
        .map((s) => s.trim())
        .filter(Boolean);

    for (let index = 0; index < rows.length; index++) {
      if (skipRowIndexes.has(index)) continue;

      const row = rows[index] || {};
      const allValues = Object.values(row)
        .map((v) => String(v ?? "").trim())
        .filter(Boolean);

      // Dòng trống hoàn toàn -> bỏ qua
      if (!allValues.length) continue;

      const rawType =
        row["Loại"] ||
        row["Loai"] ||
        row["Type"] ||
        row["type"] ||
        "";
      const type = String(rawType || "").trim().toLowerCase() || "multiple_choice";

      const content =
        row["Nội dung"] ||
        row["Noi dung"] ||
        row["Content"] ||
        row["content"] ||
        "";
      if (!String(content).trim()) continue;

      const pointRaw = row["Điểm"] || row["Diem"] || row["Point"] || row["point"] || 1;
      const point = Number(pointRaw) || 1;

      // ===== MULTIPLE CHOICE =====
      if (type === "multiple_choice") {
        const optionKeys = [
          ["Tùy chọn 1", "Tuy chon 1", "Option 1"],
          ["Tùy chọn 2", "Tuy chon 2", "Option 2"],
          ["Tùy chọn 3", "Tuy chon 3", "Option 3"],
          ["Tùy chọn 4", "Tuy chon 4", "Option 4"],
        ];

        const options = [];
        optionKeys.forEach((keys) => {
          const val =
            row[keys[0]] ||
            row[keys[1]] ||
            row[keys[2]] ||
            "";
          if (String(val).trim()) {
            options.push({
              Content: String(val).trim(),
              IsCorrect: false,
            });
          }
        });

        if (!options.length) continue;

        const answerRaw = row["Đáp án"] || row["Dap an"] || row["Answer"] || "";
        let ans = String(answerRaw || "").trim();
        let correctIdx = -1;

        if (ans) {
          // 1-4
          const num = Number(ans);
          if (!Number.isNaN(num) && num >= 1 && num <= options.length) {
            correctIdx = num - 1;
          } else {
            // A-D
            const ch = ans.toUpperCase();
            const letterIdx = ch.charCodeAt(0) - "A".charCodeAt(0);
            if (letterIdx >= 0 && letterIdx < options.length) {
              correctIdx = letterIdx;
            }
          }
        }

        if (correctIdx >= 0 && options[correctIdx]) {
          options[correctIdx].IsCorrect = true;
        }

        questions.push({
          Content: String(content).trim(),
          Type: "multiple_choice",
          Point: point,
          options,
          CorrectAnswer: null,
        });

        continue;
      }

      // ===== TRUE / FALSE =====
      if (type === "true_false") {
        const answerRaw = row["Đáp án"] || row["Dap an"] || row["Answer"] || "";
        const val = String(answerRaw || "").trim().toLowerCase();
        if (!["true", "false"].includes(val)) continue;

        questions.push({
          Content: String(content).trim(),
          Type: "true_false",
          Point: point,
          options: [],
          CorrectAnswer: val,
        });
        continue;
      }

      // ===== FILL IN BLANK =====
      if (type === "fill_in_blank") {
        const answerRaw = row["Đáp án"] || row["Dap an"] || row["Answer"] || "";
        const val = String(answerRaw || "").trim();
        if (!val) continue;

        questions.push({
          Content: String(content).trim(),
          Type: "fill_in_blank",
          Point: point,
          options: [],
          CorrectAnswer: val,
        });
        continue;
      }

      // ===== MATCHING =====
      if (type === "matching") {
        const leftRaw =
          row["Cặp A (Trái)"] ||
          row["Cap A (Trai)"] ||
          row["Cap A"] ||
          "";
        const rightRaw =
          row["Cặp B (Phải)"] ||
          row["Cap B (Phai)"] ||
          row["Cap B"] ||
          "";

        let leftList = splitCell(leftRaw);
        let rightList = splitCell(rightRaw);

        // Gom thêm cặp từ các dòng ngay phía dưới (giống backend)
        for (let j = index + 1; j < rows.length; j++) {
          if (skipRowIndexes.has(j)) continue;
          const next = rows[j] || {};

          const nextValues = Object.values(next)
            .map((v) => String(v ?? "").trim())
            .filter(Boolean);
          if (!nextValues.length) break; // dòng trống -> kết thúc gom

          const nextTypeRaw =
            next["Loại"] ||
            next["Loai"] ||
            next["Type"] ||
            next["type"] ||
            "";
          const nextType = String(nextTypeRaw || "").trim().toLowerCase();

          const nextContent =
            next["Nội dung"] ||
            next["Noi dung"] ||
            next["Content"] ||
            next["content"] ||
            "";

          const nextLeftRaw =
            next["Cặp A (Trái)"] ||
            next["Cap A (Trai)"] ||
            next["Cap A"] ||
            "";
          const nextRightRaw =
            next["Cặp B (Phải)"] ||
            next["Cap B (Phai)"] ||
            next["Cap B"] ||
            "";

          const nextHasPair =
            String(nextLeftRaw || "").trim() ||
            String(nextRightRaw || "").trim();

          // Nếu có type mới hoặc có Content mới -> coi như câu hỏi khác
          if (nextType || String(nextContent || "").trim()) break;

          // Nếu chỉ có cặp A/B -> gom vào câu hỏi hiện tại
          if (nextHasPair) {
            leftList = leftList.concat(splitCell(nextLeftRaw));
            rightList = rightList.concat(splitCell(nextRightRaw));
            skipRowIndexes.add(j);
          } else {
            // Không có cặp -> dừng gom
            break;
          }
        }

        if (!leftList.length || leftList.length !== rightList.length) continue;

        const pairObj = {};
        for (let i2 = 0; i2 < leftList.length; i2++) {
          pairObj[leftList[i2]] = rightList[i2];
        }

        questions.push({
          Content: String(content).trim(),
          Type: "matching",
          Point: point,
          options: [],
          // FE QuestionForm đang expect string cho matching CorrectAnswer (JSON)
          CorrectAnswer: JSON.stringify(pairObj),
        });
        continue;
      }

      // Loại không hỗ trợ -> bỏ qua
    }

    return questions;
  };

  // Dùng cho tab "Upload Template Excel"
  const handleTemplateFileChange = async (e, onExcelParsed) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Nếu có callback parse Excel -> dùng local parse để set questions
    if (typeof onExcelParsed === "function") {
      try {
        const questions = await parseExcelToQuestions(file);
        onExcelParsed(questions || []);
      } catch (err) {
        console.error("Parse Excel template error:", err);
      } finally {
        // reset input để chọn lại cùng file vẫn trigger onChange
        e.target.value = "";
      }
      return;
    }

    // Ngược lại: fallback behavior cũ (upload file lên server, set fileURL)
    try {
      const url = await onUploadFile(file);
      if (setField) setField("fileURL", url);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      e.target.value = "";
    }
  };

  const handleMediaFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await onUploadFile(file);
      if (setField) setField("mediaURL", url);
    } catch (err) {
      console.error("Upload media error:", err);
    } finally {
      e.target.value = "";
    }
  };

  const handleDocRefFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await onUploadFile(file);
      if (setField) setField("fileURL", url);
    } catch (err) {
      console.error("Upload document error:", err);
    } finally {
      e.target.value = "";
    }
  };

  return {
    handleTemplateFileChange,
    handleMediaFileChange,
    handleDocRefFileChange,
  };
}


/**
 * Hook quản lý wizard navigation
 */
export function useWizardNavigation(wizardProps, onSubmit, qList) {
  const canGoPrev =
    !!wizardProps &&
    typeof wizardProps.onPrev === "function" &&
    wizardProps.activeStep > 1;

  const handlePrev = () => {
    if (wizardProps?.onPrev) wizardProps.onPrev();
  };

  const handleNext = () => {
    if (wizardProps?.onNext) wizardProps.onNext();
    else onSubmit(qList);
  };

  return {
    canGoPrev,
    handlePrev,
    handleNext,
  };
}

/**
 * Hook xác định loại assignment
 */
export function useAssignmentType(form) {
  const assignmentType = (form?.type || "").toLowerCase();
  
  const isAudio = assignmentType === "audio" || assignmentType === "speaking";
  const isVideo = assignmentType === "video";
  const isDocument = assignmentType === "document";
  const requiresQuestions = !isAudio;

  const headerTitle = (() => {
    if (isAudio) return " Cài đặt bài tập nói :";
    if (isVideo) return "Media & câu hỏi :";
    if (isDocument) return "Tài liệu & câu hỏi :";
    return "Tạo câu hỏi :";
  })();

  return {
    assignmentType,
    isAudio,
    isVideo,
    isDocument,
    requiresQuestions,
    headerTitle,
  };
}