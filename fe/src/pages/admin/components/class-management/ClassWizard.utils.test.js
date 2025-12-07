import {
  determineSlotStatus,
  normalizeBlockedDayValue,
} from "./ClassWizard.utils";

const baseFormData = {
  schedule: {
    Numofsession: 12,
  },
  scheduleDetail: {
    TimeslotsByDay: {
      1: [101],
    },
  },
};

const baseParams = {
  dayOfWeek: 1,
  timeslotId: 101,
  startDate: "2025-01-06",
  endDate: "2025-02-28",
  blockedDays: {},
  instructorBusySchedule: [],
  formData: baseFormData,
  sessionsPerWeek: 2,
  requiredSlotsPerWeek: 2,
};

describe("normalizeBlockedDayValue", () => {
  it("handles boolean values", () => {
    expect(normalizeBlockedDayValue(true)).toEqual({
      isDayBlocked: true,
      blockedTimeslots: [],
    });
  });

  it("handles array values", () => {
    expect(normalizeBlockedDayValue([1, 2])).toEqual({
      isDayBlocked: false,
      blockedTimeslots: [1, 2],
    });
  });

  it("handles object values", () => {
    expect(
      normalizeBlockedDayValue({ isDayBlocked: true, blockedTimeslots: [5] })
    ).toEqual({
      isDayBlocked: true,
      blockedTimeslots: [5],
    });
  });
});

describe("determineSlotStatus", () => {
  it("locks slot when blockedDays marks the day as busy", () => {
    const result = determineSlotStatus({
      ...baseParams,
      blockedDays: {
        1: { isDayBlocked: true, blockedTimeslots: [] },
      },
    });

    expect(result.status).toBe("LOCKED");
    expect(result.source).toBe("blockedDays");
    expect(result.reason).toContain("bận định kỳ");
  });

  it("locks slot when instructor schedule has busyCount > 3", () => {
    const busyEntries = [
      {
        Day: "T2",
        TimeslotID: 101,
        Status: "OTHERS",
        Date: "2025-01-06",
      },
      {
        Day: "T2",
        TimeslotID: 101,
        Status: "OTHERS",
        Date: "2025-01-13",
      },
      {
        Day: "T2",
        TimeslotID: 101,
        Status: "OTHERS",
        Date: "2025-01-20",
      },
      {
        Day: "T2",
        TimeslotID: 101,
        Status: "OTHERS",
        Date: "2025-01-27",
      },
      {
        Day: "T2",
        TimeslotID: 101,
        Status: "OTHERS",
        Date: "2025-02-03",
      },
    ];

    const result = determineSlotStatus({
      ...baseParams,
      blockedDays: {},
      instructorBusySchedule: busyEntries,
    });

    expect(result.status).toBe("LOCKED");
    expect(result.source).toBe("busySchedule");
    expect(result.busyCount).toBe(5);
    expect(result.reason).toContain("hơn 3 buổi");
  });

  it("does not lock slot when busyCount <= 3", () => {
    const busyEntries = [
      {
        Day: "T2",
        TimeslotID: 101,
        Status: "OTHERS",
        Date: "2025-01-06",
      },
      {
        Day: "T2",
        TimeslotID: 101,
        Status: "OTHERS",
        Date: "2025-01-13",
      },
      {
        Day: "T2",
        TimeslotID: 101,
        Status: "OTHERS",
        Date: "2025-01-20",
      },
    ];

    const result = determineSlotStatus({
      ...baseParams,
      blockedDays: {},
      instructorBusySchedule: busyEntries,
    });

    expect(result.status).toBe("AVAILABLE");
    expect(result.busyCount).toBe(3);
  });

  it("returns available when no blocking conditions apply", () => {
    const result = determineSlotStatus(baseParams);
    expect(result).toEqual({
      status: "AVAILABLE",
      reason: "",
      source: null,
      busyCount: 0,
    });
  });

  it("locks slot when OTHERS entries and sessions combined have busyCount > 3", () => {
    const mixedBusyEntries = [
      {
        Day: "T2",
        TimeslotID: 101,
        Status: "OTHERS",
        Date: "2025-01-06",
      },
      {
        Day: "T2",
        TimeslotID: 101,
        Status: "OTHERS",
        Date: "2025-01-13",
      },
      {
        Day: "T2",
        TimeslotID: 101,
        Status: "OTHERS",
        Date: "2025-01-20",
      },
      {
        Day: "T2",
        TimeslotID: 101,
        Status: "OTHERS",
        Date: "2025-01-27",
      },
      {
        Day: "T2",
        TimeslotID: 101,
        Status: "BUSY",
        Date: "2025-02-03",
        SessionID: 99,
        hasSession: true,
      },
    ];

    const result = determineSlotStatus({
      ...baseParams,
      instructorBusySchedule: mixedBusyEntries,
      blockedDays: {},
      sessionsPerWeek: 2,
      requiredSlotsPerWeek: 2,
      formData: {
        ...baseFormData,
        schedule: { ...baseFormData.schedule, Numofsession: 12 },
        scheduleDetail: {
          ...baseFormData.scheduleDetail,
          TimeslotsByDay: { 1: [101, 102], 3: [103] },
        },
      },
    });

    expect(result.status).toBe("LOCKED");
    expect(result.source).toBe("busySchedule");
    expect(result.busyCount).toBeGreaterThan(3);
    expect(result.reason).toContain("hơn 3 buổi");
  });
});
