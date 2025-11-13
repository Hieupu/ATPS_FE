import React from 'react';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Skeleton
} from '@mui/material';
import { ArrowForward, People, CalendarToday, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PopularClassesSection = ({ 
  popularClasses, 
  loadingClasses, 
  onViewAllClasses, 
  onViewCourseDetails
}) => {
  const navigate = useNavigate();

  const handleViewAllClasses = onViewAllClasses || (() => navigate('/courses'));
  const handleViewCourseDetails = onViewCourseDetails || ((courseId) => navigate(`/courses/${courseId}`));

  const getRemainingSlots = (classItem) => {
    const maxStudents = classItem.MaxStudents || classItem.Maxstudent || 30;
    const currentStudents = classItem.CurrentStudents || 0;
    return maxStudents - currentStudents;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (error) {
      return 'Chưa xác định';
    }
  };

  return (
    <Box sx={{ 
      backgroundColor: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)',
      py: 6
    }}>
      <Container maxWidth="lg">
        {/* HEADER */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Lớp Học Nổi Bật
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Khám phá các khóa học chất lượng với giảng viên hàng đầu
          </Typography>
        </Box>

        {/* LOADING STATE */}
        {loadingClasses ? (
          <Grid container spacing={3}>
            {[...Array(3)].map((_, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ 
                  borderRadius: 3, 
                  height: '100%',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Skeleton variant="text" height={32} sx={{ mb: 2 }} />
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} width="80%" />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                      <Skeleton variant="text" width={100} height={30} />
                      <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : popularClasses.length > 0 ? (
          
          /* CLASS CARDS */
          <Grid container spacing={2.5}>
            {popularClasses.slice(0, 3).map((classItem) => {
              const remainingSlots = getRemainingSlots(classItem);

              return (
                <Grid item xs={12} md={4} key={classItem.ClassID}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      border: '1px solid rgba(0,0,0,0.05)',
                      background: 'white',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                      }
                    }}
                    onClick={() => handleViewCourseDetails(classItem.CourseID)}
                  >
                    {/* COURSE IMAGE */}
                    {classItem.Image && (
                      <Box sx={{ 
                        height: 200, 
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <img 
                          src={classItem.Image} 
                          alt={classItem.ClassName || 'Course image'}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }} 
                        />
                        {/* HOT BADGE */}
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 12, 
                          right: 12,
                          width: 40, 
                          height: 40
                        }}>
                          <img 
                            src="https://bephungphu.com/wp-content/uploads/2023/11/hot-gif.gif" 
                            alt="Hot" 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'contain' 
                            }} 
                          />
                        </Box>
                      </Box>
                    )}
                    
                    <CardContent sx={{ 
                      p: 2.5, 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      '&:last-child': { pb: 2.5 }
                    }}>
                      {/* HEADER */}
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="h1" sx={{ 
                          fontWeight: 700, 
                          mb: 0, 
                          color: '#2c3e50',
                          lineHeight: 1.3,
                          fontSize: '1.1rem',
                          minHeight: 52,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {classItem.ClassName || 'Chưa có tên'}
                        </Typography>

                        {/* COURSE TITLE AND REMAINING SLOTS */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          mb: 1,
                        }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              flex: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.5
                            }}
                          >
                            {classItem.CourseTitle || 'Khóa học'}
                          </Typography>
                          
                          <Chip
                            icon={<People sx={{ fontSize: 14 }} />}
                            label={`Còn ${remainingSlots}`}
                            size="small"
                            color="primary"
                            variant="filled"
                            sx={{ 
                              fontWeight: 600, 
                              flexShrink: 0,
                              backgroundColor: remainingSlots < 5 ? '#ff4757' : '#2ecc71',
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      </Box>

                      {/* INSTRUCTOR */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2.5,
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e8f4fd'
                      }}>
                        <Avatar 
                          src={classItem.InstructorAvatar}
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1.5,
                            border: '2px solid #3498db'
                          }}
                        >
                          {classItem.InstructorName?.charAt(0) || 'G'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
                            Giảng viên
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            {classItem.InstructorName || 'Chưa xác định'}
                          </Typography>
                        </Box>
                      </Box>

                  {/* CLASS DETAILS - START DATE AND DURATION IN ONE LINE */}
<Box sx={{ 
  mb: 1, 
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 1.5
}}>
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    flex: 1,
    backgroundColor: '#f8fafc',
    p: 1.2,
    borderRadius: 2,
    border: '1px solid #e8f4fd'
  }}>
    <CalendarToday sx={{ 
      fontSize: 16, 
      color: '#3498db', 
      mr: 1.2 
    }} />
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
        Khai giảng
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.85rem' }}>
        {formatDate(classItem.Opendate)}
      </Typography>
    </Box>
  </Box>

  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    flex: 1,
    backgroundColor: '#f8fafc',
    p: 1.2,
    borderRadius: 2,
    border: '1px solid #e8f4fd'
  }}>
    <AccessTime sx={{ 
      fontSize: 16, 
      color: '#3498db', 
      mr: 1.2 
    }} />
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
        Thời lượng
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.85rem' }}>
        {classItem.Numofsession || 0} buổi
      </Typography>
    </Box>
  </Box>
</Box>

                      {/* FOOTER */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        pt: 2,
                        borderTop: '1px solid #f1f5f9'
                      }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Học phí
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 800, 
                            color: '#e74c3c',
                            fontSize: '1.25rem'
                          }}>
                            {new Intl.NumberFormat('vi-VN', { 
                              style: 'currency', 
                              currency: 'VND' 
                            }).format(classItem.Fee || 0)}
                          </Typography>
                        </Box>
                        <Button 
                          variant="contained" 
                          size="medium"
                          endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                          sx={{ 
                            borderRadius: 2,
                            fontWeight: 700,
                            px: 2.5,
                            py: 1,
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                            boxShadow: '0 2px 10px rgba(52, 152, 219, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #2980b9 0%, #2471a3 100%)',
                              boxShadow: '0 4px 15px rgba(52, 152, 219, 0.4)'
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCourseDetails(classItem.CourseID);
                          }}
                        >
                          Đăng ký
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          
          /* EMPTY STATE */
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Hiện không có lớp học sắp khai giảng
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng quay lại sau...
            </Typography>
          </Box>
        )}

        {/* VIEW ALL BUTTON */}
        {!loadingClasses && popularClasses.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              onClick={handleViewAllClasses}
              size="large"
              sx={{ 
                borderRadius: 2,
                px: 4,
                py: 1.2,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                borderColor: '#3498db',
                color: '#3498db',
                borderWidth: 2,
                '&:hover': {
                  borderColor: '#2980b9',
                  backgroundColor: 'rgba(52, 152, 219, 0.04)',
                  borderWidth: 2
                }
              }}
            >
              Xem tất cả khóa học
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PopularClassesSection;