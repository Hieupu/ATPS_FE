import React, { useState } from "react";
import Swal from "sweetalert2";
import WizardStepperBar from "./WizardStepperBar";
import QuestionForm from "./QuestionForm";
import QuestionList from "./QuestionList";
import "./style/QuestionBuilderDialog.css";
import {
  useQuestions,
  useActiveTab,
  useQuestionForm,
  useQuestionCRUD,
  useFileUpload,
  useWizardNavigation,
  useAssignmentType,
} from "../../hooks/useQuestionBuilder";
import * as XLSX from "xlsx";

export default function QuestionBuilderDialog({
  show,
  onClose,
  wizardProps,
  busy,
  questions,
  setQuestions,
  form,
  setField,
  activeTab,
  setActiveTab,
  onUploadFile = async () => { },
  onSubmit,
}) {

  const [mediaTab, setMediaTab] = useState("upload");
  const assignmentConfig = useAssignmentType(form);
  const [qList, setQList] = useQuestions(questions, form, setQuestions, setField);
  const [curActiveTab, setTab] = useActiveTab(activeTab, setActiveTab);
  const questionForm = useQuestionForm();
  const questionCRUD = useQuestionCRUD(qList, setQList, questionForm);
  const fileUpload = useFileUpload(onUploadFile, setField);
  const wizardNav = useWizardNavigation(wizardProps, onSubmit, qList);

  const {
    isAudio,
    isVideo,
    isDocument,
    requiresQuestions,
    headerTitle,
  } = assignmentConfig;

  if (!show) return null;

  return (
    <div className="qbd-backdrop">
      <div className="qbd-modal">
        {wizardProps && (
          <div style={{ padding: "8px 16px" }}>
            <WizardStepperBar variant="inline" centered {...wizardProps} />
          </div>
        )}
        <div className="qbd-card">
          <div className="qbd-header">
            <h2 style={{ margin: 0 }}>{headerTitle}</h2>
          </div>
          <div className="qbd-body">
            {isAudio ? (
              <AudioAssignmentSection form={form} setField={setField} />
            ) : (
              <>
                {(isVideo || isDocument) && (
                  <MediaSection
                    isVideo={isVideo}
                    isDocument={isDocument}
                    form={form}
                    setField={setField}
                    mediaTab={mediaTab}
                    setMediaTab={setMediaTab}
                    fileUpload={fileUpload}
                  />
                )}

                <QuestionBuilderSection
                  curActiveTab={curActiveTab}
                  setTab={setTab}
                  form={form}
                  setField={setField}
                  questionForm={questionForm}
                  questionCRUD={questionCRUD}
                  qList={qList}
                  setQList={setQList}
                  fileUpload={fileUpload}
                  busy={busy}
                />
              </>
            )}
          </div>
        </div>
        <div className="qbd-footer">
          <button className="qbd-secondary-btn" onClick={onClose}>
            Hủy
          </button>

          <div className="qbd-footer-right">
            <button
              onClick={wizardNav.handlePrev}
              className="qbd-secondary-btn"
              disabled={!wizardNav.canGoPrev || busy}
            >
              Quay lại
            </button>

            <button
              onClick={wizardNav.handleNext}
              className="qbd-primary-btn"
              disabled={busy || (requiresQuestions && qList.length === 0)}
              title={
                requiresQuestions && qList.length === 0
                  ? "Vui lòng thêm ít nhất 1 câu hỏi"
                  : ""
              }
            >
              Tiếp theo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

function AudioAssignmentSection({ form, setField }) {
  return (
    <>
      <div className="qbd-form-group">
        <label className="qbd-label">Thời Lượng Tối Đa (giây)</label>
        <input
          type="number"
          placeholder="60"
          className="qbd-input"
          value={form?.maxDuration ?? ""}
          onChange={(e) =>
            setField
              ? setField("maxDuration", parseInt(e.target.value, 10) || null)
              : null
          }
        />
      </div>

      <div className="qbd-info-box">
        <div>
          <h4 className="qbd-info-title">Thông Tin Bài Tập Nói</h4>
          <ul className="qbd-info-list">
            <li>Học viên sẽ ghi âm trực tiếp trong hệ thống</li>
            <li>Thời lượng tối đa: {form?.maxDuration || 60} giây</li>
            <li>Hỗ trợ định dạng: MP3, WAV, M4A</li>
            <li>Học viên có thể nộp lại trước deadline</li>
          </ul>
        </div>
      </div>
    </>
  );
}

function MediaSection({
  isVideo,
  isDocument,
  form,
  setField,
  mediaTab,
  setMediaTab,
  fileUpload,
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="qbd-tabs">
        <button
          className={mediaTab === "upload" ? "qbd-tab-active" : "qbd-tab"}
          onClick={() => setMediaTab("upload")}
        >
          {isVideo ? "Upload Media" : "Upload Tài Liệu"}
        </button>
        <button
          className={mediaTab === "link" ? "qbd-tab-active" : "qbd-tab"}
          onClick={() => setMediaTab("link")}
        >
          Link URL
        </button>
      </div>

      <div className="qbd-tab-content">
        {mediaTab === "upload" && (
          <MediaUploadTab
            isVideo={isVideo}
            isDocument={isDocument}
            form={form}
            fileUpload={fileUpload}
          />
        )}

        {mediaTab === "link" && (
          <MediaLinkTab
            isVideo={isVideo}
            form={form}
            setField={setField}
          />
        )}
      </div>

      <MediaInfoBox isVideo={isVideo} />

      <hr style={{ margin: "24px 0" }} />
    </div>
  );
}

function MediaUploadTab({ isVideo, isDocument, form, fileUpload }) {
  return (
    <div>
      <div className="qbd-upload-box">
        <h3 className="qbd-upload-title">
          {isVideo ? "Upload Audio hoặc Video" : "Upload Tài Liệu Tham Khảo"}
        </h3>
        <p className="qbd-upload-desc">
          {isVideo
            ? "MP3, WAV, M4A (audio) hoặc MP4, WebM (video)"
            : "PDF, DOC, DOCX, TXT (tùy chọn - dùng để học viên tham khảo)"}
        </p>
        <input
          type="file"
          accept={isVideo ? "audio/*,video/*" : ".pdf,.doc,.docx,.txt"}
          onChange={
            isVideo
              ? fileUpload.handleMediaFileChange
              : fileUpload.handleDocRefFileChange
          }
          style={{ display: "none" }}
          id={isVideo ? "media-upload" : "doc-upload"}
        />
        <label
          htmlFor={isVideo ? "media-upload" : "doc-upload"}
          className="qbd-choose-file-button"
        >
          Chọn File
        </label>
        {isVideo && form?.mediaURL && (
          <p className="qbd-upload-success">File đã upload thành công</p>
        )}
        {isDocument && form?.fileURL && (
          <p className="qbd-upload-success">File đã upload thành công</p>
        )}
      </div>
      {isDocument && (
        <p className="qbd-help-text">
          File này là tài liệu tham khảo cho học viên. Học viên sẽ nộp bài
          riêng.
        </p>
      )}
    </div>
  );
}

function MediaLinkTab({ isVideo, form, setField }) {
  return (
    <div className="qbd-form-group">
      <label className="qbd-label">
        {isVideo ? "URL Media" : "URL Tài Liệu"}
      </label>
      <input
        type="url"
        placeholder={
          isVideo
            ? "https://example.com/audio-or-video"
            : "https://example.com/document.pdf"
        }
        className="qbd-input"
        value={isVideo ? form?.mediaURL || "" : form?.fileURL || ""}
        onChange={(e) =>
          setField ? setField(isVideo ? "mediaURL" : "fileURL", e.target.value) : null
        }
      />
      <p className="qbd-help-text">
        {isVideo
          ? "Nhập link trực tiếp đến file audio/video (YouTube, SoundCloud, etc.)"
          : "Nhập link đến tài liệu tham khảo (Google Docs, Dropbox, etc.)"}
      </p>
    </div>
  );
}

function MediaInfoBox({ isVideo }) {
  return (
    <div className="qbd-info-box">
      <div>
        <h4 className="qbd-info-title">
          {isVideo ? "Thông Tin Bài Tập Nghe/Xem" : "Thông Tin Bài Tập Tài Liệu"}
        </h4>
        <ul className="qbd-info-list">
          {isVideo ? (
            <>
              <li>Upload file audio hoặc video để học viên nghe/xem</li>
              <li>Học viên nghe/xem và trả lời câu hỏi liên quan</li>
              <li>Hỗ trợ nhiều định dạng phổ biến</li>
              <li>Có thể thêm câu hỏi trắc nghiệm hoặc tự luận</li>
            </>
          ) : (
            <>
              <li>Học viên nộp file PDF, DOC, DOCX hoặc TXT</li>
              <li>Dùng cho bài tập đọc hiểu và viết luận</li>
              <li>Giáo viên có thể chấm điểm và phản hồi trực tiếp</li>
              <li>Tài liệu tham khảo (nếu có) sẽ hiển thị cho học viên</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

function QuestionBuilderSection({
  curActiveTab,
  setTab,
  form,
  setField,
  questionForm,
  questionCRUD,
  qList,
  setQList,
  fileUpload,
  busy,
}) {
  return (
    <>
      <div className="qbd-tabs">
        <button
          className={curActiveTab === "upload" ? "qbd-tab-active" : "qbd-tab"}
          onClick={() => setTab("upload")}
        >
          Upload Template
        </button>
        <button
          className={curActiveTab === "manual" ? "qbd-tab-active" : "qbd-tab"}
          onClick={() => setTab("manual")}
        >
          Tạo Thủ Công
        </button>
        <button
          className={curActiveTab === "advanced" ? "qbd-tab-active" : "qbd-tab"}
          onClick={() => setTab("advanced")}
        >
          Cài Đặt Nâng Cao
        </button>
      </div>

      <div className="qbd-tab-content">
        {curActiveTab === "upload" && (
          <UploadTemplateTab
            form={form}
            qList={qList}
            fileUpload={fileUpload}
            onExcelImported={(questions) => setQList(questions)}
          />
        )}
        {curActiveTab === "manual" && (
          <ManualQuestionTab
            questionForm={questionForm}
            questionCRUD={questionCRUD}
            qList={qList}
            busy={busy}
          />
        )}
        {curActiveTab === "advanced" && (
          <AdvancedSettingsTab form={form} setField={setField} />
        )}
      </div>
    </>
  );
}
function UploadTemplateTab({ form, qList, fileUpload, onExcelImported }) {
  const [loading, setLoading] = useState(false);   // 🆕 state loading

  const handleChange = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setLoading(true);

    try {
      fileUpload.handleTemplateFileChange(e, (questions) => {
        onExcelImported(questions);
        setLoading(false);

        Swal.fire({
          icon: "success",
          title: "Import thành công!",
          confirmButtonText: "OK",
          confirmButtonColor: "#111827"
        });
      });
    } catch (err) {
      console.error(err);
      setLoading(false);

      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể đọc file Excel. Vui lòng kiểm tra lại.",
        confirmButtonColor: "#dc2626"
      });
    }
  };



  const importedCount = Array.isArray(qList) ? qList.length : 0;

  return (
    <>
      <div className="qbd-upload-box">
        <h3 className="qbd-upload-title">Upload Template Excel</h3>
        <p className="qbd-upload-desc">
          Các cột: Chủ đề, Nội dung, Mức độ, Điểm, Tùy chọn 1-4, Đáp án, Loại
          (Trắc nghiệm / Đúng,sai / Điền vào chỗ trống / Nối cặp)
        </p>

        <input
          type="file"
          accept=".xlsx,.xls"
          id="file-upload"
          onChange={handleChange}
          style={{ display: "none" }}
        />

        <label htmlFor="file-upload" className="qbd-choose-file-button">
          Chọn File Excel
        </label>

        {loading && (
          <div className="qbd-loading">
            <div className="qbd-spinner"></div>
            <span>Đang xử lý file...</span>
          </div>
        )}

        {importedCount > 0 && !loading && (
          <p className="qbd-upload-success">
            Đã đọc {importedCount} câu hỏi từ file Excel. Bạn có thể chuyển
            sang tab "Tạo Thủ Công" để chỉnh sửa từng câu hỏi nếu cần.
          </p>
        )}
      </div>


      {/* KHUNG LƯU Ý + LINK TEMPLATE */}
      <div className="qbd-info-box" style={{ marginTop: 16 }}>
        <div>
          <h4 className="qbd-info-title">Định Dạng Template:</h4>

          <ul className="qbd-info-list">
            <li>Chủ đề: Chủ đề/Lĩnh vực của câu hỏi</li>
            <li>Nội dung: Văn bản câu hỏi đầy đủ</li>
            <li>Điểm: Giá trị điểm (ví dụ: 1, 2, 5)</li>
            <li>Tùy chọn 1-4: Các lựa chọn trắc nghiệm</li>
            <li>Đáp án: Đáp án đúng (A, B, C hoặc D)</li>
          </ul>
          <p className="qbd-help-text" style={{ marginTop: 8 }}>
            Tải file template mẫu {" "}
            <a
              href="/templates/Template_question.zip"
              download="Template_question.zip"
              rel="noopener noreferrer"
            >
              tại đây
            </a>{" "}
            để xem cấu trúc chuẩn.
          </p>
        </div>
      </div>
    </>
  );
}



function ManualQuestionTab({ questionForm, questionCRUD, qList, busy }) {
  return (
    <div>
      {!questionForm.showQuestionForm && (
        <div className="qbd-create-question-header">
          <button
            onClick={questionForm.openForm}
            className="qbd-create-question-btn"
          >
            Tạo Câu Hỏi
          </button>
        </div>
      )}

      {!questionForm.showQuestionForm && qList.length === 0 && (
        <div className="qbd-empty-notice">
          <h4>Chưa có câu hỏi nào</h4>
          <p>
            Hãy nhấn nút <strong>Tạo Câu Hỏi</strong> để bắt đầu thêm câu hỏi cho bài tập.
          </p>
          <p style={{ marginTop: 6 }}>
            Hệ thống hỗ trợ nhiều loại câu hỏi như: <strong>Trắc nghiệm</strong>, <strong>Đúng/Sai</strong>,
            <strong> Điền vào chỗ trống</strong>, <strong>Ghép cặp</strong> .
          </p>
          <p style={{ marginTop: 6 }}>
            Bạn có thể tạo từng câu hỏi thủ công hoặc tải lên từ file Excel theo mẫu.
          </p>
        </div>
      )}

      {questionForm.showQuestionForm && (
        <div className="qbd-question-form-wrapper">
          <QuestionForm
            onAdd={questionCRUD.handleAddQuestion}
            onUpdate={questionCRUD.handleUpdateQuestion}
            initialData={questionForm.editData}
            busy={!!busy}
            onCancel={questionForm.closeForm}
          />
        </div>
      )}

      <QuestionList
        questions={qList}
        onDelete={questionCRUD.handleDeleteQuestion}
        onEdit={questionCRUD.handleEditQuestion}
        loading={false}
      />

      {qList.length > 0 && (
        <p className="qbd-local-hint">
          Có {qList.length} câu hỏi. Nhấn "Tiếp theo" để xem trước.
        </p>
      )}
    </div>
  );
}

function AdvancedSettingsTab({ form, setField }) {
  return (
    <div className="qbd-advanced-box">
      <div className="qbd-form-group">
        <label className="qbd-label">Hiển thị đáp án sau:</label>
        <select
          className="qbd-select"
          value={form?.showAnswersAfter || "after_submission"}
          onChange={(e) =>
            setField ? setField("showAnswersAfter", e.target.value) : null
          }
        >
          <option value="after_submission">Sau khi nộp</option>
          <option value="after_deadline">Sau deadline</option>
          <option value="never">Không hiển thị</option>
        </select>
      </div>
    </div>
  );
}