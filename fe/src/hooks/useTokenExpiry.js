import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getTokenTimeLeft, clearAuth } from "../utils/auth";

export const useTokenExpiry = () => {
  const navigate = useNavigate();
  const hasShownWarning = useRef(false);
  const hasExpired = useRef(false);

  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem("token");
      const expiry = localStorage.getItem("tokenExpiry");

      if (!token || !expiry) {
        return;
      }

      const timeLeft = getTokenTimeLeft();

      if (timeLeft === 0 && !hasExpired.current) {
        hasExpired.current = true;

        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
          autoClose: 3000,
          onClose: () => {
            clearAuth();
            navigate("/auth/login");
          },
        });
        return;
      }

      if (
        timeLeft > 0 &&
        timeLeft < 5 * 60 * 1000 &&
        !hasShownWarning.current
      ) {
        hasShownWarning.current = true;
        const minutesLeft = Math.floor(timeLeft / 60000);

        toast.warning(`⚠️ Phiên đăng nhập sẽ hết hạn sau ${minutesLeft} phút`, {
          autoClose: 5000,
        });
      }

      if (timeLeft > 5 * 60 * 1000) {
        hasShownWarning.current = false;
      }
    };

    checkTokenExpiry();

    const interval = setInterval(checkTokenExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [navigate]);
};
