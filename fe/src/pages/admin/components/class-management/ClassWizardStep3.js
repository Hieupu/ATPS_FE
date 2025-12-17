import React from "react";
import dayjs from "dayjs";
import {
  dayOfWeekToDay,
  normalizeTimeslotId,
} from "../../../../utils/validate";
import {
  normalizeTimeString,
  formatDateForDisplay,
} from "./ClassWizard.constants";
import {
  determineSlotStatus,
  calculateAllSelectedTimeslotIds,
  calculateSessionsPerWeek,
} from "./ClassWizard.utils";
import classService from "../../../../apiServices/classService";

/**
 * ClassWizardStep3 - Component cho Step 3: Chi tiết buổi học
 */
const ClassWizardStep3 = ({
  formData,
  setFormData,
  errors,
  readonly,
  timeslots,
  daysOfWeekOptions,
  availableDaysForTimeslot,
  selectedTimeslotIds,
  setSelectedTimeslotIds,
  setReloadAvailableDays,
  alternativeStartDateSearch,
  setAlternativeStartDateSearch,
  handleSearchAlternativeStartDate,
  handleApplyAlternativeStartDate,
  handleDayToggle,
  handleTimeslotToggle,
  previewSessions,
  setPreviewSessions,
  generatePreviewSessions,
  blockedDays,
  blockedDaysError,
  hasValidSelectedSlots,
  hasDuplicateSessions,
  hasParttimeAvailabilityIssue,
  sessionsPerWeek,
  requiredSlotsPerWeek,
  instructorType,
  parttimeAvailabilityError,
  isEditMode,
  impactedSessionMessages,
  scheduleStartDate,
  allSelectedTimeslotIdsMemo,
  shouldShowPreview,
  setShouldShowPreview,
  slotAvailabilityStatus,
  loadingBlockedDays,
  hasInsufficientSlots,
  formatDateForDisplay: formatDate,
  normalizeTimeString: normalizeTime,
  normalizeTimeslotId: normalizeId,
  dayOfWeekToDay: dayToDay,
  getSlotStatus,
  dayjs: dayjsLib,
  hasScheduleCoreInfo,
  selectedTimeslotId,
  conflictDetails,
  hasSelectedSlots,
}) => {
  // State để lưu distinct time ranges từ API
  const [distinctTimeRanges, setDistinctTimeRanges] = React.useState([]);
  const [loadingTimeRanges, setLoadingTimeRanges] = React.useState(false);

  // Load distinct time ranges từ API khi component mount
  React.useEffect(() => {
    const loadDistinctTimeRanges = async () => {
      setLoadingTimeRanges(true);
      try {
        const timeRanges = await classService.getDistinctTimeRanges();
        setDistinctTimeRanges(timeRanges || []);
      } catch (error) {
        console.error("Error loading distinct time ranges:", error);

        setDistinctTimeRanges([
          { StartTime: "08:00", EndTime: "10:00" },
          { StartTime: "10:20", EndTime: "12:20" },
          { StartTime: "13:00", EndTime: "15:00" },
          { StartTime: "15:20", EndTime: "17:20" },
          { StartTime: "18:00", EndTime: "20:00" },
          { StartTime: "20:00", EndTime: "22:00" },
        ]);
      } finally {
        setLoadingTimeRanges(false);
      }
    };
    loadDistinctTimeRanges();
  }, []);

  // Tính toán số buổi/tuần từ TimeslotsByDay và DaysOfWeek - Dùng utility function
  const calculatedSessionsPerWeek = React.useMemo(() => {
    const total = calculateSessionsPerWeek(
      formData.scheduleDetail.DaysOfWeek,
      formData.scheduleDetail.TimeslotsByDay
    );

    // Nếu chưa có TimeslotsByDay, tính từ selectedTimeslotIds và DaysOfWeek
    if (
      total === 0 &&
      selectedTimeslotIds.size > 0 &&
      (formData.scheduleDetail.DaysOfWeek || []).length > 0
    ) {
      return (
        selectedTimeslotIds.size * formData.scheduleDetail.DaysOfWeek.length
      );
    }

    return total;
  }, [
    formData.scheduleDetail.DaysOfWeek,
    formData.scheduleDetail.TimeslotsByDay,
    selectedTimeslotIds,
  ]);

  // Lấy tất cả các timeslot ID đã chọn - Dùng utility function
  const allSelectedTimeslotIds = React.useMemo(
    () =>
      calculateAllSelectedTimeslotIds(
        selectedTimeslotIds,
        formData.scheduleDetail.TimeslotsByDay
      ),
    [selectedTimeslotIds, formData.scheduleDetail.TimeslotsByDay]
  );

  // Tìm timeslot matching với selectedTimeslotId
  const matchingTimeslot = React.useMemo(() => {
    if (!selectedTimeslotId) return null;
    return timeslots.find(
      (t) =>
        normalizeId(t.TimeslotID || t.id) === normalizeId(selectedTimeslotId)
    );
  }, [selectedTimeslotId, timeslots, normalizeId]);

  // Tạo danh sách timeslots với label từ distinct time ranges (API)
  // ✅ Đơn giản hóa: Chỉ dùng dữ liệu từ getDistinctTimeRanges, không cần tìm trong timeslots array
  const timeSlotOptions = React.useMemo(() => {
    // Nếu chưa có dữ liệu từ API, trả về mảng rỗng
    if (!distinctTimeRanges || distinctTimeRanges.length === 0) {
      return [];
    }

    // Format time helper
    const formatTime = (time) => {
      if (!time) return "";
      // Nếu time có format "HH:mm:ss", chỉ lấy "HH:mm"
      return time.substring(0, 5);
    };

    // Chuyển đổi từ API response sang format cần thiết
    return distinctTimeRanges.map((range) => {
      const start = range.StartTime || range.startTime || "";
      const end = range.EndTime || range.endTime || "";

      const formattedStart = formatTime(start);
      const formattedEnd = formatTime(end);
      const label = `${formattedStart} - ${formattedEnd}`;

      // Tạo timeslotId dựa trên StartTime-EndTime (format: "08:00-10:00")
      // TimeslotId này sẽ được dùng để match với timeslots trong DB khi cần
      const timeslotId = `${formattedStart}-${formattedEnd}`;

      return {
        start: formattedStart,
        end: formattedEnd,
        label,
        timeslotId: timeslotId,
        timeslot: null,
      };
    });
  }, [distinctTimeRanges]);

  // Tính toán các ca học bị LOCKED dựa trên getTimeslotLockReasons API
  // ✅ Chỉ dùng getTimeslotLockReasons từ backend
  const [lockedTimeslotIds, setLockedTimeslotIds] = React.useState(new Set());
  const [loadingLockedTimeslots, setLoadingLockedTimeslots] =
    React.useState(false);

  React.useEffect(() => {
    const checkLockedTimeslots = async () => {
      if (
        !scheduleStartDate ||
        !formData.scheduleDetail.EnddatePlan ||
        !formData.InstructorID ||
        !formData.schedule?.Numofsession ||
        !timeSlotOptions ||
        timeSlotOptions.length === 0
      ) {
        setLockedTimeslotIds(new Set());
        return;
      }

      // ✅ Chỉ check các ngày đã được chọn trong DaysOfWeek
      const daysToCheck = formData.scheduleDetail.DaysOfWeek || [];

      if (daysToCheck.length === 0) {
        setLockedTimeslotIds(new Set());
        return;
      }

      setLoadingLockedTimeslots(true);
      const locked = new Set();

      try {
        // Duyệt qua các ngày đã chọn và kiểm tra từng ca học
        for (const dayOfWeek of daysToCheck) {
          for (const slot of timeSlotOptions) {
            if (!slot.timeslotId) continue;

            // ✅ Tìm timeslot thực từ DB dựa trên StartTime-EndTime
            // timeslotId có thể là string "08:00-10:00" hoặc TimeslotID số
            let actualTimeslotId = slot.timeslotId;

            // Nếu timeslotId là string format "HH:mm-HH:mm", tìm timeslot thực
            if (
              typeof slot.timeslotId === "string" &&
              slot.timeslotId.includes("-")
            ) {
              const [startTime, endTime] = slot.timeslotId.split("-");
              const foundTimeslot = timeslots.find((t) => {
                const tStart = normalizeTime(t.StartTime || t.startTime || "");
                const tEnd = normalizeTime(t.EndTime || t.endTime || "");
                return tStart === startTime && tEnd === endTime;
              });

              if (foundTimeslot) {
                actualTimeslotId = foundTimeslot.TimeslotID || foundTimeslot.id;
              }
            }

            // Chỉ check nếu có actualTimeslotId hợp lệ (số)
            if (!actualTimeslotId || isNaN(Number(actualTimeslotId))) {
              continue;
            }

            try {
              // ✅ Gọi API getTimeslotLockReasons
              const result = await classService.getTimeslotLockReasons({
                InstructorID: formData.InstructorID,
                dayOfWeek,
                timeslotId: Number(actualTimeslotId),
                startDate: scheduleStartDate,
                endDatePlan: formData.scheduleDetail.EnddatePlan,
                numofsession: parseInt(formData.schedule.Numofsession) || 0,
              });

              // Nếu isLocked = true, chỉ lock khi lý do không phải HOLIDAY/insufficient_slots
              if (result && result.isLocked) {
                const reasons = Array.isArray(result.reasons)
                  ? result.reasons
                  : [];
                const hasHoliday = reasons.some((r) => r.type === "HOLIDAY");
                const hasInsufficient = reasons.some(
                  (r) => r.type === "insufficient_slots"
                );

                if (!hasHoliday && !hasInsufficient) {
                  locked.add(slot.timeslotId);
                }
              }
            } catch (error) {
              // Nếu có lỗi, không disable (fallback)
              console.warn("Error checking timeslot lock reasons:", error);
            }
          }
        }
      } finally {
        setLockedTimeslotIds(locked);
        setLoadingLockedTimeslots(false);
      }
    };

    checkLockedTimeslots();
  }, [
    scheduleStartDate,
    formData.scheduleDetail.EnddatePlan,
    formData.InstructorID,
    formData.schedule?.Numofsession,
    formData.scheduleDetail.DaysOfWeek,
    timeSlotOptions,
    timeslots,
    normalizeTime,
  ]);

  // Kiểm tra xem timeslot có được chọn không
  const isTimeslotSelected = (timeslotId) => {
    if (!timeslotId) return false;
    const normalizedId = normalizeId(timeslotId);
    return allSelectedTimeslotIds.has(normalizedId);
  };

  // Xử lý click timeslot
  const handleTimeslotClick = (clickedTimeslotId) => {
    if (readonly || !clickedTimeslotId) return;

    const normalizedId = normalizeId(clickedTimeslotId);

    const isSelected = allSelectedTimeslotIds.has(normalizedId);

    if (isSelected) {
      // Bỏ chọn: xóa khỏi selectedTimeslotIds và TimeslotsByDay
      // Cho phép chọn lại ngày học (xóa DaysOfWeek nếu không còn ca nào)
      setSelectedTimeslotIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(normalizedId);
        return newSet;
      });

      // ✅ Trigger reload availableDaysForTimeslot
      if (setReloadAvailableDays) {
        setReloadAvailableDays((prev) => prev + 1);
      }

      setFormData((prev) => {
        const newTimeslotsByDay = { ...prev.scheduleDetail.TimeslotsByDay };
        const remainingDays = new Set();

        Object.keys(newTimeslotsByDay).forEach((day) => {
          newTimeslotsByDay[day] = newTimeslotsByDay[day].filter(
            (id) => normalizeId(id) !== normalizedId
          );
          // Nếu ngày này vẫn còn timeslot, giữ lại
          if (newTimeslotsByDay[day].length > 0) {
            remainingDays.add(parseInt(day, 10));
          } else {
            // Xóa ngày nếu không còn timeslot nào
            delete newTimeslotsByDay[day];
          }
        });

        // ✅ Đơn giản: Chỉ filter DaysOfWeek dựa trên remainingDays
        const newDaysOfWeek = (prev.scheduleDetail.DaysOfWeek || []).filter(
          (day) => remainingDays.has(day)
        );

        return {
          ...prev,
          scheduleDetail: {
            ...prev.scheduleDetail,
            TimeslotsByDay: newTimeslotsByDay,
            DaysOfWeek: newDaysOfWeek, // Cho phép chọn lại ngày học
          },
        };
      });
    } else {
      // Chọn: thêm vào selectedTimeslotIds và TimeslotsByDay cho các ngày đã chọn
      setSelectedTimeslotIds((prev) => new Set(prev).add(normalizedId));

      // ✅ Trigger reload availableDaysForTimeslot
      if (setReloadAvailableDays) {
        setReloadAvailableDays((prev) => prev + 1);
      }

      setFormData((prev) => {
        const newDaysOfWeek = prev.scheduleDetail.DaysOfWeek || [];
        const newTimeslotsByDay = { ...prev.scheduleDetail.TimeslotsByDay };

        // Nếu chưa chọn ngày nào, không tự động thêm vào TimeslotsByDay
        // Chỉ thêm vào selectedTimeslotIds để user có thể chọn ngày sau
        if (newDaysOfWeek.length > 0) {
          newDaysOfWeek.forEach((day) => {
            if (!newTimeslotsByDay[day]) {
              newTimeslotsByDay[day] = [];
            }
            if (!newTimeslotsByDay[day].includes(normalizedId)) {
              newTimeslotsByDay[day].push(normalizedId);
            }
          });
        }

        return {
          ...prev,
          scheduleDetail: {
            ...prev.scheduleDetail,
            TimeslotsByDay: newTimeslotsByDay,
          },
        };
      });
    }
  };

  const handleDayClick = (dayValue) => {
    if (readonly) return;

    const isCurrentlySelected =
      formData.scheduleDetail.DaysOfWeek.includes(dayValue);

    // Gọi handleDayToggle từ props
    if (handleDayToggle) {
      handleDayToggle(dayValue);
    }

    if (!isCurrentlySelected) {
      // Thêm tất cả các ca đã chọn vào ngày mới
      setFormData((prev) => {
        const newTimeslotsByDay = { ...prev.scheduleDetail.TimeslotsByDay };
        if (!newTimeslotsByDay[dayValue]) {
          newTimeslotsByDay[dayValue] = [];
        }

        // Thêm tất cả các ca đã chọn vào ngày mới
        Array.from(allSelectedTimeslotIds).forEach((timeslotId) => {
          const normalizedId = normalizeId(timeslotId);
          if (!newTimeslotsByDay[dayValue].includes(normalizedId)) {
            newTimeslotsByDay[dayValue].push(normalizedId);
          }
        });

        return {
          ...prev,
          scheduleDetail: {
            ...prev.scheduleDetail,
            TimeslotsByDay: newTimeslotsByDay,
          },
        };
      });
    }
  };

  // Xử lý nút "Tạo buổi"
  const handleGeneratePreview = () => {
    if (readonly) return;
    generatePreviewSessions();
    setShouldShowPreview(true);
  };

  const numOfSessions =
    parseInt(formData.schedule?.Numofsession || "0", 10) || 0;
  const isExceeding =
    numOfSessions > 0 && calculatedSessionsPerWeek > numOfSessions;

  return (
    <div className="wizard-step-content">
      <div className="schedule-section">
        {/* Ngày bắt đầu */}
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label htmlFor="scheduleDetailOpendatePlan">
            Ngày dự kiến bắt đầu <span className="required">*</span>
          </label>
          <input
            type="date"
            id="scheduleDetailOpendatePlan"
            value={scheduleStartDate || ""}
            onChange={(e) => {
              const dateValue = e.target.value;
              setFormData((prev) => ({
                ...prev,
                schedule: {
                  ...prev.schedule,
                  OpendatePlan: dateValue,
                },
                scheduleDetail: {
                  ...prev.scheduleDetail,
                  OpendatePlan: dateValue,
                },
              }));
            }}
            min={dayjsLib().add(1, "day").format("YYYY-MM-DD")}
            className={errors.scheduleDetailOpendatePlan ? "error" : ""}
            disabled={readonly}
            readOnly={readonly}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
          {errors.scheduleDetailOpendatePlan && (
            <span className="error-message">
              {errors.scheduleDetailOpendatePlan}
            </span>
          )}
          {/* Button để kích hoạt tính năng tìm ngày bắt đầu khác */}
          {!readonly && (
            <div style={{ marginTop: "12px" }}>
              <button
                type="button"
                onClick={handleSearchAlternativeStartDate}
                disabled={!hasScheduleCoreInfo}
                style={{
                  padding: "10px 16px",
                  backgroundColor: alternativeStartDateSearch.showResults
                    ? "#2563eb"
                    : "#f3f4f6",
                  color: alternativeStartDateSearch.showResults
                    ? "#fff"
                    : "#1e293b",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  cursor: hasScheduleCoreInfo ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  fontWeight: 500,
                  opacity: hasScheduleCoreInfo ? 1 : 0.5,
                  transition: "all 0.2s",
                }}
              >
                {alternativeStartDateSearch.showResults
                  ? "🔍 Đang ở chế độ tìm kiếm"
                  : "🔍 Tìm ngày bắt đầu khác"}
              </button>
              {alternativeStartDateSearch.showResults && (
                <button
                  type="button"
                  onClick={() => {
                    // Khi thoát chế độ tìm kiếm, cho phép chọn lại ca và ngày học
                    // Chỉ giữ lại khi đã áp dụng gợi ý (đã thay đổi ngày bắt đầu)
                    setAlternativeStartDateSearch({
                      ...alternativeStartDateSearch,
                      showResults: false,
                      suggestions: [],
                      error: null,
                    });

                    // Reset ca học và ngày học để cho phép chọn lại
                    // (chỉ reset nếu chưa áp dụng gợi ý)
                    if (!alternativeStartDateSearch.applied) {
                      setSelectedTimeslotIds(new Set());
                      setFormData((prev) => ({
                        ...prev,
                        scheduleDetail: {
                          ...prev.scheduleDetail,
                          DaysOfWeek: [],
                          TimeslotsByDay: {},
                        },
                      }));
                    }
                  }}
                  style={{
                    marginLeft: "8px",
                    padding: "10px 16px",
                    backgroundColor: "#f3f4f6",
                    color: "#1e293b",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Thoát chế độ tìm kiếm
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tính năng tìm ngày bắt đầu khác */}
        {alternativeStartDateSearch.showResults && (
          <div
            style={{
              marginBottom: "20px",
              padding: "16px",
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "12px" }}>
              🔍 Chế độ tìm kiếm ngày bắt đầu
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "12px",
              }}
            >
              Bạn có thể chọn các ca học mong muốn (kể cả ô đang bị khóa) và tìm
              ngày bắt đầu phù hợp.
            </div>

            {/* Button để tìm kiếm khi đã chọn ca và ngày */}
            {(() => {
              const hasSelectedTimeslots = allSelectedTimeslotIds.size > 0;
              const hasSelectedDays =
                formData.scheduleDetail.DaysOfWeek.length > 0;
              const canSearch = hasSelectedTimeslots && hasSelectedDays;

              return (
                <div style={{ marginBottom: "12px" }}>
                  <button
                    type="button"
                    onClick={handleSearchAlternativeStartDate}
                    disabled={!canSearch || alternativeStartDateSearch.loading}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: canSearch ? "#2563eb" : "#9ca3af",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: canSearch ? "pointer" : "not-allowed",
                      fontSize: "14px",
                      fontWeight: 600,
                      opacity: canSearch ? 1 : 0.5,
                    }}
                  >
                    {alternativeStartDateSearch.loading
                      ? "Đang tìm kiếm..."
                      : "Tìm ngày phù hợp"}
                  </button>
                </div>
              );
            })()}

            {/* Hiển thị kết quả tìm kiếm */}
            {alternativeStartDateSearch.loading ? (
              <div style={{ padding: "12px", textAlign: "center" }}>
                Đang tìm kiếm ngày bắt đầu phù hợp...
              </div>
            ) : alternativeStartDateSearch.error ? (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  color: "#dc2626",
                  fontSize: "14px",
                }}
              >
                {alternativeStartDateSearch.error}
              </div>
            ) : alternativeStartDateSearch.suggestions?.length > 0 ? (
              <div>
                <div
                  style={{
                    marginBottom: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1e293b",
                  }}
                >
                  Tìm thấy {alternativeStartDateSearch.suggestions.length} gợi
                  ý:
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  {alternativeStartDateSearch.suggestions.map(
                    (suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          handleApplyAlternativeStartDate(suggestion.date)
                        }
                        style={{
                          padding: "10px 16px",
                          backgroundColor: "#16a34a",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: 500,
                        }}
                      >
                        {formatDate(suggestion.date)}
                        {suggestion.reason && ` - ${suggestion.reason}`}
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Chọn ca học */}
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label>
            Chọn ca học <span className="required">*</span>
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            {timeSlotOptions.map((timeSlot) => {
              const isSelected = isTimeslotSelected(timeSlot.timeslotId);
              const isLocked = lockedTimeslotIds.has(timeSlot.timeslotId);
              const isDisabled = readonly || isLocked;

              return (
                <button
                  key={timeSlot.label}
                  type="button"
                  onClick={() => handleTimeslotClick(timeSlot.timeslotId)}
                  disabled={isDisabled}
                  style={{
                    padding: "16px",
                    border: `2px solid ${
                      isSelected ? "#667eea" : isLocked ? "#fca5a5" : "#e2e8f0"
                    }`,
                    borderRadius: "8px",
                    backgroundColor: isSelected
                      ? "#667eea"
                      : isLocked
                      ? "#fee2e2"
                      : "#fff",
                    color: isSelected
                      ? "#fff"
                      : isLocked
                      ? "#991b1b"
                      : "#1e293b",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                  title={
                    isLocked ? "Ca học này bị khóa do giảng viên đã bận" : ""
                  }
                >
                  {timeSlot.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chọn ngày học trong tuần */}
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label>
            Ngày học trong tuần <span className="required">*</span>
          </label>
          <div className="days-selector">
            {daysOfWeekOptions.map((day) => {
              const hasSelectedTimeslots = allSelectedTimeslotIds.size > 0;
              const isInSearchMode = alternativeStartDateSearch.showResults;
              const isSelected = formData.scheduleDetail.DaysOfWeek.includes(
                day.value
              );

              // Logic enable/disable:
              // 1. readonly → luôn disable
              // 2. search mode → enable tất cả (cho phép tìm ngày dù là HOLIDAY, sẽ auto bù ở preview)
              // 3. chưa chọn ca học → disable
              // 4. đã chọn ca:
              //    - ngày đã chọn → luôn enable (cho phép bỏ chọn)
              //    - ngày chưa chọn:
              //        + nếu không có availableDaysForTimeslot → disable (không còn fallback enable-all)
              //        + nếu có availableDaysForTimeslot → chỉ enable nếu day nằm trong danh sách
              let isDisabled = false;
              if (readonly) {
                isDisabled = true;
              } else if (isInSearchMode) {
                isDisabled = false;
              } else if (!hasSelectedTimeslots) {
                isDisabled = true;
              } else if (isSelected) {
                isDisabled = false;
              } else {
                if (availableDaysForTimeslot.length === 0) {
                  // Không có ngày khả dụng cho các ca đã chọn → không cho chọn thêm ngày mới
                  isDisabled = true;
                } else {
                  isDisabled = !availableDaysForTimeslot.includes(day.value);
                }
              }

              return (
                <button
                  key={day.value}
                  type="button"
                  className={`day-button ${isSelected ? "selected" : ""}`}
                  onClick={() => handleDayClick(day.value)}
                  disabled={isDisabled}
                  style={{
                    opacity: isDisabled ? 0.5 : 1,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                  }}
                  title={
                    isDisabled && hasSelectedTimeslots && !isSelected
                      ? "Ngày này không khả dụng cho các ca đã chọn"
                      : isDisabled && !hasSelectedTimeslots
                      ? "Vui lòng chọn ca học trước"
                      : ""
                  }
                >
                  {day.label}
                </button>
              );
            })}
          </div>
          {errors.DaysOfWeek && (
            <span className="error-message">{errors.DaysOfWeek}</span>
          )}
          {/* Hiển thị thông báo khi không có ngày khả dụng */}
          {allSelectedTimeslotIds.size > 0 &&
            !alternativeStartDateSearch.showResults &&
            availableDaysForTimeslot.length === 0 &&
            scheduleStartDate && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "8px 12px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: "6px",
                  fontSize: "13px",
                  color: "#991b1b",
                }}
              >
                Không có ngày nào khả dụng cho các ca học đã chọn. Vui lòng:
                <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
                  <li>Chọn ca học khác</li>
                  <li>Hoặc thay đổi ngày bắt đầu</li>
                  <li>Hoặc bật chế độ tìm kiếm để tìm ngày phù hợp</li>
                </ul>
              </div>
            )}

          {/* Hiển thị số buổi/tuần */}
          {calculatedSessionsPerWeek > 0 && (
            <div
              style={{
                marginTop: "12px",
                padding: "10px 12px",
                backgroundColor: isExceeding ? "#fef2f2" : "#f0f9ff",
                border: `1px solid ${isExceeding ? "#fca5a5" : "#7dd3fc"}`,
                borderRadius: "6px",
                fontSize: "13px",
                color: isExceeding ? "#991b1b" : "#0c4a6e",
              }}
            >
              <strong>Số buổi học/tuần:</strong> {calculatedSessionsPerWeek}{" "}
              buổi
              {numOfSessions > 0 && (
                <>
                  {" / "}
                  <strong>Tổng số buổi của lớp:</strong> {numOfSessions} buổi
                </>
              )}
              {isExceeding && (
                <div
                  style={{
                    marginTop: "6px",
                    color: "#991b1b",
                    fontWeight: 500,
                  }}
                >
                  ⚠️ Số buổi học/tuần ({calculatedSessionsPerWeek}) không được
                  lớn hơn tổng số buổi của lớp ({numOfSessions}). Vui lòng giảm
                  số ca học hoặc số ngày học.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nút Tính toán */}
        {(() => {
          const hasSelectedTimeslots = allSelectedTimeslotIds.size > 0;
          const hasSelectedDays = formData.scheduleDetail.DaysOfWeek.length > 0;
          const hasStartDate = Boolean(scheduleStartDate);
          const isInSearchMode = alternativeStartDateSearch.showResults;
          const canCalculate =
            !isInSearchMode &&
            hasSelectedTimeslots &&
            hasSelectedDays &&
            hasStartDate;

          return (
            <div
              style={{
                marginTop: "20px",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                onClick={handleGeneratePreview}
                disabled={!canCalculate || readonly}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#fff",
                  backgroundColor: canCalculate ? "#667eea" : "#9ca3af",
                  border: "none",
                  borderRadius: "8px",
                  cursor: canCalculate ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  boxShadow: canCalculate
                    ? "0 4px 6px rgba(102, 126, 234, 0.3)"
                    : "none",
                }}
              >
                {shouldShowPreview ? "Tạo buổi lại" : "Tạo buổi"}
              </button>
            </div>
          );
        })()}

        {/* Hiển thị loading */}
        {(slotAvailabilityStatus.checking || loadingBlockedDays) && (
          <div
            style={{
              margin: "12px 0",
              padding: "12px 16px",
              borderRadius: "8px",
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#1d4ed8",
              fontSize: "13px",
            }}
          >
            Hệ thống đang phân tích lịch bận của giảng viên để kiểm tra các ca
            học khả dụng...
          </div>
        )}

        {/* Hiển thị error */}
        {blockedDaysError && (
          <div
            style={{
              margin: "8px 0",
              padding: "10px 14px",
              borderRadius: "6px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "13px",
            }}
          >
            {blockedDaysError}
          </div>
        )}

        {/* Cảnh báo thiếu slot */}
        {hasInsufficientSlots && !alternativeStartDateSearch.showResults && (
          <div
            style={{
              margin: "12px 0",
              padding: "12px 16px",
              borderRadius: "8px",
              backgroundColor: "#fff7ed",
              border: "1px solid #fdba74",
              color: "#9a3412",
              fontSize: "13px",
            }}
          >
            Hệ thống phát hiện chỉ còn{" "}
            <strong>{slotAvailabilityStatus.availableSlots}</strong> ca có thể
            chọn trong khung thời gian này, cần tối thiểu{" "}
            <strong>{slotAvailabilityStatus.requiredSlots}</strong> ca. Vui lòng
            ưu tiên những ô còn trắng, các ô bị khóa đã vượt giảng viên đã bận ở
            ca này.
          </div>
        )}

        {/* Hiển thị error khi có buổi trùng */}
        {hasDuplicateSessions && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fca5a5",
              fontSize: "13px",
              color: "#991b1b",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⚠️</span>
              <span>
                <strong>Có buổi học trùng lịch</strong>
              </span>
            </div>
            {conflictDetails && conflictDetails.length > 0 && (
              <div style={{ marginTop: "8px", fontSize: "12px" }}>
                Có {conflictDetails.length} buổi trùng lịch. Vui lòng chọn lại
                các ca học để tránh trùng.
              </div>
            )}
          </div>
        )}

        {/* Preview sessions */}
        {shouldShowPreview && previewSessions.length > 0 && (
          <div className="form-group" style={{ marginTop: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "12px",
                fontWeight: 600,
              }}
            >
              Xem trước lịch học
            </label>
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#fff",
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  marginBottom: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Tổng: {previewSessions.length} buổi
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {previewSessions.map((session) => {
                  const isExtended = session.type === "EXTENDED";
                  const dateStr = session.date.toLocaleDateString("vi-VN");

                  return (
                    <div
                      key={session.number}
                      style={{
                        padding: "12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        backgroundColor: isExtended ? "#e8f5e9" : "#f8f9fa",
                        border: `1px solid ${
                          isExtended ? "#66bb6a" : "#e2e8f0"
                        }`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "16px", fontWeight: 600 }}>
                          {isExtended ? "🟢" : "⚪"}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              textDecoration: "none",
                              color: "#1e293b",
                            }}
                          >
                            Buổi {session.number}:{" "}
                            {
                              daysOfWeekOptions.find(
                                (d) => d.value === session.dayOfWeek
                              )?.label
                            }{" "}
                            {dateStr}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              marginTop: "4px",
                            }}
                          >
                            {session.timeslot.StartTime ||
                              session.timeslot.startTime}{" "}
                            -{" "}
                            {session.timeslot.EndTime ||
                              session.timeslot.endTime}
                            {isExtended && (
                              <span
                                style={{
                                  marginLeft: "8px",
                                  color: "#2e7d32",
                                  fontWeight: 500,
                                }}
                              >
                                - Thêm lại ca học
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Error messages */}
        {errors.preview && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fca5a5",
              fontSize: "13px",
              color: "#991b1b",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⚠️</span>
              <span>{errors.preview}</span>
            </div>
          </div>
        )}

        {hasParttimeAvailabilityIssue && parttimeAvailabilityError && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fca5a5",
              fontSize: "13px",
              color: "#991b1b",
            }}
          >
            {parttimeAvailabilityError}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassWizardStep3;
