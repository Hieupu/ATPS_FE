import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Paper,
  Avatar,
  Divider,
  IconButton,
  Fade,
  Zoom,
  alpha,
  useTheme,
  Stack,
  Chip,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Schedule,
  Send,
  CheckCircle,
  ArrowForward,
  School,
  Language,
  ChatBubbleOutline,
  SupportAgent,
  Verified,
  AccessibilityNew,
} from '@mui/icons-material';
import AppHeader from "../../../components/Header/AppHeader";

const ContactPage = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    }, 3000);
  };

  const contactChannels = [
    {
      icon: <Email sx={{ fontSize: 24 }} />,
      title: 'Hỗ trợ qua Email',
      description: 'Phản hồi trong vòng 24 giờ',
      details: ['support@atps.edu.vn', 'info@atps.edu.vn'],
      color: '#4CAF50',
      responseTime: '24h',
    },
    {
      icon: <Phone sx={{ fontSize: 24 }} />,
      title: 'Hotline tư vấn',
      description: 'Hỗ trợ trực tiếp 8:00 - 20:00',
      details: ['1900-xxxx', '024.xxxx.xxxx (Hà Nội)'],
      color: '#2196F3',
      responseTime: 'Ngay lập tức',
    },
    {
      icon: <ChatBubbleOutline sx={{ fontSize: 24 }} />,
      title: 'Chat trực tuyến',
      description: 'Hỗ trợ trực tiếp trên website',
      details: ['Trò chuyện với chuyên viên', 'Có sẵn 8:00 - 22:00'],
      color: '#9C27B0',
      responseTime: '5 phút',
    },
  ];

  const departmentContacts = [
    {
      department: 'Tuyển sinh & Tư vấn',
      email: 'admission@atps.edu.vn',
      phone: '1900-xxxx (Nhánh 1)',
      hours: '8:00 - 20:00 hàng ngày',
    },
    {
      department: 'Hỗ trợ học viên',
      email: 'student.support@atps.edu.vn',
      phone: '1900-xxxx (Nhánh 2)',
      hours: '7:00 - 22:00 hàng ngày',
    },
    {
      department: 'Hợp tác doanh nghiệp',
      email: 'partnership@atps.edu.vn',
      phone: '024.xxxx.xxxx',
      hours: '8:30 - 17:30 Thứ 2 - Thứ 6',
    },
    {
      department: 'Kỹ thuật & Hỗ trợ kỹ thuật',
      email: 'tech.support@atps.edu.vn',
      phone: '1900-xxxx (Nhánh 3)',
      hours: '24/7',
    },
  ];

  const faqs = [
    {
      question: 'Thời gian phản hồi email là bao lâu?',
      answer: 'Chúng tôi cam kết phản hồi tất cả email trong vòng 24 giờ làm việc.',
    },
    {
      question: 'Làm thế nào để đăng ký khóa học?',
      answer: 'Liên hệ bộ phận Tuyển sinh qua hotline 1900-xxxx hoặc email admission@atps.edu.vn',
    },
    {
      question: 'ATPS có hỗ trợ học thử không?',
      answer: 'Có, chúng tôi cung cấp 1 buổi học thử miễn phí cho tất cả các khóa học.',
    },
    {
      question: 'Phương thức thanh toán được chấp nhận?',
      answer: 'Chuyển khoản ngân hàng, thẻ tín dụng, ví điện tử và tiền mặt tại trung tâm.',
    },
  ];

  const testimonials = [
    {
      name: 'Nguyễn Minh Anh',
      course: 'IELTS Intensive 7.5+',
      comment: 'Đội ngũ hỗ trợ nhiệt tình, phản hồi nhanh chóng. Rất hài lòng với dịch vụ!',
      avatar: 'MA',
    },
    {
      name: 'Trần Văn Bình',
      course: 'Business English',
      comment: 'Tư vấn viên chuyên nghiệp, giúp tôi chọn được khóa học phù hợp nhất.',
      avatar: 'TVB',
    },
    {
      name: 'Lê Thị Cẩm Tú',
      course: 'Academic Writing',
      comment: 'Hỗ trợ kỹ thuật 24/7 giúp tôi học tập mọi lúc, mọi nơi.',
      avatar: 'LCT',
    },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#fafafa',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorative elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '40%',
        height: '40%',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        borderRadius: '0 0 0 100%',
        zIndex: 0,
      }} />
      
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '30%',
        height: '30%',
        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
        borderRadius: '0 100% 0 0',
        zIndex: 0,
      }} />

      <AppHeader />
      
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: 8, pb: 12 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Fade in timeout={800}>
              <Box>
                <Chip 
                  label="Liên hệ & Hỗ trợ"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    mb: 3,
                    px: 2,
                    py: 1,
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                    mb: 3,
                    color: '#1a237e',
                  }}
                >
                  Kết nối với{" "}
                  <Box component="span" sx={{ color: 'primary.main' }}>
                    Chuyên gia
                  </Box>{" "}
                  của chúng tôi
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'text.secondary',
                    mb: 4,
                    fontWeight: 400,
                    maxWidth: '90%',
                  }}
                >
                  Đội ngũ chuyên gia IELTS và hỗ trợ viên luôn sẵn sàng đồng hành cùng bạn 
                  trên hành trình chinh phục mục tiêu tiếng Anh.
                </Typography>
                
                <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Verified sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="body2">Phản hồi trong 24h</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessibilityNew sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="body2">Hỗ trợ 1-1</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SupportAgent sx={{ color: 'secondary.main', mr: 1 }} />
                    <Typography variant="body2">Chuyên gia IELTS</Typography>
                  </Box>
                </Stack>
              </Box>
            </Fade>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Zoom in timeout={1000}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  backgroundColor: 'white',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                }} />
                
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, mt: 2 }}>
                  Liên hệ ngay
                </Typography>
                
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    variant="outlined"
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    variant="outlined"
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    variant="outlined"
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '1rem',
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Yêu cầu gọi lại ngay
                  </Button>
                </Stack>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
                  Hoặc gọi ngay: <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>1900-xxxx</Box>
                </Typography>
              </Paper>
            </Zoom>
          </Grid>
        </Grid>
      </Container>

      {/* Contact Channels */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mb: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: '#1a237e' }}>
            Kênh liên hệ
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Lựa chọn phương thức liên hệ phù hợp nhất với nhu cầu của bạn
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {contactChannels.map((channel, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Fade in timeout={(index + 1) * 300}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                      borderColor: alpha(channel.color, 0.3),
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 3,
                      justifyContent: 'space-between'
                    }}>
                      <Avatar
                        sx={{
                          backgroundColor: alpha(channel.color, 0.1),
                          color: channel.color,
                          width: 56,
                          height: 56,
                        }}
                      >
                        {channel.icon}
                      </Avatar>
                      <Chip 
                        label={channel.responseTime}
                        size="small"
                        sx={{
                          backgroundColor: alpha(channel.color, 0.1),
                          color: channel.color,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {channel.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {channel.description}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Stack spacing={1}>
                      {channel.details.map((detail, idx) => (
                        <Typography 
                          key={idx} 
                          variant="body2" 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            fontWeight: 500,
                          }}
                        >
                          <Box component="span" sx={{ 
                            width: 6, 
                            height: 6, 
                            borderRadius: '50%', 
                            backgroundColor: channel.color,
                            mr: 1.5,
                            mt: 0.5 
                          }} />
                          {detail}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mb: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: '#1a237e' }}>
            Học viên nói gì về chúng tôi
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Những phản hồi chân thực từ cộng đồng học viên ATPS
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Fade in timeout={(index + 1) * 300}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    backgroundColor: 'white',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.08)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        mr: 2,
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.course}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" sx={{ flexGrow: 1, mb: 3 }}>
                    "{testimonial.comment}"
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex' }}>
                      {[...Array(5)].map((_, i) => (
                        <Box
                          key={i}
                          sx={{
                            color: '#FFD700',
                            fontSize: '1.2rem',
                          }}
                        >
                          ★
                        </Box>
                      ))}
                    </Box>
                    <Verified sx={{ color: 'success.main' }} />
                  </Box>
                </Paper>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FAQ Section */}
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, mb: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, color: '#1a237e' }}>
            Câu hỏi thường gặp
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Tìm câu trả lời cho những thắc mắc phổ biến
          </Typography>
        </Box>

        <Stack spacing={3}>
          {faqs.map((faq, index) => (
            <Fade in timeout={(index + 1) * 200} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  backgroundColor: 'white',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {faq.question}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {faq.answer}
                </Typography>
              </Paper>
            </Fade>
          ))}
        </Stack>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mb: 12 }}>
        <Paper
          sx={{
            p: { xs: 4, md: 8 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
            color: 'white',
            textAlign: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            }}
          />
          
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, position: 'relative' }}>
            Sẵn sàng bắt đầu?
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto', position: 'relative' }}>
            Liên hệ ngay để được tư vấn lộ trình học IELTS phù hợp với mục tiêu của bạn
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
                backgroundColor: 'white',
                color: '#1a237e',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(255, 255, 255, 0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Đăng ký tư vấn miễn phí
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Gọi ngay: 1900-xxxx
            </Button>
          </Stack>
          
          <Typography variant="body2" sx={{ mt: 4, opacity: 0.8, position: 'relative' }}>
            Phản hồi trong vòng 15 phút • Hỗ trợ 24/7 • Chuyên gia IELTS 8.0+
          </Typography>
        </Paper>
      </Container>

      {/* Footer Contact Info */}
      <Box sx={{ 
        backgroundColor: '#f5f7ff', 
        py: 6,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <School sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  ATPS Education
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Hệ thống luyện thi IELTS toàn diện với công nghệ AI tiên tiến, 
                cam kết đầu ra và hỗ trợ 24/7.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Language sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">www.atps.edu.vn</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: 'white',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Thông tin liên hệ
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ color: 'text.secondary', mr: 2, flexShrink: 0 }} />
                    <Typography variant="body2">
                      Tầng 5, Tòa nhà ABC, Số 123 Đường XYZ, Quận Thanh Xuân, Hà Nội
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Email sx={{ color: 'text.secondary', mr: 2, flexShrink: 0 }} />
                    <Typography variant="body2">info@atps.edu.vn</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ color: 'text.secondary', mr: 2, flexShrink: 0 }} />
                    <Typography variant="body2">1900-xxxx • 024.xxxx.xxxx</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default ContactPage;