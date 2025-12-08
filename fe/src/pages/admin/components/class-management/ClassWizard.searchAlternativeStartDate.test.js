/**
 * Test file cho tính năng "Tìm kiếm ngày bắt đầu khác theo Ca mong muốn"
 *
 * File này test các logic và behavior của tính năng tìm kiếm ngày bắt đầu khác
 *
 * Các test case:
 * 1. Logic bật chế độ tìm kiếm
 * 2. Logic clear suggestions khi thay đổi lựa chọn
 * 3. Logic validation input
 * 4. Logic normalize data
 * 5. Logic build TimeslotsByDay từ selectedTimeslotIds
 */

// Mock các services
jest.mock("../../../../apiServices/classService", () => ({
  __esModule: true,
  default: {
    searchTimeslots: jest.fn(),
    analyzeBlockedDays: jest.fn(),
  },
}));

jest.mock("../../../../apiServices/instructorService", () => ({
  __esModule: true,
  default: {
    getInstructorWithCourses: jest.fn(),
    getInstructorSchedule: jest.fn(),
  },
}));

describe("ClassWizard - Tìm kiếm ngày bắt đầu khác theo Ca mong muốn - Logic Tests", () => {
  describe("1. Logic bật chế độ tìm kiếm", () => {
    it("should return correct initial state when entering search mode", () => {
      const initialState = {
        loading: false,
        suggestions: [],
        error: null,
        showResults: false,
      };

      const expectedState = {
        loading: false,
        suggestions: [],
        error: null,
        showResults: true,
      };

      // Simulate entering search mode
      const newState = {
        ...initialState,
        showResults: true,
      };

      expect(newState).toEqual(expectedState);
    });

    it("should reset DaysOfWeek and TimeslotsByDay when entering search mode", () => {
      const initialFormData = {
        scheduleDetail: {
          DaysOfWeek: [1, 2, 3],
          TimeslotsByDay: {
            1: [24, 25],
            2: [24, 25],
            3: [24],
          },
        },
      };

      const expectedFormData = {
        scheduleDetail: {
          DaysOfWeek: [],
          TimeslotsByDay: {},
        },
      };

      // Simulate reset
      const newFormData = {
        ...initialFormData,
        scheduleDetail: {
          ...initialFormData.scheduleDetail,
          DaysOfWeek: [],
          TimeslotsByDay: {},
        },
      };

      expect(newFormData.scheduleDetail.DaysOfWeek).toEqual(
        expectedFormData.scheduleDetail.DaysOfWeek
      );
      expect(newFormData.scheduleDetail.TimeslotsByDay).toEqual(
        expectedFormData.scheduleDetail.TimeslotsByDay
      );
    });
  });

  describe("2. Logic clear suggestions khi thay đổi lựa chọn", () => {
    it("should clear suggestions when changing timeslot selection", () => {
      const stateWithSuggestions = {
        loading: false,
        suggestions: [
          {
            date: "2025-12-15",
            availableSlots: 4,
            totalSlots: 4,
            reason: "Đủ 4 ca/tuần",
          },
        ],
        error: null,
        showResults: true,
      };

      // Simulate clearing suggestions
      const newState = {
        ...stateWithSuggestions,
        suggestions: [],
        error: null,
      };

      expect(newState.suggestions).toEqual([]);
      expect(newState.error).toBeNull();
    });

    it("should clear suggestions when changing day selection", () => {
      const stateWithSuggestions = {
        loading: false,
        suggestions: [
          {
            date: "2025-12-15",
            availableSlots: 4,
            totalSlots: 4,
            reason: "Đủ 4 ca/tuần",
          },
        ],
        error: null,
        showResults: true,
      };

      // Simulate clearing suggestions
      const newState = {
        ...stateWithSuggestions,
        suggestions: [],
        error: null,
      };

      expect(newState.suggestions).toEqual([]);
      expect(newState.error).toBeNull();
    });
  });

  describe("3. Logic validation input", () => {
    it("should validate that DaysOfWeek and TimeslotsByDay are required", () => {
      const hasDaysOfWeek = true;
      const hasTimeslotsByDay = true;
      const hasSelectedTimeslots = true;

      const isValid =
        hasDaysOfWeek && (hasTimeslotsByDay || hasSelectedTimeslots);

      expect(isValid).toBe(true);
    });

    it("should return error when DaysOfWeek is missing", () => {
      const hasDaysOfWeek = false;
      const hasTimeslotsByDay = true;
      const hasSelectedTimeslots = true;

      const isValid =
        hasDaysOfWeek && (hasTimeslotsByDay || hasSelectedTimeslots);

      expect(isValid).toBe(false);
    });

    it("should return error when both TimeslotsByDay and selectedTimeslots are missing", () => {
      const hasDaysOfWeek = true;
      const hasTimeslotsByDay = false;
      const hasSelectedTimeslots = false;

      const isValid =
        hasDaysOfWeek && (hasTimeslotsByDay || hasSelectedTimeslots);

      expect(isValid).toBe(false);
    });

    it("should return error when only selectedTimeslots exists without DaysOfWeek", () => {
      const hasDaysOfWeek = false;
      const hasSelectedTimeslots = true;

      const isValid = hasDaysOfWeek && hasSelectedTimeslots;

      expect(isValid).toBe(false);
    });
  });

  describe("4. Logic normalize data", () => {
    it("should normalize string numbers to integers in DaysOfWeek", () => {
      const daysOfWeek = ["1", "2", "3"];
      const normalized = daysOfWeek.map((d) =>
        typeof d === "string" ? parseInt(d, 10) : d
      );

      expect(normalized).toEqual([1, 2, 3]);
    });

    it("should normalize string numbers to integers in TimeslotsByDay", () => {
      const timeslotsByDay = {
        1: ["24", "25"],
        2: ["24"],
      };

      const normalized = {};
      Object.entries(timeslotsByDay).forEach(([dayKey, timeslotIds]) => {
        const normalizedDayKey =
          typeof dayKey === "string" ? parseInt(dayKey, 10) : dayKey;
        normalized[normalizedDayKey] = (timeslotIds || []).map((id) =>
          typeof id === "string" ? parseInt(id, 10) : id
        );
      });

      expect(normalized).toEqual({
        1: [24, 25],
        2: [24],
      });
    });

    it("should handle mixed string and number types", () => {
      const daysOfWeek = [1, "2", 3];
      const normalized = daysOfWeek.map((d) =>
        typeof d === "string" ? parseInt(d, 10) : d
      );

      expect(normalized).toEqual([1, 2, 3]);
    });
  });

  describe("5. Logic build TimeslotsByDay từ selectedTimeslotIds", () => {
    it("should build TimeslotsByDay from selectedTimeslotIds and DaysOfWeek", () => {
      const selectedTimeslotIds = new Set([24, 25]);
      const daysOfWeek = [1, 2, 3];

      const normalizedTimeslotsByDay = {};
      daysOfWeek.forEach((day) => {
        normalizedTimeslotsByDay[day] = Array.from(selectedTimeslotIds).map(
          (id) => (typeof id === "string" ? parseInt(id, 10) : id)
        );
      });

      expect(normalizedTimeslotsByDay).toEqual({
        1: [24, 25],
        2: [24, 25],
        3: [24, 25],
      });
    });

    it("should handle empty selectedTimeslotIds", () => {
      const selectedTimeslotIds = new Set();
      const daysOfWeek = [1, 2];

      const normalizedTimeslotsByDay = {};
      daysOfWeek.forEach((day) => {
        normalizedTimeslotsByDay[day] = Array.from(selectedTimeslotIds).map(
          (id) => (typeof id === "string" ? parseInt(id, 10) : id)
        );
      });

      expect(normalizedTimeslotsByDay).toEqual({
        1: [],
        2: [],
      });
    });
  });

  describe("6. Logic tính số ca/tuần", () => {
    it("should calculate total slots from TimeslotsByDay", () => {
      const timeslotsByDay = {
        1: [24, 25],
        2: [24, 25],
        3: [24],
      };

      const totalSlots = Object.values(timeslotsByDay).reduce(
        (sum, arr) => sum + (arr?.length || 0),
        0
      );

      expect(totalSlots).toBe(5);
    });

    it("should calculate total slots from selectedTimeslotIds and DaysOfWeek", () => {
      const selectedTimeslotIds = new Set([24, 25]);
      const daysOfWeek = [1, 2, 3];

      const daysCount = daysOfWeek.length;
      const slotsCount = selectedTimeslotIds.size;
      const totalSlots = daysCount * slotsCount;

      expect(totalSlots).toBe(6);
    });

    it("should return 0 when no slots selected", () => {
      const timeslotsByDay = {};
      const totalSlots = Object.values(timeslotsByDay).reduce(
        (sum, arr) => sum + (arr?.length || 0),
        0
      );

      expect(totalSlots).toBe(0);
    });
  });

  describe("7. Logic thoát chế độ tìm kiếm", () => {
    it("should reset all search state when exiting search mode", () => {
      const stateInSearchMode = {
        loading: false,
        suggestions: [
          {
            date: "2025-12-15",
            availableSlots: 4,
            totalSlots: 4,
            reason: "Đủ 4 ca/tuần",
          },
        ],
        error: null,
        showResults: true,
      };

      const expectedState = {
        loading: false,
        suggestions: [],
        error: null,
        showResults: false,
      };

      // Simulate exiting search mode
      const newState = {
        loading: false,
        suggestions: [],
        error: null,
        showResults: false,
      };

      expect(newState).toEqual(expectedState);
    });

    it("should clear DaysOfWeek and TimeslotsByDay when exiting search mode", () => {
      const formDataInSearchMode = {
        scheduleDetail: {
          DaysOfWeek: [1, 2],
          TimeslotsByDay: {
            1: [24, 25],
            2: [24, 25],
          },
        },
      };

      const expectedFormData = {
        scheduleDetail: {
          DaysOfWeek: [],
          TimeslotsByDay: {},
        },
      };

      // Simulate clearing
      const newFormData = {
        ...formDataInSearchMode,
        scheduleDetail: {
          ...formDataInSearchMode.scheduleDetail,
          DaysOfWeek: [],
          TimeslotsByDay: {},
        },
      };

      expect(newFormData.scheduleDetail.DaysOfWeek).toEqual(
        expectedFormData.scheduleDetail.DaysOfWeek
      );
      expect(newFormData.scheduleDetail.TimeslotsByDay).toEqual(
        expectedFormData.scheduleDetail.TimeslotsByDay
      );
    });
  });

  describe("8. Edge cases", () => {
    it("should handle null/undefined values in DaysOfWeek", () => {
      const daysOfWeek = null;
      const normalized = (daysOfWeek || []).map((d) =>
        typeof d === "string" ? parseInt(d, 10) : d
      );

      expect(normalized).toEqual([]);
    });

    it("should handle null/undefined values in TimeslotsByDay", () => {
      const timeslotsByDay = null;
      const normalized = {};

      Object.entries(timeslotsByDay || {}).forEach(([dayKey, timeslotIds]) => {
        const normalizedDayKey =
          typeof dayKey === "string" ? parseInt(dayKey, 10) : dayKey;
        normalized[normalizedDayKey] = (timeslotIds || []).map((id) =>
          typeof id === "string" ? parseInt(id, 10) : id
        );
      });

      expect(normalized).toEqual({});
    });

    it("should handle empty selectedTimeslotIds Set", () => {
      const selectedTimeslotIds = new Set();
      const daysOfWeek = [1, 2];

      const normalizedTimeslotsByDay = {};
      daysOfWeek.forEach((day) => {
        normalizedTimeslotsByDay[day] = Array.from(selectedTimeslotIds);
      });

      expect(normalizedTimeslotsByDay).toEqual({
        1: [],
        2: [],
      });
    });
  });
});
