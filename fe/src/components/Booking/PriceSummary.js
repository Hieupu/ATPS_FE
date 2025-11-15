import React from "react";
import { Box, Typography } from "@mui/material";

const PriceSummary = ({
  finalPrice,
  formatCurrency,
  courseInfo,
  instructor,
  selectedWeek,
  availableWeeks,
  requiredNumberOfSessions,
  selectedSlots,
}) => {
  return (
    <>
      {/* Tổng tiền khóa học */}
      <Box
        sx={{
          p: 2,
          mb: 2,
          bgcolor: "primary.light",
          borderRadius: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Tổng tiền khóa học:
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "primary.main" }}
        >
          {formatCurrency(finalPrice)}
        </Typography>
      </Box>

      {/* Tóm tắt lựa chọn */}
      {courseInfo && selectedWeek && (
        <Box
          sx={{
            p: 2,
            bgcolor: "grey.50",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Tóm tắt lựa chọn:
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Khóa học: {courseInfo?.Title || "N/A"}
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Giáo viên: {instructor?.FullName || "N/A"}
          </Typography>
          <Typography variant="body2">
            Tuần:{" "}
            {availableWeeks.find((w) => w.value === selectedWeek)?.label ||
              "N/A"}
          </Typography>
          {requiredNumberOfSessions > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Số buổi học cần: {requiredNumberOfSessions} buổi
            </Typography>
          )}
          {selectedSlots.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1, color: "primary.main" }}>
              Đã chọn {selectedSlots.length} slot
            </Typography>
          )}
        </Box>
      )}
    </>
  );
};

export default PriceSummary;