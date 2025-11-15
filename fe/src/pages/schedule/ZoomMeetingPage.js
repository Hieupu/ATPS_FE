import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, AppBar, Toolbar, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=160";

const ZoomMeetingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const videoRef = useRef(null);
  const zoomIntervalRef = useRef(null);
  const meetingJoinedRef = useRef(false);

  useEffect(() => {
    const zoomData = sessionStorage.getItem('zoomScheduleData');
    if (zoomData) {
      try {
        const parsedData = JSON.parse(zoomData);
        setSchedule(parsedData.schedule);
        sessionStorage.removeItem('zoomScheduleData');
        setDebugInfo('Schedule loaded successfully');
      } catch (err) {
        console.error('Error parsing schedule data:', err);
        setError('Không thể tải thông tin buổi học');
      }
    } else {
      setError('Không tìm thấy thông tin buổi học');
    }
  }, []);

  const getSignature = async (meetingNumber, role = 1) => {
    try {
      setDebugInfo('Requesting signature from server...');
      console.log('🔑 Requesting signature for meeting:', meetingNumber, 'role:', role);
      
      const res = await fetch('http://localhost:9999/api/zoom/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingNumber, role }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("✅ Signature response:", data);
      setDebugInfo('Signature received from server');
      
      if (!data.signature) {
        throw new Error('Invalid signature response: signature missing');
      }
      
      return data;
    } catch (err) {
      console.error('❌ Signature error:', err);
      setDebugInfo('Signature error: ' + err.message);
      throw new Error('Failed to get Zoom signature: ' + err.message);
    }
  };

  const loadZoomSDK = () => {
    return new Promise((resolve, reject) => {
      if (window.ZoomMtg) {
        console.log('✅ Zoom SDK already loaded');
        setDebugInfo('Zoom SDK already loaded');
        resolve(window.ZoomMtg);
        return;
      }

      setDebugInfo('Loading Zoom SDK scripts...');
      const scripts = [
        'https://source.zoom.us/2.18.2/lib/vendor/react.min.js',
        'https://source.zoom.us/2.18.2/lib/vendor/react-dom.min.js',
        'https://source.zoom.us/2.18.2/lib/vendor/redux.min.js',
        'https://source.zoom.us/2.18.2/lib/vendor/redux-thunk.min.js',
        'https://source.zoom.us/2.18.2/lib/vendor/lodash.min.js',
        'https://source.zoom.us/zoom-meeting-2.18.2.min.js'
      ];

      let loadedCount = 0;

      scripts.forEach((src) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
          loadedCount++;
          console.log(`✅ Loaded: ${src}`);
          setDebugInfo(`Loaded ${loadedCount}/${scripts.length} scripts`);
          
          if (loadedCount === scripts.length) {
            // Check for ZoomMtg với timeout
            let checkCount = 0;
            const maxChecks = 30;
            
            const checkZoomMtg = setInterval(() => {
              checkCount++;
              if (window.ZoomMtg) {
                clearInterval(checkZoomMtg);
                console.log('🎯 ZoomMtg ready after', checkCount, 'checks');
                setDebugInfo('Zoom SDK fully loaded and ready');
                resolve(window.ZoomMtg);
              } else if (checkCount >= maxChecks) {
                clearInterval(checkZoomMtg);
                reject(new Error('ZoomMtg not found after loading all scripts'));
              }
            }, 100);
          }
        };
        
        script.onerror = (err) => {
          console.error('❌ Script load error:', src, err);
          reject(new Error(`Failed to load: ${src}`));
        };
        
        document.head.appendChild(script);
      });
    });
  };

  const startVideoMonitoring = () => {
    if (zoomIntervalRef.current) {
      clearInterval(zoomIntervalRef.current);
    }

    const checkVideo = () => {
      try {
        const myVideo = document.querySelector('video[title*="self-view"]') || 
                       document.querySelector('video[srcObject]');
        
        if (myVideo && myVideo.srcObject && videoRef.current) {
          videoRef.current.srcObject = myVideo.srcObject;
          setIsVideoOn(true);
        } else {
          setIsVideoOn(false);
        }
      } catch (err) {
        console.error('Video monitoring error:', err);
        setIsVideoOn(false);
      }
    };

    setTimeout(checkVideo, 3000);
    zoomIntervalRef.current = setInterval(checkVideo, 1000);
  };

  const joinZoomMeeting = async (ZoomMtg, meetingNumber, signature, sdkKey) => {
    return new Promise((resolve, reject) => {
      console.log('🚀 Starting Zoom meeting join process...');
      setDebugInfo('Initializing Zoom meeting...');

      // Đảm bảo meeting container tồn tại
      const meetingElement = document.getElementById('meetingSDKElement');
      if (!meetingElement) {
        const errorMsg = 'Meeting container not found';
        setDebugInfo(errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      // Cấu hình quan trọng
      try {
        ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.2/lib', '/av');
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();
        setDebugInfo('Zoom SDK prepared');
      } catch (err) {
        console.error('❌ SDK preparation error:', err);
        setDebugInfo('SDK preparation failed: ' + err.message);
        reject(err);
        return;
      }

      const initConfig = {
        leaveUrl: window.location.origin,
        isSupportAV: true,
        success: () => {
          console.log('✅ Zoom init success');
          setDebugInfo('Zoom initialized successfully - joining meeting...');
          
          // Join meeting sau khi init thành công
          setTimeout(() => {
            if (meetingJoinedRef.current) {
              console.log('Meeting already joined, skipping...');
              return;
            }

            const joinConfig = {
              sdkKey: sdkKey,
              signature: signature,
              meetingNumber: meetingNumber,
              passWord: schedule?.Zoompass || '',
              userName: user?.Email || 'React User',
              userEmail: user?.Email || '',
              success: (successData) => {
                console.log('🎉 JOIN MEETING SUCCESS!', successData);
                meetingJoinedRef.current = true;
                setIsJoined(true);
                setLoading(false);
                setDebugInfo('Successfully joined meeting');
                startVideoMonitoring();
                resolve(successData);
              },
              error: (errorData) => {
                console.error('❌ JOIN MEETING ERROR:', errorData);
                meetingJoinedRef.current = false;
                
                let errorMsg = 'Không thể tham gia meeting';
                if (errorData && errorData.message) {
                  if (errorData.message.includes('1003')) errorMsg = 'Meeting không tồn tại';
                  else if (errorData.message.includes('1004')) errorMsg = 'Meeting chưa bắt đầu hoặc đã kết thúc';
                  else if (errorData.message.includes('3001')) errorMsg = 'Signature không hợp lệ';
                  else if (errorData.message.includes('3003')) errorMsg = 'API Key không hợp lệ';
                  else if (errorData.message.includes('3008')) errorMsg = 'User không được phép tham gia';
                  else errorMsg = errorData.message;
                }
                
                setDebugInfo('Join error: ' + errorMsg);
                setError(errorMsg);
                setLoading(false);
                reject(new Error(errorMsg));
              }
            };

            console.log('🔧 Final join config:', {
              meetingNumber: joinConfig.meetingNumber,
              userName: joinConfig.userName,
              sdkKey: joinConfig.sdkKey?.substring(0, 10) + '...',
              signatureLength: joinConfig.signature?.length
            });

            try {
              console.log('🎯 Calling ZoomMtg.join()...');
              ZoomMtg.join(joinConfig);
              
              // Timeout để phát hiện join bị treo
              setTimeout(() => {
                if (!meetingJoinedRef.current && !error) {
                  console.warn('⚠️ Join seems to be hanging...');
                  setDebugInfo('Join process taking longer than expected...');
                }
              }, 10000);
              
            } catch (joinErr) {
              console.error('❌ Exception in ZoomMtg.join():', joinErr);
              setDebugInfo('Exception in join: ' + joinErr.message);
              setError('Lỗi khi gọi join: ' + joinErr.message);
              setLoading(false);
              reject(joinErr);
            }
          }, 1000);
        },
        error: (errorData) => {
          console.error('❌ ZOOM INIT ERROR:', errorData);
          setDebugInfo('Init error: ' + JSON.stringify(errorData));
          setError('Lỗi khởi tạo Zoom: ' + (errorData?.message || 'Unknown error'));
          setLoading(false);
          reject(errorData);
        }
      };

      console.log('🎯 Initializing Zoom SDK with config:', initConfig);
      try {
        ZoomMtg.init(initConfig);
      } catch (initErr) {
        console.error('❌ Exception in ZoomMtg.init():', initErr);
        setDebugInfo('Init exception: ' + initErr.message);
        setError('Lỗi khởi tạo: ' + initErr.message);
        setLoading(false);
        reject(initErr);
      }
    });
  };

  const startZoomMeeting = async () => {
    if (!schedule) {
      setError('No schedule data available');
      return;
    }

    setLoading(true);
    setError(null);
    setIsJoined(false);
    meetingJoinedRef.current = false;
    setDebugInfo('Starting Zoom meeting process...');

    try {
      const meetingNumber = String(schedule.ZoomID || '').replace(/\s/g, '');
      if (!meetingNumber || meetingNumber.length < 10) {
        throw new Error('Invalid Zoom meeting ID: ' + meetingNumber);
      }

      console.log('🎬 Starting Zoom meeting process...');
      console.log('Meeting Number:', meetingNumber);

      // Load SDK
      setDebugInfo('Loading Zoom SDK...');
      const ZoomMtg = await loadZoomSDK();
      
      // Get signature
      setDebugInfo('Getting signature...');
      const { signature, sdkKey } = await getSignature(meetingNumber, 1);
      
      console.log('📋 Final signature details:', {
        meetingNumber: meetingNumber,
        signatureLength: signature.length,
        sdkKey: sdkKey,
        userName: user?.Email
      });

      // Join meeting
      await joinZoomMeeting(ZoomMtg, meetingNumber, signature, sdkKey);

    } catch (err) {
      console.error('💥 Zoom meeting error:', err);
      setError(err.message || 'Lỗi kết nối Zoom');
      setLoading(false);
    }
  };

  const handleLeaveMeeting = () => {
    if (zoomIntervalRef.current) {
      clearInterval(zoomIntervalRef.current);
      zoomIntervalRef.current = null;
    }

    if (window.ZoomMtg && meetingJoinedRef.current) {
      try {
        window.ZoomMtg.leaveMeeting();
        console.log('Left Zoom meeting');
        meetingJoinedRef.current = false;
      } catch (err) {
        console.error('Error leaving meeting:', err);
      }
    }
    
    setIsJoined(false);
    setIsVideoOn(false);
  };

  useEffect(() => {
    if (schedule && !isJoined && !loading) {
      startZoomMeeting();
    }

    return () => {
      handleLeaveMeeting();
    };
  }, [schedule]);

  const handleBack = () => {
    handleLeaveMeeting();
    navigate(-1);
  };

  const handleRetry = () => {
    setError(null);
    setIsJoined(false);
    setLoading(false);
    setDebugInfo('Retrying...');
    if (schedule) {
      startZoomMeeting();
    }
  };

  if (!schedule && !error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Đang tải thông tin buổi học...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="transparent" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {schedule?.SessionTitle} - Zoom Meeting
            {schedule?.ZoomID && ` (ID: ${schedule.ZoomID})`}
          </Typography>
          
          {/* Debug Info */}
          <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary', fontSize: '0.75rem' }}>
            {debugInfo}
          </Typography>
          
          <Button onClick={handleRetry} variant="outlined" sx={{ mr: 2 }}>
            Thử lại
          </Button>
          
          <Button onClick={handleBack} variant="outlined">
            Đóng
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, position: 'relative', background: '#000' }}>
        <div 
          id="meetingSDKElement" 
          style={{ 
            width: '100%', 
            height: '100%',
            minHeight: '500px',
            background: '#1c1c1c'
          }} 
        />
        
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.8)',
            zIndex: 1000
          }}>
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <CircularProgress sx={{ color: 'white', mb: 2 }} size={60} />
              <Typography variant="h6">Đang kết nối đến Zoom...</Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Meeting ID: {schedule?.ZoomID}
                <br />
                {debugInfo}
              </Typography>
            </Box>
          </Box>
        )}

        {error && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            p: 2,
            zIndex: 1000
          }}>
            <Alert 
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={handleRetry}>
                  Thử lại
                </Button>
              }
            >
              <Typography variant="h6">Lỗi kết nối Zoom</Typography>
              <Typography variant="body2">{error}</Typography>
              <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
                Debug: {debugInfo}
                <br />
                Meeting ID: {schedule?.ZoomID}
              </Typography>
            </Alert>
          </Box>
        )}

        {isJoined && (
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 160,
              height: 90,
              borderRadius: 2,
              overflow: 'hidden',
              border: '2px solid #fff',
              boxShadow: 3,
              zIndex: 9999,
              background: '#111',
            }}
          >
            {isVideoOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <img
                src={DEFAULT_AVATAR}
                alt="My Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                fontSize: 11,
                padding: '2px 6px',
                textAlign: 'center',
              }}
            >
              {user?.Email || 'User'}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ZoomMeetingPage;