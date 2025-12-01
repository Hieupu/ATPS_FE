import React, { useEffect, useState, useRef } from "react";
import { ZoomMtg } from "@zoom/meetingsdk";
import { useAuth } from "../../contexts/AuthContext";

const ZoomMeetingPage = () => {
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const meetingContainerRef = useRef(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const raw = localStorage.getItem("zoomScheduleData");
  const zoomData = raw ? JSON.parse(raw) : null;
  const raw1 = localStorage.getItem("user");
  const user = raw1 ? JSON.parse(raw1) : null;
  console.log("Zoom data:", zoomData);
  
  // Lấy signature từ backend
  const getSignature = async (meetingNumber, role) => {
    try {
      const res = await fetch("http://localhost:9999/api/zoom/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingNumber, role }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Lỗi lấy signature:", err);
      throw err;
    }
  };

  useEffect(() => {
    const loadScheduleData = () => {

      if (zoomData) {
        try {
          setSchedule(zoomData.schedule);
          // KHÔNG xóa sessionStorage ở đây để tránh race condition
        } catch (err) {
          console.error("Error parsing schedule data:", err);
          setError("Không thể tải thông tin buổi học");
          setIsLoading(false);
        }
      } else {
        setError("Không tìm thấy thông tin buổi học");
        setIsLoading(false);
      }
    };

    loadScheduleData();
  }, []);

  // Khởi tạo và join meeting
  useEffect(() => {
  const userId = zoomData?.userId ?? 0;
  if (!zoomData || !zoomData.schedule) {
    console.warn(" zoomData chưa sẵn sàng, bỏ qua initializeMeeting");
    return;
  }
  const isWithin15MinBefore = new Date() >= new Date(new Date(`${zoomData?.schedule?.Date}T${zoomData?.schedule?.StartTime}`).getTime() - 15*60*1000);
  const isWithin10MinBefore = new Date() >= new Date(new Date(`${zoomData?.schedule?.Date}T${zoomData?.schedule?.StartTime}`).getTime() - 10*60*1000);
    console.log(isWithin15MinBefore, isWithin10MinBefore, zoomData.schedule, hasInitialized, userId, user?.id);
    if (!zoomData.schedule || userId !== user.id 
      // || (zoomData.userRole !== "instructor" && !isWithin15MinBefore) || 
      //   (zoomData.userRole !== "learner" && !isWithin10MinBefore)
      ) alert("Không thể tham gia phòng học lúc này. Vui lòng kiểm tra lại thông tin hoặc thời gian tham gia phòng học.");

    const initializeMeeting = async () => {
      try {
        setIsLoading(true);
        setHasInitialized(true);

        const meetingNumber = zoomData.schedule.ZoomID;
        const passWord = zoomData.schedule.Zoompass;
        const userName = zoomData.userName;
        const userEmail = zoomData.email;
        const role = zoomData.userRole === "instructor" ? 1 : 0;

        if (!meetingNumber) {
          throw new Error("Thiếu meeting number");
        }

        // Lấy signature
        const { signature, sdkKey } = await getSignature(meetingNumber, role);

        // Khởi tạo Zoom SDK
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();

        // Khởi tạo meeting
        ZoomMtg.init({
          leaveUrl: "http://localhost:3000",
          success: (success) => {
            console.log("Init success:", success);

            // Join meeting
            ZoomMtg.join({
              sdkKey: sdkKey,
              signature: signature,
              meetingNumber: meetingNumber,
              passWord: passWord,
              userName: userName,
              userEmail: userEmail,
              tk: "",
              success: (success) => {
                console.log("Join success:", success);
                setIsLoading(false);
              },
              error: (error) => {
                console.error("Join error:", error);
                setError("Lỗi tham gia phòng học: " + error.message);
                setIsLoading(false);
              },
            });
          },
          error: (error) => {
            console.error("Init error:", error);
            setError("Lỗi khởi tạo: " + error.message);
            setIsLoading(false);
          },
        });
      } catch (err) {
        console.error("Lỗi khởi tạo meeting:", err);
        setError(err.message || "Lỗi khi tham gia phòng học");
        setIsLoading(false);
      }
    };

    initializeMeeting();

    // Cleanup function
    return () => {
      // Có thể thêm cleanup logic nếu cần
    };
  }, [schedule, user, hasInitialized]);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <h2>Lỗi</h2>
        <p>{error}</p>
        <button onClick={() => (window.location.href = "/")}>
          Quay về trang chủ
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Đang kết nối đến phòng học...</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <div
        id="meetingSDKElement"
        ref={meetingContainerRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default ZoomMeetingPage;
