import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Typography,
  Pagination
} from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getPublicNewsApi } from "../../apiServices/publicNewService";
import AppHeader from "../../components/Header/AppHeader";

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 7 tin bên trái + 3 tin bên phải
  const navigate = useNavigate();

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getPublicNewsApi();
      console.log("News data:", response);
      
      if (response.success) {
        setNews(response.data || []);
      } else {
        throw new Error(response.message || "Failed to load news");
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(err.message || "Không thể tải tin tức. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    // Cuộn lên đầu trang khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleReadMore = (newsId) => {
    navigate(`/new/${newsId}`);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Tính toán phân trang
  const totalPages = Math.ceil(news.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = news.slice(startIndex, endIndex);

  // Tách tin mới (cột trái) và tin cũ (cột phải)
  const leftColumnCount = Math.ceil(currentNews.length * 0.7); // 70% tin bên trái
  const recentNews = currentNews.slice(0, leftColumnCount);
  const olderNews = currentNews.slice(leftColumnCount);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#ffffff" }}>
      <AppHeader />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Tiêu đề Bản Tin ATPS */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              color: "#49189eff",
              textTransform: "uppercase",
              letterSpacing: 2,
              mb: 1,
              fontSize: { xs: "2rem", md: "2.5rem" }
            }}
          >
          Tin Tức Sự Kiện
          </Typography>
          <Divider 
            sx={{ 
              maxWidth: 200, 
              mx: "auto", 
              borderBottomWidth: 3, 
              borderColor: "#1976d2" 
            }} 
          />
        </Box>

        {news.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Hiện chưa có tin tức nào.
          </Alert>
        ) : (
          <>
            <Grid container spacing={4}>
              {/* Cột trái - 70% - Layout ngang: Ảnh trái, Nội dung phải */}
              <Grid item xs={12} md={8.4}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {recentNews.map((item, index) => (
                    <Box key={`left-${item.NewsID}`}>
                      <Box
                        onClick={() => handleReadMore(item.NewsID)}
                        sx={{
                          display: "flex",
                          gap: 2,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            "& img": {
                              transform: "scale(1.05)"
                            },
                            "& h5": {
                              color: "#1565c0"
                            }
                          }
                        }}
                      >
                        {/* Ảnh bên trái */}
                        {item.Image && (
                          <Box 
                            sx={{ 
                              position: "relative", 
                              overflow: "hidden", 
                              borderRadius: 2,
                              flexShrink: 0,
                              width: { xs: "100%", sm: "280px" },
                              height: "200px"
                            }}
                          >
                            <img
                              src={item.Image}
                              alt={item.Title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "8px",
                                transition: "transform 0.3s ease"
                              }}
                            />
                            <Chip
                              label="Xem thêm"
                              size="small"
                              sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                bgcolor: "#4caf50",
                                color: "white",
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                height: 24,
                                px: 1.5
                              }}
                            />
                          </Box>
                        )}

                        {/* Nội dung bên phải */}
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                          <Typography
                            variant="h5"
                            component="h2"
                            sx={{
                              color: "#1976d2",
                              fontWeight: 700,
                              mb: 1.5,
                              fontSize: "1.2rem",
                              lineHeight: 1.4,
                              textTransform: "uppercase",
                              transition: "color 0.2s"
                            }}
                          >
                            {item.Title}
                          </Typography>

                          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, color: "#666" }}>
                            <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                            <Typography variant="caption" sx={{ fontSize: "0.8rem" }}>
                              {item.FormattedDate}
                            </Typography>
                          </Box>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.7,
                              fontSize: "0.9rem"
                            }}
                          >
                            {item.Excerpt}
                          </Typography>
                        </Box>
                      </Box>

                      {index < recentNews.length - 1 && (
                        <Divider sx={{ mt: 3, borderColor: "#e0e0e0" }} />
                      )}
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* Cột phải - 30% - Tin phụ */}
              <Grid item xs={12} md={3.6}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {olderNews.map((item, index) => (
                    <Box key={`right-${item.NewsID}`}>
                      <Box
                        onClick={() => handleReadMore(item.NewsID)}
                        sx={{
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            "& h6": {
                              color: "#1565c0"
                            },
                            "& img": {
                              transform: "scale(1.05)"
                            }
                          }
                        }}
                      >
                        {/* Ảnh nhỏ bên phải */}
                        {item.Image && (
                          <Box sx={{ position: "relative", overflow: "hidden", borderRadius: 1, mb: 1.5 }}>
                            <img
                              src={item.Image}
                              alt={item.Title}
                              style={{
                                width: "100%",
                                height: "180px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                transition: "transform 0.3s ease"
                              }}
                            />
                            <Chip
                              label="Xem chi tiết"
                              size="small"
                              sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                bgcolor: "#4caf50",
                                color: "white",
                                fontWeight: 600,
                                fontSize: "0.65rem",
                                height: 22,
                                px: 1.5
                              }}
                            />
                          </Box>
                        )}

                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            color: "#1976d2",
                            fontWeight: 700,
                            mb: 1,
                            fontSize: "1rem",
                            lineHeight: 1.4,
                            textTransform: "uppercase",
                            transition: "color 0.2s"
                          }}
                        >
                          {item.Title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 1,
                            lineHeight: 1.6,
                            fontSize: "0.85rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {item.Excerpt}
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "center", color: "#666" }}>
                          <CalendarToday sx={{ fontSize: 13, mr: 0.5 }} />
                          <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                            {item.FormattedDate}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {index < olderNews.length - 1 && (
                        <Divider sx={{ mt: 3, borderColor: "#e0e0e0" }} />
                      )}
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>

            {/* Phân trang */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 6, mb: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={currentPage} 
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton 
                  showLastButton
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontSize: "1rem",
                      fontWeight: 600
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default NewsPage;