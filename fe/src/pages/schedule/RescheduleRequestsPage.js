import React, { useState, useEffect } from "react";
import {
  getPendingRescheduleRequestsApi,
  handleRescheduleResponseApi,
} from "../../apiServices/scheduleService";
import { useAuth } from "../../contexts/AuthContext";
import AppHeader from "../../components/Header/AppHeader";

export default function RescheduleRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRescheduleRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPendingRescheduleRequestsApi();
        setRequests(response.requests || []);
      } catch (err) {
        const errorMessage =
          err.message ||
          err.response?.data?.message ||
          "Không thể tải danh sách đề xuất đổi lịch";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadRescheduleRequests();
    }
  }, [user]);

  const handleResponse = async (sessionId, response) => {
    try {
      await handleRescheduleResponseApi(sessionId, response);
      alert(
        response === "accept"
          ? "Đã chấp nhận đề xuất đổi lịch"
          : "Đã từ chối đề xuất đổi lịch"
      );

      // Reload reschedule requests
      const response_data = await getPendingRescheduleRequestsApi();
      setRequests(response_data.requests || []);
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fe" }}>
        <AppHeader />
        <div style={{ width: "100%", padding: "40px 20px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 20px",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "4px solid #e2e8f0",
                borderTop: "4px solid #5b5bff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <p
              style={{ marginTop: "20px", color: "#64748b", fontSize: "16px" }}
            >
              Đang tải đề xuất đổi lịch...
            </p>
          </div>
          <style>
            {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
          </style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fe" }}>
        <AppHeader />
        <div style={{ width: "100%", padding: "40px 20px" }}>
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              ⚠️
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: 0,
                  color: "#dc2626",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Có lỗi xảy ra
              </h3>
              <p
                style={{
                  margin: "4px 0 0 0",
                  color: "#991b1b",
                  fontSize: "14px",
                }}
              >
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fe" }}>
      <AppHeader />
      {/* Header gradient */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "48px 0",
          marginBottom: 16,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 800,
              textAlign: "center",
            }}
          >
            Đề xuất đổi lịch học
          </h1>
          <p style={{ margin: "8px 0 0 0", opacity: 0.9, textAlign: "center" }}>
            Các đề xuất đổi lịch học đang chờ bạn xác nhận
          </p>
        </div>
      </div>

      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 24px" }}
      >
        {requests.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "#f8fafc",
              borderRadius: "16px",
              border: "2px dashed #e2e8f0",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto 20px",
                background: "#e2e8f0",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
              }}
            >
              📅
            </div>
            <h3
              style={{
                margin: "0 0 8px 0",
                color: "#1e293b",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Không có đề xuất đổi lịch nào
            </h3>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
              Các đề xuất đổi lịch học sẽ hiển thị ở đây
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {Object.values(
              requests.reduce((acc, cur) => {
                const key =
                  cur.ClassID || cur.EnrollmentID || `s_${cur.SessionID}`;
                if (!acc[key]) {
                  acc[key] = {
                    key,
                    ClassID: cur.ClassID,
                    ClassName: cur.ClassName,
                    title: cur.ClassName,
                    items: [],
                  };
                }
                acc[key].items.push(cur);
                return acc;
              }, {})
            ).map((group) => (
              <div
                key={group.key}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "28px",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ marginBottom: 20 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    {group.title}
                  </h3>
                  <div style={{ marginTop: 4, color: "#64748b", fontSize: 14 }}>
                    <strong>Lớp học:</strong> {group.ClassName}
                  </div>
                </div>

                {group.items && group.items.length > 0 && (
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      borderRadius: "12px",
                      padding: "20px",
                      marginBottom: "20px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {/* Lịch cũ - hiển thị theo từng mục trong nhóm */}
                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: 6,
                        }}
                      >
                        Lịch cũ
                      </div>
                      <ul
                        style={{ margin: 0, paddingLeft: 18, color: "#ef4444" }}
                      >
                        {group.items.map((it, idx) => (
                          <li
                            key={`old-${group.key}-${idx}`}
                            style={{ fontWeight: 600, fontSize: 14 }}
                          >
                            {it.rescheduleInfo?.oldSchedule ||
                              "Chưa có thông tin"}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Lịch mới đề xuất - theo nhóm */}
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: 6,
                        }}
                      >
                        Lịch mới đề xuất
                      </div>
                      <ul
                        style={{ margin: 0, paddingLeft: 18, color: "#065f46" }}
                      >
                        {group.items.map((it, idx) => (
                          <li
                            key={`new-${group.key}-${idx}`}
                            style={{ fontWeight: 600, fontSize: 14 }}
                          >
                            {it.rescheduleInfo?.newSchedule ||
                              "Chưa có thông tin"}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {group.items[0]?.rescheduleInfo?.reason && (
                      <div
                        style={{
                          paddingTop: "12px",
                          borderTop: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "4px",
                          }}
                        >
                          Lý do
                        </div>
                        <div style={{ color: "#1e293b", fontSize: "14px" }}>
                          {group.items[0]?.rescheduleInfo?.reason}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() =>
                      handleResponse(group.items[0]?.SessionID, "accept")
                    }
                    style={{
                      padding: "12px 24px",
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#059669";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 6px rgba(16, 185, 129, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#10b981";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span>✓</span> Chấp nhận
                  </button>
                  <button
                    onClick={() =>
                      handleResponse(group.items[0]?.SessionID, "reject")
                    }
                    style={{
                      padding: "12px 24px",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#dc2626";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 6px rgba(239, 68, 68, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ef4444";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span>✕</span> Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
