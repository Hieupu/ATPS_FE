import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Divider,
  Paper,
  Card,
  CardMedia,
  CardContent,
  Grid
} from "@mui/material";
import { CalendarToday, ArrowBack, Share, Print, ArrowForward } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { getNewsDetailApi, getPublicNewsApi } from "../../apiServices/publicNewService";
import AppHeader from "../../components/Header/AppHeader";

const NewsDetailPage = () => {
  const { newsId } = useParams();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getNewsDetailApi(newsId);
      console.log("News detail:", response);
      
      if (response.success) {
        setNews(response.data);
      } else {
        throw new Error(response.message || "News not found");
      }
    } catch (err) {
      console.error("Error fetching news detail:", err);
      setError(err.message || "Không thể tải chi tiết tin tức.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedNews = async () => {
    try {
      setLoadingRelated(true);
      const response = await getPublicNewsApi({ page: 1, pageSize: 4 });
      
      console.log("Related news response:", response);
      
      if (response.success && Array.isArray(response.data)) {
        // Filter out current news from related news
        const filtered = response.data.filter(item => item.NewsID !== parseInt(newsId));
        console.log("Filtered related news:", filtered);
        setRelatedNews(filtered.slice(0, 3));
      }
    } catch (err) {
      console.error("Error fetching related news:", err);
    } finally {
      setLoadingRelated(false);
    }
  };

  useEffect(() => {
    if (newsId) {
      fetchNewsDetail();
      fetchRelatedNews();
    }
  }, [newsId]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news.Title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép link vào clipboard!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReadMore = (id) => {
    navigate(`/new/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh",
        flexDirection: "column",
        gap: 2
      }}>
        <CircularProgress size={50} />
        <Typography color="text.secondary">Đang tải tin tức...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Container>
    );
  }

  if (!news) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Tin tức không tồn tại hoặc đã bị xóa.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      <AppHeader />
      
      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Back Button */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/new")}
            sx={{
              color: "#1976d2",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
              "&:hover": {
                bgcolor: "rgba(25, 118, 210, 0.08)"
              }
            }}
          >
            Quay lại danh sách tin tức
          </Button>
        </Box>

        <Paper 
          elevation={0}
          sx={{ 
            bgcolor: "white",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
          }}
        >
          {/* Header Section */}
          <Box sx={{ px: { xs: 3, md: 6 }, pt: { xs: 3, md: 5 }, pb: 3 }}>
            {/* Category Badge */}
            <Chip
              label="Tin Tức Sự Kiện"
              size="small"
              sx={{
                bgcolor: "#e3f2fd",
                color: "#1976d2",
                fontWeight: 600,
                fontSize: "0.8rem",
                height: 28,
                mb: 3,
                px: 2
              }}
            />

            {/* Title */}
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                mb: 3,
                fontWeight: 700,
                color: "#1a237e",
                lineHeight: 1.3,
                fontSize: { xs: "1.8rem", md: "2.5rem" }
              }}
            >
              {news.Title}
            </Typography>

            {/* Meta Information */}
            <Box sx={{ 
              display: "flex", 
              alignItems: "center",
              flexWrap: "wrap",
              gap: 3,
              mb: 3
            }}>
              <Box sx={{ display: "flex", alignItems: "center", color: "#666" }}>
                <CalendarToday sx={{ fontSize: 18, mr: 1 }} />
                <Typography variant="body2" sx={{ fontSize: "0.95rem" }}>
                  {news.FormattedDate}
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
                <Button
                  size="small"
                  startIcon={<Share />}
                  onClick={handleShare}
                  sx={{
                    textTransform: "none",
                    color: "#1976d2",
                    "&:hover": {
                      bgcolor: "rgba(25, 118, 210, 0.08)"
                    }
                  }}
                >
                  Chia sẻ
                </Button>
                <Button
                  size="small"
                  startIcon={<Print />}
                  onClick={handlePrint}
                  sx={{
                    textTransform: "none",
                    color: "#1976d2",
                    "&:hover": {
                      bgcolor: "rgba(25, 118, 210, 0.08)"
                    }
                  }}
                >
                  In
                </Button>
              </Box>
            </Box>

            <Divider />
          </Box>

          {/* Featured Image */}
          {news.Image && (
            <Box 
              sx={{ 
                px: { xs: 3, md: 6 },
                pb: { xs: 3, md: 4 }
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.01)"
                  }
                }}
              >
                <img
                  src={news.Image}
                  alt={news.Title}
                  style={{ 
                    width: "100%", 
                    maxHeight: "500px", 
                    objectFit: "cover",
                    display: "block"
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Content Section */}
          <Box sx={{ 
            px: { xs: 3, md: 6 },
            pb: { xs: 4, md: 6 }
          }}>
            {/* Excerpt */}
            {news.Excerpt && (
              <Box 
                sx={{ 
                  bgcolor: "#f5f7fa",
                  p: 3,
                  borderRadius: 2,
                  borderLeft: "4px solid #1976d2",
                  mb: 4
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: "1.1rem",
                    lineHeight: 1.8,
                    color: "#555",
                    fontStyle: "italic"
                  }}
                >
                  {news.Excerpt}
                </Typography>
              </Box>
            )}

            {/* Main Content */}
            <Box 
              sx={{ 
                "& p": {
                  fontSize: "1.05rem",
                  lineHeight: 1.9,
                  color: "#333",
                  mb: 2.5
                },
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 2,
                  my: 3,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                },
                "& h1, & h2, & h3, & h4, & h5, & h6": {
                  color: "#1a237e",
                  fontWeight: 700,
                  mt: 4,
                  mb: 2
                },
                "& ul, & ol": {
                  pl: 3,
                  mb: 2.5,
                  "& li": {
                    mb: 1,
                    lineHeight: 1.8
                  }
                },
                "& a": {
                  color: "#1976d2",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline"
                  }
                },
                "& blockquote": {
                  borderLeft: "4px solid #1976d2",
                  pl: 3,
                  py: 1,
                  my: 3,
                  bgcolor: "#f5f7fa",
                  fontStyle: "italic"
                }
              }}
              dangerouslySetInnerHTML={{ __html: news.Content }} 
            />
          </Box>
        </Paper>

        {/* Related News Section */}
        {relatedNews.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 4,
                fontWeight: 700,
                color: "#1a237e",
                fontSize: { xs: "1.5rem", md: "2rem" }
              }}
            >
              Tin tức liên quan
            </Typography>

            {loadingRelated ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {relatedNews.map((item) => (
                  <Grid item xs={12} md={4} key={item.NewsID}>
                    <Card 
                      sx={{ 
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 3,
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                        cursor: "pointer",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
                        }
                      }}
                      onClick={() => handleReadMore(item.NewsID)}
                    >
                      {item.Image && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={item.Image}
                          alt={item.Title}
                          sx={{ 
                            objectFit: "cover",
                            transition: "transform 0.3s ease"
                          }}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            mb: 2,
                            fontWeight: 600,
                            color: "#1a237e",
                            lineHeight: 1.4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical"
                          }}
                        >
                          {item.Title}
                        </Typography>

                        {item.Excerpt && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              mb: 2,
                              lineHeight: 1.6,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical"
                            }}
                          >
                            {item.Excerpt}
                          </Typography>
                        )}

                        <Box sx={{ 
                          display: "flex", 
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: "auto"
                        }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: "#666",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                            {item.FormattedDate}
                          </Typography>

                          <Button
                            size="small"
                            endIcon={<ArrowForward />}
                            sx={{
                              textTransform: "none",
                              color: "#1976d2",
                              fontWeight: 600,
                              "&:hover": {
                                bgcolor: "rgba(25, 118, 210, 0.08)"
                              }
                            }}
                          >
                            Đọc thêm
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default NewsDetailPage;