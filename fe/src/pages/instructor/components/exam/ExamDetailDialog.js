import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Paper,
} from "@mui/material";

const ExamDetailDialog = ({ open, onClose, exam }) => {
  if (!exam) return null;
  const formatDateTime = (dateString) => {
    if (!dateString) return "Chưa đặt";
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getTotalQuestions = () => {
    const sectionsData = exam.sections || exam.Sections || [];
    if (sectionsData.length === 0) return 0;
    const childSections = sectionsData.filter(s => s.ParentSectionId || s.parentSectionId);
    
    return childSections.reduce((total, section) => {
      return total + (section.DirectQuestionsCount || section.QuestionCount || 0);
    }, 0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>  
      <DialogContent dividers sx={{ minHeight: '400px' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                  Thông tin bài tập
                </Typography>
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body1" color="text.primary" fontWeight={600} sx={{ mb: 0.5 }}>
                        Tiêu đề
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {exam.Title}
                      </Typography>
                    </Box>

                    {exam.Description && (
                      <>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />
                        <Box>
                          <Typography variant="body1" color="text.primary" fontWeight={600} sx={{ mb: 0.5 }}>
                            Mô tả
                          </Typography>
                          <Typography variant="body2" color="text.primary">
                            {exam.Description}
                          </Typography>
                        </Box>
                      </>
                    )}

                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />

                    <Box>
                      <Typography variant="body1" color="text.primary" fontWeight={600} sx={{ mb: 0.5 }}>
                        Khóa học
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {exam.CourseName || "Chưa xác định"}
                      </Typography>
                    </Box>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />

                    <Box>
                      <Typography variant="body1" color="text.primary" fontWeight={600} sx={{ mb: 0.5 }}>
                        Lớp học
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {exam.classes && exam.classes.length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {exam.classes.map((classItem, idx) => {
                              const className = classItem.Name || classItem.ClassName || classItem.name || `Lớp ${idx + 1}`;
                              return (
                                <Box 
                                  key={idx}
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: 1
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      bgcolor: 'primary.main',
                                      flexShrink: 0
                                    }}
                                  />
                                  <Typography variant="body2" color="text.primary">
                                    {className}
                                  </Typography>
                                </Box>
                              );
                            })}
                          </Box>
                        ) : exam.ClassName ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {exam.ClassName.split(', ').map((className, idx) => (
                              <Box 
                                key={idx}
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  gap: 1
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    flexShrink: 0
                                  }}
                                />
                                <Typography variant="body2" color="text.primary">
                                  {className}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.primary">
                            Chưa gán lớp học
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />

                    <Box>
                      <Typography variant="body1" color="text.primary" fontWeight={600} sx={{ mb: 0.5 }}>
                        Thời gian mở bài tập
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.primary">
                          {exam.StartTime && new Date(exam.StartTime).toLocaleString('vi-VN')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          →
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {exam.EndTime && new Date(exam.EndTime).toLocaleString('vi-VN')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                Cấu trúc bài tập
              </Typography>
              {(() => {
                const sectionsData = exam.sections || exam.Sections || [];
                
                if (sectionsData.length === 0) {
                  return (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        bgcolor: 'grey.50'
                      }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        Chưa có phần bài tập nào
                      </Typography>
                    </Paper>
                  );
                }

                // Lọc parent sections
                const parentSections = sectionsData.filter(
                  section => !section.ParentSectionId && !section.parentSectionId
                );

                return (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {parentSections.map((parent, idx) => {
                      // Lấy child sections từ field childSections của parent
                      const children = parent.childSections || parent.ChildSections || [];
                      
                      // Tính tổng số câu hỏi từ child sections
                      const totalQuestions = children.reduce((sum, child) =>
                        sum + (child.TotalQuestions || child.DirectQuestionsCount || child.QuestionCount || 0), 0
                      );

                      return (
                        <Paper
                          key={parent.SectionId || parent.SectionID || parent.id || idx}
                          variant="outlined"
                          sx={{
                            p: 2.5,
                            '&:hover': {
                              boxShadow: 2,
                              borderColor: 'primary.main'
                            },
                            transition: 'all 0.2s'
                          }}
                        >
                          <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={children.length > 0 ? 2 : 0}>
                              <Box display="flex" gap={1.5} alignItems="center" flex={1}>
                                <Box
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '8px',
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '1.1rem'
                                  }}
                                >
                                  {idx + 1}
                                </Box>
                                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                                  {parent.Type && parent.Title 
                                    ? `${parent.Type}: ${parent.Title}` 
                                    : (parent.Title || parent.Type || `Phần ${idx + 1}`)}
                                </Typography>
                              </Box>
                              <Chip
                                label={`${totalQuestions} câu hỏi`}
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>

                            {children.length > 0 && (
                              <Box ml={6}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontWeight={500}
                                  sx={{ display: 'block', mb: 1 }}
                                >
                                  Phần bài tập con:
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {children.map((child, childIdx) => (
                                    <Box
                                      key={child.SectionId || child.SectionID || child.id || childIdx}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        p: 1.5,
                                        bgcolor: 'grey.50',
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'grey.200'
                                      }}
                                    >
                                      <Typography variant="body2" fontWeight={500} flex={1}>
                                        {child.Title || child.Type || `Phần ${childIdx + 1}`}
                                      </Typography>
                                      <Chip
                                        label={`${child.TotalQuestions || child.DirectQuestionsCount || child.QuestionCount || 0} câu`}
                                        size="small"
                                        sx={{
                                          height: 22,
                                          fontSize: '0.7rem',
                                          fontWeight: 600,
                                          bgcolor: 'white'
                                        }}
                                      />
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                );
              })()}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExamDetailDialog;