import React from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { CheckCircle, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const pricingPlans = [
  {
    id: 1,
    name: "Cơ Bản",
    price: "0đ",
    period: "miễn phí",
    description: "Dành cho người mới bắt đầu",
    features: [
      "Truy cập khóa học miễn phí",
      "Tài liệu học tập cơ bản",
      "Diễn đàn cộng đồng",
      "Chứng chỉ hoàn thành (khóa free)",
    ],
    buttonText: "Bắt đầu ngay",
    buttonVariant: "outlined",
    popular: false,
  },
  {
    id: 2,
    name: "Chuyên Nghiệp",
    price: "299,000đ",
    period: "/ tháng",
    description: "Phù hợp với học viên nghiêm túc",
    features: [
      "Tất cả khóa học Premium",
      "Lớp học trực tuyến với giảng viên",
      "Hỗ trợ 1-1 từ giảng viên",
      "Tài liệu & bài tập nâng cao",
      "Chứng chỉ được công nhận",
      "Ưu tiên hỗ trợ 24/7",
    ],
    buttonText: "Chọn gói này",
    buttonVariant: "contained",
    popular: true,
  },
  {
    id: 3,
    name: "Doanh Nghiệp",
    price: "Liên hệ",
    period: "tùy chỉnh",
    description: "Giải pháp cho tổ chức & công ty",
    features: [
      "Tất cả tính năng Pro",
      "Quản lý đội nhóm",
      "Dashboard phân tích chi tiết",
      "Khóa học tùy chỉnh",
      "Dedicated account manager",
      "API Integration",
      "Hóa đơn VAT & hợp đồng",
    ],
    buttonText: "Liên hệ sales",
    buttonVariant: "outlined",
    popular: false,
  },
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: "grey.50", py: 10 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Chip label="BẢNG GIÁ" color="primary" sx={{ mb: 2, fontWeight: 600 }} />
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Chọn Gói Phù Hợp Với Bạn
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Minh bạch, linh hoạt và không phí ẩn
          </Typography>
        </Box>

        <Grid container spacing={4} alignItems="stretch">
          {pricingPlans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                elevation={plan.popular ? 8 : 0}
                sx={{
                  height: "100%",
                  border: plan.popular ? "2px solid" : "1px solid",
                  borderColor: plan.popular ? "primary.main" : "grey.200",
                  borderRadius: 3,
                  position: "relative",
                  transition: "all 0.3s",
                  transform: plan.popular ? "scale(1.05)" : "scale(1)",
                  "&:hover": {
                    transform: plan.popular ? "scale(1.07)" : "scale(1.02)",
                    boxShadow: 6,
                  },
                }}
              >
                {plan.popular && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "primary.main",
                      color: "white",
                      px: 3,
                      py: 0.5,
                      borderRadius: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      boxShadow: 2,
                    }}
                  >
                    <Star sx={{ fontSize: 16 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      PHỔ BIẾN NHẤT
                    </Typography>
                  </Box>
                )}

                <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", height: "100%" }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 700, textAlign: "center" }}
                  >
                    {plan.name}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", mb: 3, minHeight: "40px" }}
                  >
                    {plan.description}
                  </Typography>

                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Typography
                      variant="h3"
                      component="div"
                      sx={{ fontWeight: 700, color: "primary.main" }}
                    >
                      {plan.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {plan.period}
                    </Typography>
                  </Box>

                  <List sx={{ mb: 3, flex: 1 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle sx={{ color: "success.main", fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant={plan.buttonVariant}
                    size="large"
                    fullWidth
                    onClick={() => navigate('/courses')}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      ...(plan.buttonVariant === "contained" && {
                        backgroundColor: "primary.main",
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        },
                      }),
                    }}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography variant="body2" color="text.secondary">
            Tất cả gói đều được hỗ trợ hoàn tiền trong 7 ngày đầu tiên. <br />
            Liên hệ: <strong>support@atps.edu.vn</strong> | <strong>1900-xxxx</strong>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PricingSection;

