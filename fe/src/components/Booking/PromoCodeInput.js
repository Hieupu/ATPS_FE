import React from "react";
import {
  TextField,
  InputAdornment,
  Button,
  Alert,
} from "@mui/material";
import DiscountIcon from "@mui/icons-material/LocalOffer";

const PromoCodeInput = ({
  promoCode,
  setPromoCode,
  promoApplying,
  handleApplyPromo,
  promoInfo,
}) => {
  return (
    <>
      <TextField
        fullWidth
        label="Mã giảm giá (không bắt buộc)"
        placeholder="Nhập mã giảm giá"
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value)}
        sx={{ mb: 1.5 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <DiscountIcon color="primary" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Button
                size="small"
                onClick={handleApplyPromo}
                disabled={promoApplying}
              >
                {promoApplying ? "Đang áp dụng..." : "Áp dụng"}
              </Button>
            </InputAdornment>
          ),
        }}
      />
      {promoInfo && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Đã áp dụng mã {promoInfo.code} (giảm {promoInfo.discountPercent}%)
        </Alert>
      )}
    </>
  );
};

export default PromoCodeInput;