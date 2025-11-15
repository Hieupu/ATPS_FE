import React from "react";
import { Box, Tabs, Tab, Alert } from "@mui/material";
import ScheduleTabPanel from "./ScheduleTabPanel";

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const ScheduleTabs = ({
  tabValue,
  onTabChange,
  schedules,
  groupedSchedules,
  parseDate,
  generateZoomLink,
  canJoinZoom
}) => {
  // Set today to start of day for proper comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingSchedules = Object.entries(groupedSchedules)
    .filter(([date]) => {
      if (date === "Chưa có lịch") return true;
      const scheduleDate = parseDate(date);
      if (!scheduleDate) return false;
      return scheduleDate >= today;
    })
    .sort(([a], [b]) => {
      const dateA = parseDate(a);
      const dateB = parseDate(b);
      
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      return dateA - dateB;
    });

  const pastSchedules = Object.entries(groupedSchedules)
    .filter(([date]) => {
      if (date === "Chưa có lịch") return false;
      const scheduleDate = parseDate(date);
      if (!scheduleDate) return false;
      return scheduleDate < today;
    })
    .sort(([a], [b]) => {
      const dateA = parseDate(a);
      const dateB = parseDate(b);
      return dateB - dateA;
    });

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={onTabChange}>
          <Tab label={`Tất cả lịch học (${schedules.length})`} />
          <Tab
            label={`Sắp tới (${upcomingSchedules.reduce(
              (sum, [_, sessions]) => sum + sessions.length,
              0
            )})`}
          />
          <Tab
            label={`Đã qua (${pastSchedules.reduce(
              (sum, [_, sessions]) => sum + sessions.length,
              0
            )})`}
          />
        </Tabs>
      </Box>

      {/* Tab All Schedules */}
      <TabPanel value={tabValue} index={0}>
        {schedules.length === 0 ? (
          <Alert severity="info" sx={{ mt: 3 }}>
            Không có lịch học nào
          </Alert>
        ) : (
          <ScheduleTabPanel
            scheduleGroups={Object.entries(groupedSchedules)}
            generateZoomLink={generateZoomLink}
            canJoinZoom={canJoinZoom}
            showPastStyle={false}
          />
        )}
      </TabPanel>

      {/* Tab Upcoming */}
      <TabPanel value={tabValue} index={1}>
        {upcomingSchedules.length === 0 ? (
          <Alert severity="info" sx={{ mt: 3 }}>
            Không có lịch học sắp tới
          </Alert>
        ) : (
          <ScheduleTabPanel
            scheduleGroups={upcomingSchedules}
            generateZoomLink={generateZoomLink}
            canJoinZoom={canJoinZoom}
            showPastStyle={false}
          />
        )}
      </TabPanel>

      {/* Tab Past */}
      <TabPanel value={tabValue} index={2}>
        {pastSchedules.length === 0 ? (
          <Alert severity="info" sx={{ mt: 3 }}>
            Không có lịch học đã qua
          </Alert>
        ) : (
          <ScheduleTabPanel
            scheduleGroups={pastSchedules}
            generateZoomLink={generateZoomLink}
            canJoinZoom={canJoinZoom}
            showPastStyle={true}
          />
        )}
      </TabPanel>
    </>
  );
};

export default ScheduleTabs;