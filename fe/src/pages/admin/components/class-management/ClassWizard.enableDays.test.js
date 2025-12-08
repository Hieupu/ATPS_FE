/**
 * Test file để kiểm tra logic enable/disable ngày học trong tuần
 * Chạy: npm test -- ClassWizard.enableDays.test.js
 */

/**
 * Tính toán các ngày học hợp lệ dựa trên các ca học đã chọn
 * @param {Object} params
 * @param {Set<number>} params.selectedTimeslotIds - Set các TimeslotID đã chọn
 * @param {Object} params.timeslots - Mảng các timeslot từ DB
 * @param {Array<number>} params.selectedDays - Mảng các ngày đã chọn (DaysOfWeek)
 * @param {string} params.startDate - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} params.endDate - Ngày kết thúc (YYYY-MM-DD)
 * @param {string} params.instructorType - Loại giảng viên: "fulltime" | "parttime"
 * @param {Set<string>} params.parttimeAvailableSlotKeySet - Set các slot key cho parttime (format: "dayOfWeek-timeslotId")
 * @param {Function} params.getSlotStatus - Hàm check conflict
 * @param {Function} params.dayOfWeekToDay - Hàm convert dayOfWeek sang Day format (1 -> "T2", 2 -> "T3", ...)
 * @param {Function} params.normalizeTimeString - Hàm normalize time string
 * @param {Function} params.normalizeTimeslotId - Hàm normalize timeslot ID
 * @returns {Array<number>} Mảng các ngày học hợp lệ (dayOfWeek: 1-6)
 */
function calculateAvailableDaysForTimeslot({
  selectedTimeslotIds,
  timeslots,
  selectedDays,
  startDate,
  endDate,
  instructorType,
  parttimeAvailableSlotKeySet,
  getSlotStatus,
  dayOfWeekToDay,
  normalizeTimeString,
  normalizeTimeslotId,
}) {
  const availableDays = [];

  // Duyệt qua các ngày trong tuần (T2-T7, bỏ chủ nhật)
  [1, 2, 3, 4, 5, 6].forEach((dayOfWeek) => {
    // Nếu ngày này đã được chọn, luôn enable (không check conflict)
    if (selectedDays.includes(dayOfWeek)) {
      availableDays.push(dayOfWeek);
      return;
    }

    const dayFormat = dayOfWeekToDay(dayOfWeek);

    // Kiểm tra xem có ít nhất 1 ca đã chọn hợp lệ với ngày này không
    let hasValidSlot = false;

    // Duyệt qua tất cả các ca đã chọn
    Array.from(selectedTimeslotIds).forEach((selectedTimeslotId) => {
      if (hasValidSlot) return; // Đã tìm thấy 1 ca hợp lệ, không cần check tiếp

      // Tìm timeslot trong DB
      const selectedTimeslot = timeslots.find(
        (t) =>
          normalizeTimeslotId(t.TimeslotID || t.id) ===
          normalizeTimeslotId(selectedTimeslotId)
      );

      if (!selectedTimeslot) return;

      const selectedStartTime = normalizeTimeString(
        selectedTimeslot.StartTime || selectedTimeslot.startTime || ""
      );
      const selectedEndTime = normalizeTimeString(
        selectedTimeslot.EndTime || selectedTimeslot.endTime || ""
      );

      // Tìm timeslot cho ngày này có cùng StartTime-EndTime
      // Ưu tiên tìm timeslot có Day khớp với ngày đó
      let dayTimeslot = timeslots.find((t) => {
        const startTime = normalizeTimeString(t.StartTime || t.startTime || "");
        const endTime = normalizeTimeString(t.EndTime || t.endTime || "");
        const timeslotDay = t.Day || t.day;
        return (
          startTime === selectedStartTime &&
          endTime === selectedEndTime &&
          timeslotDay === dayFormat
        );
      });

      // Nếu không tìm thấy timeslot có Day khớp, tìm timeslot không có Day
      if (!dayTimeslot) {
        dayTimeslot = timeslots.find((t) => {
          const startTime = normalizeTimeString(
            t.StartTime || t.startTime || ""
          );
          const endTime = normalizeTimeString(t.EndTime || t.endTime || "");
          const timeslotDay = t.Day || t.day;
          return (
            startTime === selectedStartTime &&
            endTime === selectedEndTime &&
            !timeslotDay
          );
        });
      }

      if (!dayTimeslot) return; // Ngày này không có timeslot cùng StartTime-EndTime

      const timeslotId = dayTimeslot.TimeslotID || dayTimeslot.id;

      // Logic: Fulltime mặc định rảnh T2-T7 (1-6), chỉ check conflict
      if (instructorType === "fulltime") {
        const slotStatus = getSlotStatus({
          dayOfWeek,
          timeslotId,
          startDate,
          endDate,
        });

        if (slotStatus.status !== "LOCKED") {
          hasValidSlot = true;
        }
      } else if (instructorType === "parttime") {
        // Parttime: phải có trong instructortimeslot với status AVAILABLE
        const slotKey = `${dayOfWeek}-${normalizeTimeslotId(timeslotId)}`;
        const hasAvailableSlot =
          parttimeAvailableSlotKeySet &&
          typeof parttimeAvailableSlotKeySet.has === "function" &&
          parttimeAvailableSlotKeySet.size > 0 &&
          parttimeAvailableSlotKeySet.has(slotKey);

        if (!hasAvailableSlot) return; // Parttime chưa đăng ký ca này → không rảnh

        // Nếu có AVAILABLE, tiếp tục check conflict (session, HOLIDAY)
        const slotStatus = getSlotStatus({
          dayOfWeek,
          timeslotId,
          startDate,
          endDate,
        });

        if (slotStatus.status !== "LOCKED") {
          hasValidSlot = true;
        }
      } else {
        // Chưa chọn instructor hoặc type chưa xác định → hợp lệ
        hasValidSlot = true;
      }
    });

    // Nếu có ít nhất 1 ca hợp lệ, thêm ngày vào danh sách
    if (hasValidSlot) {
      availableDays.push(dayOfWeek);
    }
  });

  return availableDays;
}

describe("calculateAvailableDaysForTimeslot", () => {
  // Mock functions
  const dayOfWeekToDay = (dayOfWeek) => {
    const days = { 1: "T2", 2: "T3", 3: "T4", 4: "T5", 5: "T6", 6: "T7" };
    return days[dayOfWeek] || "";
  };

  const normalizeTimeString = (time) => {
    if (!time) return "";
    return String(time).trim().toUpperCase();
  };

  const normalizeTimeslotId = (id) => {
    if (id === null || id === undefined) return null;
    return parseInt(String(id), 10);
  };

  const getSlotStatus = jest.fn(
    ({ dayOfWeek, timeslotId, startDate, endDate }) => {
      // Mock: trả về AVAILABLE cho tất cả
      return { status: "AVAILABLE", reason: "", reasonSource: "available" };
    }
  );

  const mockTimeslots = [
    {
      TimeslotID: 1,
      StartTime: "08:00:00",
      EndTime: "10:00:00",
      Day: "T2",
    },
    {
      TimeslotID: 2,
      StartTime: "08:00:00",
      EndTime: "10:00:00",
      Day: "T3",
    },
    {
      TimeslotID: 3,
      StartTime: "10:00:00",
      EndTime: "12:00:00",
      Day: null, // Timeslot không có Day, có thể dùng cho mọi ngày
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset getSlotStatus về giá trị mặc định (AVAILABLE)
    getSlotStatus.mockReturnValue({
      status: "AVAILABLE",
      reason: "",
      reasonSource: "available",
    });
  });

  it("should return empty array when no timeslots selected", () => {
    const result = calculateAvailableDaysForTimeslot({
      selectedTimeslotIds: new Set(),
      timeslots: mockTimeslots,
      selectedDays: [],
      startDate: "2025-01-06",
      endDate: "2025-02-28",
      instructorType: "fulltime",
      parttimeAvailableSlotKeySet: new Set(),
      getSlotStatus,
      dayOfWeekToDay,
      normalizeTimeString,
      normalizeTimeslotId,
    });

    expect(result).toEqual([]);
  });

  it("should enable days that have matching timeslots (fulltime)", () => {
    const result = calculateAvailableDaysForTimeslot({
      selectedTimeslotIds: new Set([1]), // TimeslotID 1 (T2, 08:00-10:00)
      timeslots: mockTimeslots,
      selectedDays: [],
      startDate: "2025-01-06",
      endDate: "2025-02-28",
      instructorType: "fulltime",
      parttimeAvailableSlotKeySet: new Set(),
      getSlotStatus,
      dayOfWeekToDay,
      normalizeTimeString,
      normalizeTimeslotId,
    });

    // Chỉ T2 (dayOfWeek = 1) nên được enable
    expect(result).toContain(1);
    expect(result.length).toBe(1);
  });

  it("should enable multiple days when timeslot has no Day (can be used for all days)", () => {
    const result = calculateAvailableDaysForTimeslot({
      selectedTimeslotIds: new Set([3]), // TimeslotID 3 (no Day, 10:00-12:00)
      timeslots: mockTimeslots,
      selectedDays: [],
      startDate: "2025-01-06",
      endDate: "2025-02-28",
      instructorType: "fulltime",
      parttimeAvailableSlotKeySet: new Set(),
      getSlotStatus,
      dayOfWeekToDay,
      normalizeTimeString,
      normalizeTimeslotId,
    });

    // Timeslot không có Day nên có thể dùng cho tất cả các ngày (nếu không bị conflict)
    expect(result.length).toBeGreaterThan(0);
  });

  it("should always enable selected days (even if no matching timeslot)", () => {
    const result = calculateAvailableDaysForTimeslot({
      selectedTimeslotIds: new Set([1]), // TimeslotID 1 (T2)
      timeslots: mockTimeslots,
      selectedDays: [3, 4], // Đã chọn T4, T5
      startDate: "2025-01-06",
      endDate: "2025-02-28",
      instructorType: "fulltime",
      parttimeAvailableSlotKeySet: new Set(),
      getSlotStatus,
      dayOfWeekToDay,
      normalizeTimeString,
      normalizeTimeslotId,
    });

    // T4, T5 nên luôn được enable (vì đã được chọn)
    expect(result).toContain(3);
    expect(result).toContain(4);
    // T2 cũng nên được enable (vì có timeslot hợp lệ)
    expect(result).toContain(1);
  });

  it("should disable days when timeslot is LOCKED", () => {
    getSlotStatus.mockReturnValue({
      status: "LOCKED",
      reason: "GV bận",
      reasonSource: "session_conflict",
    });

    const result = calculateAvailableDaysForTimeslot({
      selectedTimeslotIds: new Set([1]), // TimeslotID 1 (T2)
      timeslots: mockTimeslots,
      selectedDays: [],
      startDate: "2025-01-06",
      endDate: "2025-02-28",
      instructorType: "fulltime",
      parttimeAvailableSlotKeySet: new Set(),
      getSlotStatus,
      dayOfWeekToDay,
      normalizeTimeString,
      normalizeTimeslotId,
    });

    // T2 không nên được enable vì bị LOCKED
    expect(result).not.toContain(1);
  });

  it("should handle parttime instructor correctly", () => {
    const parttimeSlots = new Set(["1-1"]); // T2, TimeslotID 1

    const result = calculateAvailableDaysForTimeslot({
      selectedTimeslotIds: new Set([1]), // TimeslotID 1
      timeslots: mockTimeslots,
      selectedDays: [],
      startDate: "2025-01-06",
      endDate: "2025-02-28",
      instructorType: "parttime",
      parttimeAvailableSlotKeySet: parttimeSlots,
      getSlotStatus,
      dayOfWeekToDay,
      normalizeTimeString,
      normalizeTimeslotId,
    });

    // T2 nên được enable vì parttime có slot AVAILABLE
    expect(result).toContain(1);
  });

  it("should disable days for parttime when no available slot", () => {
    const parttimeSlots = new Set(); // Không có slot nào

    const result = calculateAvailableDaysForTimeslot({
      selectedTimeslotIds: new Set([1]), // TimeslotID 1
      timeslots: mockTimeslots,
      selectedDays: [],
      startDate: "2025-01-06",
      endDate: "2025-02-28",
      instructorType: "parttime",
      parttimeAvailableSlotKeySet: parttimeSlots,
      getSlotStatus,
      dayOfWeekToDay,
      normalizeTimeString,
      normalizeTimeslotId,
    });

    // T2 không nên được enable vì parttime chưa đăng ký slot này
    expect(result).not.toContain(1);
  });
});
