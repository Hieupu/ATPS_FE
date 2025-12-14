import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  InputAdornment,
  Divider,
  Collapse
} from "@mui/material";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const RefundDialog = ({
  open,
  payment,
  refundReason,
  onRefundReasonChange,
  onClose,
  onSubmit
}) => {
  const [bankList, setBankList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [reasonType, setReasonType] = useState("");
  const [otherBankOpen, setOtherBankOpen] = useState(false);
  const [otherBankName, setOtherBankName] = useState("");

  // Danh sách lý do mặc định
  const reasonOptions = [
    "Không thể tham gia lớp học",
    "Chất lượng khóa học không đạt",
    "Thời gian không phù hợp",
    "Phương pháp giảng dạy không phù hợp",
    "Lý do cá nhân",
    "Lý do khác"
  ];

  const OTHER_BANK_OPTION = {
    code: "OTHER",
    name: "Khác",
    shortName: "Ngân hàng khác",
    popular: false,
    logo: ""
  };

const defaultBanks = [
  // ===== NGÂN HÀNG PHỔ BIẾN (popular: true) =====
  { code: "VCB", name: "Vietcombank", shortName: "VCB", popular: true },
  { code: "BIDV", name: "BIDV", shortName: "BIDV", popular: true },
  { code: "CTGV", name: "VietinBank", shortName: "CTG", popular: true },
  { code: "AGB", name: "Agribank", shortName: "AGB", popular: true },
  { code: "ACB", name: "ACB", shortName: "ACB", popular: true },
  { code: "TCB", name: "Techcombank", shortName: "TCB", popular: true },
  { code: "MB", name: "MB Bank", shortName: "MB", popular: true },
  { code: "VPB", name: "VPBank", shortName: "VPB", popular: true },
  { code: "VIB", name: "VIB", shortName: "VIB", popular: true },
  { code: "TPB", name: "TPBank", shortName: "TPB", popular: true },
  { code: "STB", name: "Sacombank", shortName: "STB", popular: true },
  { code: "HDB", name: "HDBank", shortName: "HDB", popular: true },
  { code: "MSB", name: "MSB", shortName: "MSB", popular: true },
  { code: "OCB", name: "OCB", shortName: "OCB", popular: true },
  { code: "SCB", name: "SCB", shortName: "SCB", popular: true },
  { code: "EIB", name: "Eximbank", shortName: "EIB", popular: true },
  { code: "SHB", name: "SHB", shortName: "SHB", popular: true },
  { code: "SEAB", name: "SeABank", shortName: "SEA", popular: true },
  { code: "NAB", name: "Nam A Bank", shortName: "NAB", popular: true },
  { code: "BAB", name: "Bac A Bank", shortName: "BAB", popular: true },
  
  // ===== NGÂN HÀNG 100% VỐN NƯỚC NGOÀI =====
  { code: "HSBC", name: "HSBC Vietnam", shortName: "HSBC", popular: false },
  { code: "CITI", name: "Citibank", shortName: "CITI", popular: false },
  { code: "SCVN", name: "Standard Chartered", shortName: "SC", popular: false },
  { code: "ANZV", name: "ANZ Vietnam", shortName: "ANZ", popular: false },
  { code: "SHBVN", name: "Shinhan Bank", shortName: "SHINHAN", popular: false },
  { code: "KEBVN", name: "KEB Hana Bank", shortName: "KEB HANA", popular: false },
  { code: "WOORI", name: "Woori Bank", shortName: "WOORI", popular: false },
  { code: "CIMB", name: "CIMB Bank", shortName: "CIMB", popular: false },
  { code: "UOB", name: "UOB Vietnam", shortName: "UOB", popular: false },
  { code: "PUBVN", name: "Public Bank Vietnam", shortName: "PUB", popular: false },
  { code: "HLBVN", name: "Hong Leong Bank", shortName: "HLB", popular: false },
  
  // ===== NGÂN HÀNG LIÊN DOANH =====
  { code: "IVB", name: "Indovina Bank", shortName: "IVB", popular: false },
  { code: "VID", name: "VID Public", shortName: "VID", popular: false },
  
  // ===== NGÂN HÀNG CHÍNH SÁCH =====
  { code: "VBSP", name: "VBSP", shortName: "VBSP", popular: false },
  { code: "VBARD", name: "Ngân hàng Phát triển Việt Nam", shortName: "VDB", popular: false },
  
  // ===== NGÂN HÀNG THƯƠNG MẠI CỔ PHẦN KHÁC =====
  { code: "VAB", name: "Viet A Bank", shortName: "VAB", popular: false },
  { code: "ABB", name: "ABBank", shortName: "ABB", popular: false },
  { code: "PGB", name: "PG Bank", shortName: "PGB", popular: false },
  { code: "BVB", name: "Bao Viet Bank", shortName: "BVB", popular: false },
  { code: "KLB", name: "Kien Long Bank", shortName: "KLB", popular: false },
  { code: "NVB", name: "National Citizen Bank", shortName: "NCB", popular: false },
  { code: "OJB", name: "Ocean Bank", shortName: "OJB", popular: false },
  { code: "GPB", name: "GPBank", shortName: "GPB", popular: false },
  { code: "VCCB", name: "Viet Capital Bank", shortName: "VCCB", popular: false },
  { code: "SGB", name: "Saigonbank", shortName: "SGB", popular: false },
  { code: "DAB", name: "Dong A Bank", shortName: "DAB", popular: false },
  { code: "LVB", name: "Lien Viet Post Bank", shortName: "LVB", popular: false },
  { code: "CBB", name: "CBBank", shortName: "CBB", popular: false },
  { code: "COOPBANK", name: "Co-op Bank", shortName: "COOP", popular: false },
  { code: "VRB", name: "Vietnam Russia Bank", shortName: "VRB", popular: false },
  { code: "VNAS", name: "Vietnam - Asia Bank", shortName: "VNAS", popular: false },
  { code: "PVB", name: "PVcomBank", shortName: "PVB", popular: false },
  { code: "CAKE", name: "CAKE by VPBank", shortName: "CAKE", popular: false },
  { code: "UBANK", name: "UBank", shortName: "UBANK", popular: false },
  { code: "TIMO", name: "Timo", shortName: "TIMO", popular: false },
  
  // ===== CÔNG TY TÀI CHÍNH =====
  { code: "FEC", name: "FE Credit", shortName: "FEC", popular: false },
  { code: "HCFC", name: "HD SAISON", shortName: "HCFC", popular: false },
  { code: "MCREDIT", name: "M Credit", shortName: "MCREDIT", popular: false },
  { code: "JACCS", name: "JACCS Vietnam", shortName: "JACCS", popular: false },
  
  // ===== VÍ ĐIỆN TỬ =====
  { code: "MOMO", name: "Ví MoMo", shortName: "MOMO", popular: false },
  { code: "ZALOPAY", name: "ZaloPay", shortName: "ZALOPAY", popular: false },
  { code: "VNPAY", name: "VNPAY", shortName: "VNPAY", popular: false },
  { code: "PAYOO", name: "Payoo", shortName: "PAYOO", popular: false },
  { code: "VIETTELPAY", name: "ViettelPay", shortName: "VIETTELPAY", popular: false },
  { code: "VNPTPAY", name: "VNPT Pay", shortName: "VNPTPAY", popular: false },
  { code: "SHOPEEPAY", name: "ShopeePay", shortName: "SHOPEEPAY", popular: false }
];

const fetchBanks = async () => {
  setLoading(true);
  try {
    const response = await fetch("https://api.vietqr.io/v2/banks");
    if (response.ok) {
      const data = await response.json();
      if (data?.data) {
        const banks = data.data
          .filter(bank => bank.isTransfer === 1)
          .map(bank => {
            // Tìm ngân hàng trong defaultBanks để lấy thông tin popular
            const defaultBank = defaultBanks.find(b => b.code === bank.code);
            
            // Map tên ngân hàng sang dạng thân thiện và chuẩn hóa
            let friendlyName = bank.name;
            
             if (bank.code === "VCB") friendlyName = "Vietcombank";
            else if (bank.code === "BIDV") friendlyName = "BIDV";
            else if (bank.code === "CTGV") friendlyName = "VietinBank";
            else if (bank.code === "AGB") friendlyName = "Agribank";
            
            // === NGÂN HÀNG TMCP TOP ===
            else if (bank.code === "TCB") friendlyName = "Techcombank";
            else if (bank.code === "ACB") friendlyName = "ACB";
            else if (bank.code === "MB") friendlyName = "MB Bank";
            else if (bank.code === "VPB") friendlyName = "VPBank";
            else if (bank.code === "TPB") friendlyName = "TPBank";
            else if (bank.code === "HDB") friendlyName = "HDBank";
            else if (bank.code === "VIB") friendlyName = "VIB";
            else if (bank.code === "MSB") friendlyName = "MSB";
            else if (bank.code === "OCB") friendlyName = "OCB";
            else if (bank.code === "SCB") friendlyName = "SCB";
            else if (bank.code === "SHB") friendlyName = "SHB";
            
            // === NGÂN HÀNG TMCP KHÁC ===
            else if (bank.code === "VAB") friendlyName = "Viet A Bank";
            else if (bank.code === "NAB") friendlyName = "Nam A Bank";
            else if (bank.code === "BAB") friendlyName = "Bac A Bank";
            else if (bank.code === "ABB") friendlyName = "ABBank";
            else if (bank.code === "PGB") friendlyName = "PG Bank";
            else if (bank.code === "BVB") friendlyName = "Bao Viet Bank";
            else if (bank.code === "EIB") friendlyName = "Eximbank";
            else if (bank.code === "STB") friendlyName = "Sacombank";
            else if (bank.code === "SEAB") friendlyName = "SeABank";
            else if (bank.code === "KLB") friendlyName = "Kien Long Bank";
            else if (bank.code === "NVB") friendlyName = "National Citizen Bank";
            else if (bank.code === "OJB") friendlyName = "Ocean Bank";
            else if (bank.code === "GPB") friendlyName = "GPBank";
            else if (bank.code === "VCCB") friendlyName = "Viet Capital Bank";
            else if (bank.code === "SGB") friendlyName = "Saigonbank";
            else if (bank.code === "DAB") friendlyName = "Dong A Bank";
            else if (bank.code === "LVB") friendlyName = "Lien Viet Post Bank";
            else if (bank.code === "CBB") friendlyName = "CBBank";
            else if (bank.code === "PVB") friendlyName = "PVcomBank";
            
            // === NGÂN HÀNG SỐ (DIGITAL BANKS) ===
            else if (bank.code === "CAKE") friendlyName = "CAKE by VPBank";
            else if (bank.code === "UBANK") friendlyName = "UBank";
            else if (bank.code === "TIMO") friendlyName = "Timo";
            
            // === NGÂN HÀNG 100% VỐN NƯỚC NGOÀI ===
            else if (bank.code === "HSBC") friendlyName = "HSBC Vietnam";
            else if (bank.code === "CITI") friendlyName = "Citibank";
            else if (bank.code === "SCVN") friendlyName = "Standard Chartered";
            else if (bank.code === "ANZV") friendlyName = "ANZ Vietnam";
            else if (bank.code === "SHBVN") friendlyName = "Shinhan Bank";
            else if (bank.code === "KEBVN") friendlyName = "KEB Hana Bank";
            else if (bank.code === "WOORI") friendlyName = "Woori Bank";
            else if (bank.code === "CIMB") friendlyName = "CIMB Bank";
            else if (bank.code === "UOB") friendlyName = "UOB Vietnam";
            else if (bank.code === "PUBVN") friendlyName = "Public Bank Vietnam";
            else if (bank.code === "HLBVN") friendlyName = "Hong Leong Bank";
            
            // === NGÂN HÀNG LIÊN DOANH ===
            else if (bank.code === "IVB") friendlyName = "Indovina Bank";
            else if (bank.code === "VID") friendlyName = "VID Public";
            
            // === NGÂN HÀNG CHÍNH SÁCH & PHÁT TRIỂN ===
            else if (bank.code === "VBSP") friendlyName = "VBSP";
            else if (bank.code === "VBARD" || bank.code === "VDB") friendlyName = "Vietnam Development Bank";
            else if (bank.code === "VRB") friendlyName = "Vietnam Russia Bank";
            else if (bank.code === "VNAS") friendlyName = "Vietnam - Asia Bank";
            
            // === NGÂN HÀNG HỢP TÁC XÃ ===
            else if (bank.code === "COOPBANK") friendlyName = "Co-op Bank";
            
            // === CÔNG TY TÀI CHÍNH ===
            else if (bank.code === "FEC") friendlyName = "FE Credit";
            else if (bank.code === "HCFC") friendlyName = "HD SAISON";
            else if (bank.code === "MCREDIT") friendlyName = "M Credit";
            else if (bank.code === "JACCS") friendlyName = "JACCS Vietnam";
            
            // === VÍ ĐIỆN TỬ ===
            else if (bank.code === "MOMO") friendlyName = "Ví MoMo";
            else if (bank.code === "ZALOPAY") friendlyName = "ZaloPay";
            else if (bank.code === "VNPAY") friendlyName = "VNPAY";
            else if (bank.code === "PAYOO") friendlyName = "Payoo";
            else if (bank.code === "VIETTELPAY") friendlyName = "ViettelPay";
            else if (bank.code === "VNPTPAY") friendlyName = "VNPT Pay";
            else if (bank.code === "SHOPEEPAY") friendlyName = "ShopeePay";
            
            // Loại bỏ các từ không cần thiết để tên gọn gàng hơn
            friendlyName = friendlyName
              .replace(/Ngân hàng Thương mại Cổ phần /gi, "")
              .replace(/Ngân hàng TMCP /gi, "")
              .replace(/Ngân hàng /gi, "")
              .replace(/NHTMCP /gi, "")
              .replace(/NH /gi, "")
              .replace(/Joint Stock Commercial Bank/gi, "")
              .replace(/Commercial Joint Stock Bank/gi, "")
              .replace(/\s+/g, " ") // Loại bỏ khoảng trắng thừa
              .trim();
            
            return {
              code: bank.code,
              name: friendlyName,
              shortName: bank.shortName || bank.code,
              popular: defaultBank?.popular || false,
              bin: bank.bin || "",
              logo: bank.logo || "",
            };
          });
        
        // Thêm option "Khác" vào cuối danh sách
        const banksWithOther = [...banks, OTHER_BANK_OPTION]
          .sort((a, b) => {
            // Đảm bảo "Khác" luôn ở cuối
            if (a.code === "OTHER") return 1;
            if (b.code === "OTHER") return -1;
            
            // Sắp xếp: popular trước, sau đó theo tên
            if (a.popular && !b.popular) return -1;
            if (!a.popular && b.popular) return 1;
            return a.name.localeCompare(b.name, 'vi');
          });
        
        setBankList(banksWithOther);
        return;
      }
    }
    
    // Fallback: Sử dụng defaultBanks đã sắp xếp và thêm "Khác"
    const sortedDefaultBanks = [...defaultBanks, OTHER_BANK_OPTION].sort((a, b) => {
      if (a.code === "OTHER") return 1;
      if (b.code === "OTHER") return -1;
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.name.localeCompare(b.name, 'vi');
    });
    setBankList(sortedDefaultBanks);
    
  } catch (err) {
    console.warn("Error fetching banks, using fallback list:", err);
    // Fallback: Sử dụng defaultBanks đã sắp xếp và thêm "Khác"
    const sortedDefaultBanks = [...defaultBanks, OTHER_BANK_OPTION].sort((a, b) => {
      if (a.code === "OTHER") return 1;
      if (b.code === "OTHER") return -1;
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.name.localeCompare(b.name, 'vi');
    });
    setBankList(sortedDefaultBanks);
  } finally {
    setLoading(false);
  }
};

  // Cập nhật mô tả tự động
const updateDescription = () => {
  const lines = [];

  // Thêm lý do
  if (reasonType) {
    lines.push(`Lý do: ${reasonType}`);
  }

  // Thêm thông tin ngân hàng
  if (selectedBank || accountNumber || accountHolder) {
    const bankInfo = [];
    
    if (selectedBank) {
      const bank = bankList.find(b => b.name === selectedBank);
      if (selectedBank === "Khác" && otherBankName) {
        bankInfo.push(otherBankName);
      } else {
        bankInfo.push(bank?.shortName || selectedBank);
      }
    }
    
    // Tách thông tin ngân hàng thành các dòng riêng
    if (selectedBank) {
      lines.push(`Ngân hàng: ${bankInfo[0] || ''}`);
    }
    
    if (accountNumber) {
      lines.push(`Số tài khoản: ${accountNumber}`);
    }
    
    if (accountHolder) {
      lines.push(`Người thụ hưởng: ${accountHolder}`);
    }
  }

  // Nối các dòng với dấu xuống dòng
  onRefundReasonChange(lines.join("\n"));
};

  // Xử lý thay đổi ngân hàng
  const handleBankChange = (e) => {
    const value = e.target.value;
    setSelectedBank(value);
    
    // Reset tên ngân hàng khác khi chọn không phải "Khác"
    if (value !== "Khác") {
      setOtherBankName("");
      setOtherBankOpen(false);
    } else {
      setOtherBankOpen(true);
    }
  };

  // Xử lý thay đổi tên ngân hàng khác
  const handleOtherBankNameChange = (e) => {
    setOtherBankName(e.target.value);
  };

  const handleReasonChange = (e) => {
    setReasonType(e.target.value);
  };

  const handleAccountNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setAccountNumber(value);
  };

  const handleAccountHolderChange = (e) => {
    setAccountHolder(e.target.value);
  };

  // Reset form
  const resetForm = () => {
    setReasonType("");
    setSelectedBank("");
    setAccountNumber("");
    setAccountHolder("");
    setOtherBankOpen(false);
    setOtherBankName("");
    setError(null);
    onRefundReasonChange("");
  };

  // Xử lý đóng dialog
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Validate form
  const validateForm = () => {
    // Kiểm tra lý do
    if (!reasonType) {
      return "Vui lòng chọn lý do hoàn tiền";
    }

    // Kiểm tra ngân hàng
    if (!selectedBank) {
      return "Vui lòng chọn ngân hàng";
    }

    // Nếu chọn "Khác", kiểm tra tên ngân hàng
    if (selectedBank === "Khác" && !otherBankName.trim()) {
      return "Vui lòng nhập tên ngân hàng";
    }

    // Kiểm tra số tài khoản
    if (!accountNumber) {
      return "Vui lòng nhập số tài khoản";
    }
    
    if (accountNumber.length < 8) {
      return "Số tài khoản phải có ít nhất 8 chữ số";
    }

    // Kiểm tra tên người thụ hưởng
    if (!accountHolder) {
      return "Vui lòng nhập tên người thụ hưởng";
    }
    
    if (accountHolder.trim().length < 3) {
      return "Tên người thụ hưởng phải có ít nhất 3 ký tự";
    }

    return null;
  };

  // Xử lý submit
  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const bankName = selectedBank === "Khác" ? otherBankName : selectedBank;
    const bankShortName = selectedBank === "Khác" ? otherBankName : 
      (bankList.find(b => b.name === selectedBank)?.shortName || selectedBank);

    const refundData = {
      reason: refundReason,
      bank: bankName,
      bankShortName: bankShortName,
      accountNumber,
      accountHolder,
      paymentId: payment?.id,
      isOtherBank: selectedBank === "Khác"
    };

    onSubmit(refundData);
    resetForm();
  };

  // Gọi API khi mở dialog
  useEffect(() => {
    if (open) {
      fetchBanks();
    }
  }, [open]);

  // Cập nhật mô tả khi có thay đổi
  useEffect(() => {
    if (open) {
      updateDescription();
    }
  }, [reasonType, selectedBank, otherBankName, accountNumber, accountHolder]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        pb: 2,
        fontWeight: 600,
        fontSize: '1.25rem',
        backgroundColor: 'rgba(33, 150, 243, 0.04)',
        px: 3,
        pt: 3
      }}>
        Yêu cầu hoàn tiền
      </DialogTitle>

      <DialogContent sx={{ pt: 3, px: 3 }}>
        {/* Thông tin thanh toán */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            mb: 3, 
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 1
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
            Thông tin thanh toán
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {payment?.Enrollment?.Class?.Name || payment?.ClassName || 'Không có thông tin'}
          </Typography>
          {payment?.amount && (
            <Typography variant="body2" color="primary" sx={{ mt: 0.5, fontWeight: 500 }}>
              Số tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)}
            </Typography>
          )}
        </Paper>

        <Grid container spacing={3}>
          {/* Lý do hoàn tiền */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Lý do hoàn tiền *
              </Typography>
              <TextField
                select
                fullWidth
                size="medium"
                value={reasonType}
                onChange={handleReasonChange}
                placeholder="Chọn lý do hoàn tiền"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      }
                    }
                  }
                }}
              >
                <MenuItem value="" disabled>
                  Chọn lý do hoàn tiền
                </MenuItem>
                {reasonOptions.map((reason) => (
                  <MenuItem key={reason} value={reason} sx={{ py: 1.5 }}>
                    {reason}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Grid>

          {/* Thông tin ngân hàng */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Thông tin ngân hàng nhận hoàn tiền *
            </Typography>
            
            <Grid container spacing={2}>
              {/* Ngân hàng */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  size="medium"
                  label="Ngân hàng"
                  value={selectedBank}
                  onChange={handleBankChange}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalanceIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: loading && <CircularProgress size={20} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    {loading ? 'Đang tải danh sách ngân hàng...' : 'Chọn ngân hàng'}
                  </MenuItem>
                  {bankList.map((bank) => (
                    <MenuItem 
                      key={bank.code} 
                      value={bank.name}
                      sx={{ 
                        py: 1.5,
                        borderBottom: bank.popular ? '2px solid rgba(33, 150, 243, 0.1)' : 'none',
                        color: bank.code === "OTHER" ? 'text.secondary' : 'inherit',
                        backgroundColor: bank.code === "OTHER" ? 'rgba(0, 0, 0, 0.02)' : 'inherit',
                        '&:hover': {
                          backgroundColor: bank.code === "OTHER" ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body1" sx={{ 
                          fontStyle: bank.code === "OTHER" ? 'italic' : 'normal',
                          fontWeight: bank.code === "OTHER" ? 500 : 'normal'
                        }}>
                          {bank.name}
                        </Typography>
                        {bank.code === "OTHER" && (
                          <Typography variant="caption" color="text.secondary">
                            Chọn nếu không tìm thấy ngân hàng của bạn
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Field nhập tên ngân hàng khác */}
              <Grid item xs={12}>
                <Collapse in={selectedBank === "Khác"} timeout="auto" unmountOnExit>
                  <TextField
                    fullWidth
                    size="medium"
                    label="Tên ngân hàng"
                    value={otherBankName}
                    onChange={handleOtherBankNameChange}
                    placeholder="Nhập tên ngân hàng của bạn..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountBalanceIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                      mb: 2
                    }}
                    helperText="Vui lòng nhập chính xác tên ngân hàng để đảm bảo hoàn tiền thành công"
                  />
                </Collapse>
              </Grid>

              {/* Số tài khoản và Tên người thụ hưởng */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="medium"
                  label="Số tài khoản"
                  value={accountNumber}
                  onChange={handleAccountNumberChange}
                  placeholder="Nhập số tài khoản"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCardIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Chỉ nhập số, không bao gồm ký tự đặc biệt
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="medium"
                  label="Tên người thụ hưởng"
                  value={accountHolder}
                  onChange={handleAccountHolderChange}
                  placeholder="Nhập tên chủ tài khoản"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircleIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Tên đầy đủ như trong tài khoản ngân hàng
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Tóm tắt yêu cầu */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Tóm tắt yêu cầu
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={5} 
                value={refundReason}
                onChange={(e) => onRefundReasonChange(e.target.value)}
                placeholder="Thông tin sẽ được tự động điền khi bạn nhập đủ thông tin bên trên..."
                InputProps={{
                  readOnly: Boolean(reasonType || selectedBank || accountNumber || accountHolder)
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    fontSize: '0.9375rem',
                    '&.Mui-disabled': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    }
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                * Thông tin được tổng hợp tự động từ các trường trên. Bạn có thể chỉnh sửa nếu cần.
              </Typography>
            </Box>
          </Grid>

          {/* Thông báo lỗi */}
          {error && (
            <Grid item xs={12}>
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 1,
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2.5, 
        borderTop: 1, 
        borderColor: 'divider',
        backgroundColor: 'rgba(0, 0, 0, 0.02)'
      }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{ 
            minWidth: 100,
            px: 3,
            py: 1,
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: 'rgba(0, 0, 0, 0.23)',
            '&:hover': {
              borderColor: 'rgba(0, 0, 0, 0.5)',
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          Hủy
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!reasonType || !selectedBank || !accountNumber || !accountHolder}
          sx={{ 
            minWidth: 120,
            px: 3,
            py: 1,
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 600,
            backgroundColor: 'rgb(33, 150, 243)',
            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
            '&:hover': {
              backgroundColor: 'rgb(25, 118, 210)',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)'
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)',
              boxShadow: 'none'
            }
          }}
        >
          Gửi yêu cầu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RefundDialog;