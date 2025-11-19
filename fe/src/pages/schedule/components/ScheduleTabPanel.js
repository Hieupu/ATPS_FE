import React from "react";
import { Grid, Typography } from "@mui/material";
import ScheduleCard from "./ScheduleCard";

const ScheduleTabPanel = ({ 
  scheduleGroups, 
  generateZoomLink, 
  canJoinZoom, 
  showPastStyle = false 
}) => {
  return (
    <Grid container spacing={3}>
      {scheduleGroups.map(([date, scheduleGroup]) => (
        <Grid item xs={12} key={date}>
          <Typography
            variant="h6"
            sx={{ 
              mb: 2, 
              fontWeight: 600, 
              color: showPastStyle ? "text.secondary" : "primary.main" 
            }}
          >
            {date}
          </Typography>
          {scheduleGroup.map((schedule, idx) => (
            <ScheduleCard
              key={idx}
              schedule={schedule}
              generateZoomLink={generateZoomLink}
              canJoinZoom={canJoinZoom}
              showPastStyle={showPastStyle}
            />
          ))}
        </Grid>
      ))}
    </Grid>
  );
};

export default ScheduleTabPanel;