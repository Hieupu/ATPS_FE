import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Button,
  useTheme,
  Grid,
  Paper,
  Fade,
  Grow,
} from "@mui/material";

const FilterSection = ({
  filters = {},
  onFilterChange = () => {},
  onClearFilters = () => {},
}) => {
  const theme = useTheme();
  const [months, setMonths] = useState([]);
  
  const timeSlots = [
    { value: "08:00:00", label: "08:00 - 10:00" },
    { value: "10:20:00", label: "10:20 - 12:20" },
    { value: "13:00:00", label: "13:00 - 15:00" },
    { value: "15:20:00", label: "15:20 - 17:20" },
    { value: "18:00:00", label: "18:00 - 20:00" },
    { value: "20:00:00", label: "20:00 - 22:00" },
  ];
  
  const daysOfWeek = [
    { value: "Monday", label: "Thứ 2" },
    { value: "Tuesday", label: "Thứ 3" },
    { value: "Wednesday", label: "Thứ 4" },
    { value: "Thursday", label: "Thứ 5" },
    { value: "Friday", label: "Thứ 6" },
    { value: "Saturday", label: "Thứ 7" },
    { value: "Sunday", label: "Chủ nhật" },
  ];
  
  const levels = [
    { value: "5.0", label: "5.0" },
    { value: "6.0", label: "6.0" },
    { value: "6.5", label: "6.5" },
    { value: "7.0", label: "7.0" },
    { value: "7.5", label: "7.5" },
  ];

  useEffect(() => {
    const currentDate = new Date();
    const monthsArray = [];
    
    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthValue = monthDate.getMonth() + 1;
      const monthLabel = monthDate.toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      });
      
      monthsArray.push({
        value: monthValue.toString(),
        label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      });
    }
    
    setMonths(monthsArray);
  }, []);

  const handleMonthChange = (event) => {
    onFilterChange({ ...filters, month: event.target.value });
  };

  const handleLevelsChange = (event) => {
    onFilterChange({ ...filters, levels: event.target.value.join(",") });
  };

  const handleDaysChange = (event) => {
    onFilterChange({ ...filters, days: event.target.value.join(",") });
  };

  const handleTimeSlotChange = (event) => {
    onFilterChange({ ...filters, timeSlot: event.target.value });
  };

  const hasActiveFilters = () => {
    return filters.month || filters.levels || filters.days || filters.timeSlot;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.month) count++;
    if (filters.levels) count += filters.levels.split(",").length;
    if (filters.days) count += filters.days.split(",").length;
    if (filters.timeSlot) count++;
    return count;
  };

  return (
    <Fade in timeout={600}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2.5, md: 4 },
          mb: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.200',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'primary.light',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          }
        }}
      >

        {/* Filters Grid */}
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl 
              fullWidth 
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: 'grey.50',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                  }
                }
              }}
            >
              <InputLabel sx={{ fontWeight: 500 }}>Tháng khai giảng</InputLabel>
              <Select
                value={filters.month || ""}
                onChange={handleMonthChange}
                label="Tháng khai giảng"
              >
                <MenuItem value="">
                  <em style={{ fontStyle: 'normal', color: '#9e9e9e' }}>Tất cả tháng</em>
                </MenuItem>
                {months.map((month) => (
                  <MenuItem 
                    key={month.value} 
                    value={month.value}
                    sx={{ py: 1.5 }}
                  >
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl 
              fullWidth 
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: 'grey.50',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                  }
                }
              }}
            >
              <InputLabel sx={{ fontWeight: 500 }}>Trình độ</InputLabel>
              <Select
                multiple
                value={filters.levels ? filters.levels.split(",") : []}
                onChange={handleLevelsChange}
                input={<OutlinedInput label="Trình độ" />}
                renderValue={(selected) => selected.join(", ")}
              >
                {levels.map((level) => (
                  <MenuItem key={level.value} value={level.value} sx={{ py: 1.5 }}>
                    <Checkbox 
                      checked={filters.levels?.includes(level.value) || false}
                      sx={{ 
                        '&.Mui-checked': {
                          color: 'primary.main',
                        }
                      }}
                    />
                    <ListItemText 
                      primary={level.label}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl 
              fullWidth 
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: 'grey.50',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                  }
                }
              }}
            >
              <InputLabel sx={{ fontWeight: 500 }}>Ngày học</InputLabel>
              <Select
                multiple
                value={filters.days ? filters.days.split(",") : []}
                onChange={handleDaysChange}
                input={<OutlinedInput label="Ngày học" />}
                renderValue={(selected) => 
                  selected.map(s => daysOfWeek.find(d => d.value === s)?.label || s).join(", ")
                }
              >
                {daysOfWeek.map((day) => (
                  <MenuItem key={day.value} value={day.value} sx={{ py: 1.5 }}>
                    <Checkbox 
                      checked={filters.days?.includes(day.value) || false}
                      sx={{ 
                        '&.Mui-checked': {
                          color: 'primary.main',
                        }
                      }}
                    />
                    <ListItemText 
                      primary={day.label}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl 
              fullWidth 
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: 'grey.50',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                  }
                }
              }}
            >
              <InputLabel sx={{ fontWeight: 500 }}>Khung giờ</InputLabel>
              <Select
                value={filters.timeSlot || ""}
                onChange={handleTimeSlotChange}
                label="Khung giờ"
              >
                <MenuItem value="">
                  <em style={{ fontStyle: 'normal', color: '#9e9e9e' }}>Tất cả khung giờ</em>
                </MenuItem>
                {timeSlots.map((slot) => (
                  <MenuItem 
                    key={slot.value} 
                    value={slot.value}
                    sx={{ py: 1.5 }}
                  >
                    {slot.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active Filters Chips */}
        {hasActiveFilters() && (
          <Fade in timeout={500}>
            <Box sx={{ 
              mt: 1, 
              pt: 1,
              borderTop: '1px solid',
              borderColor: 'grey.100',
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  mb: 1.5,
                  color: 'grey.600',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.7rem',
                }}
              >
                Bộ lọc đang áp dụng
              </Typography>
              
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {filters.month && (
                  <Grow in timeout={300}>
                    <Chip
                      label={`${months.find(m => m.value === filters.month)?.label || filters.month}`}
                      onDelete={() => onFilterChange({ ...filters, month: null })}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 500,
                        backgroundColor: 'primary.50',
                        color: 'primary.700',
                        border: '1px solid',
                        borderColor: 'primary.200',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'primary.100',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(25, 118, 210, 0.15)',
                        },
                        '& .MuiChip-deleteIcon': {
                          color: 'primary.500',
                          '&:hover': {
                            color: 'primary.700',
                          }
                        }
                      }}
                    />
                  </Grow>
                )}
                
                {filters.levels && filters.levels.split(",").map((level, index) => (
                  <Grow in timeout={300 + index * 50} key={level}>
                    <Chip
                      label={`Level ${level}`}
                      onDelete={() => {
                        const newLevels = filters.levels.split(",").filter(l => l !== level);
                        onFilterChange({ 
                          ...filters, 
                          levels: newLevels.length > 0 ? newLevels.join(",") : null 
                        });
                      }}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 500,
                        backgroundColor: 'success.50',
                        color: 'success.700',
                        border: '1px solid',
                        borderColor: 'success.200',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'success.100',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(46, 125, 50, 0.15)',
                        },
                        '& .MuiChip-deleteIcon': {
                          color: 'success.500',
                          '&:hover': {
                            color: 'success.700',
                          }
                        }
                      }}
                    />
                  </Grow>
                ))}
                
                {filters.days && filters.days.split(",").map((day, index) => (
                  <Grow in timeout={300 + index * 50} key={day}>
                    <Chip
                      label={daysOfWeek.find(d => d.value === day)?.label || day}
                      onDelete={() => {
                        const newDays = filters.days.split(",").filter(d => d !== day);
                        onFilterChange({ 
                          ...filters, 
                          days: newDays.length > 0 ? newDays.join(",") : null 
                        });
                      }}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 500,
                        backgroundColor: 'warning.50',
                        color: 'warning.800',
                        border: '1px solid',
                        borderColor: 'warning.200',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'warning.100',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(237, 108, 2, 0.15)',
                        },
                        '& .MuiChip-deleteIcon': {
                          color: 'warning.600',
                          '&:hover': {
                            color: 'warning.800',
                          }
                        }
                      }}
                    />
                  </Grow>
                ))}
                
                {filters.timeSlot && (
                  <Grow in timeout={300}>
                    <Chip
                      label={timeSlots.find(t => t.value === filters.timeSlot)?.label || filters.timeSlot}
                      onDelete={() => onFilterChange({ ...filters, timeSlot: null })}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 500,
                        backgroundColor: 'info.50',
                        color: 'info.700',
                        border: '1px solid',
                        borderColor: 'info.200',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'info.100',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(2, 136, 209, 0.15)',
                        },
                        '& .MuiChip-deleteIcon': {
                          color: 'info.500',
                          '&:hover': {
                            color: 'info.700',
                          }
                        }
                      }}
                    />
                  </Grow>
                )}
              </Box>
            </Box>
          </Fade>
        )}
      </Paper>
    </Fade>
  );
};

export default FilterSection;