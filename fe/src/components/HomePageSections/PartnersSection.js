import React from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
} from '@mui/material';

const partners = [
  {
    id: 1,
    name: "FPT Software",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/2560px-FPT_logo_2010.svg.png",
  },
  {
    id: 2,
    name: "VNG Corporation",
    logo: "https://mondialbrand.com/wp-content/uploads/2024/02/vng_corporation-logo_brandlogos.net_ysr15.png",
  },
  {
    id: 3,
    name: "Viettel",
    logo: "https://vietnamvision.vn/wp-content/uploads/2024/06/viettel-logo-1.png",
  },
  {
    id: 4,
    name: "Tiki",
    logo: "https://salt.tikicdn.com/ts/upload/e4/49/6c/270be9859abd5f5ec5071da65fab0a94.png",
  },
  {
    id: 5,
    name: "Shopee",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2560px-Shopee.svg.png",
  },
  {
    id: 6,
    name: "Grab",
    logo: "https://thicao.com/wp-content/uploads/2019/07/logo-moi-cua-grab.jpg",
  },
];

const PartnersSection = () => {
  return (
    <Container maxWidth="lg" sx={{ my: 10 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 700, color: "text.secondary" }}
        >
          Được Tin Dùng Bởi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Đối tác và doanh nghiệp hàng đầu Việt Nam
        </Typography>
      </Box>

      <Grid container spacing={4} alignItems="center" justifyContent="center">
        {partners.map((partner) => (
          <Grid item xs={6} sm={4} md={2} key={partner.id}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "80px",
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 2,
                transition: "all 0.3s",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "translateY(-4px)",
                  boxShadow: 2,
                },
              }}
            >
              <Box
                component="img"
                src={partner.logo}
                alt={partner.name}
                sx={{
                  maxWidth: "100%",
                  maxHeight: "50px",
                  objectFit: "contain",
                  filter: "grayscale(100%)",
                  opacity: 0.6,
                  transition: "all 0.3s",
                  "&:hover": {
                    filter: "grayscale(0%)",
                    opacity: 1,
                  },
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
          và hơn 200+ doanh nghiệp khác trên toàn quốc
        </Typography>
      </Box>
    </Container>
  );
};

export default PartnersSection;

