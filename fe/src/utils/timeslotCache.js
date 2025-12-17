import classService from "../apiServices/classService";

let timeslotCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

export const getCachedTimeslots = async () => {
  const now = Date.now();
  if (
    timeslotCache &&
    cacheTimestamp &&
    now - cacheTimestamp < CACHE_DURATION
  ) {
    return timeslotCache;
  }

  const timeRanges = await classService.getDistinctTimeRanges();
  timeslotCache = timeRanges || [];
  cacheTimestamp = now;
  return timeslotCache;
};

export const clearTimeslotCache = () => {
  timeslotCache = null;
  cacheTimestamp = null;
};
