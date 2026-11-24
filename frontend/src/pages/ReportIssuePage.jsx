import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle, MapPin, Upload, FileText, CheckCircle2,
  AlertTriangle, ArrowRight, ArrowLeft, Sparkles, Navigation,
  X, Image as ImageIcon, ShieldAlert, Cpu, Camera, Video,
  Square, RefreshCw, Radio
} from 'lucide-react';

const CATEGORIES = [
  'Auto-Detect',
  'Roads & Potholes',
  'Water & Drainage',
  'Waste Management',
  'Electricity & Streetlights',
  'Public Safety',
  'Public Transport',
  'Environment',
  'Healthcare',
  'Education',
  'Other Civic Issues'
];

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login?redirect=/report', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedIssue, setSubmittedIssue] = useState(null);
  const [aiPreview, setAiPreview] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Auto-Detect',
    subcategory: '',
    urgency_level: 'Medium',
    safety_hazard: false,
    address: '',
    locality: '',
    landmark: '',
    city: 'Bengaluru',
    latitude: 12.9716,
    longitude: 77.5946
  });

  const [attachedFiles, setAttachedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  // Camera & Video Capture State
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment'); // back camera by default
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraGpsInfo, setCameraGpsInfo] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // High Accuracy Geolocation
  const handleGetLocation = (autoFillAddress = false) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        const accuracy = Math.round(pos.coords.accuracy);

        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          locality: prev.locality || `GPS Fix (±${accuracy}m)`,
          address: prev.address || (autoFillAddress ? `Near GPS: ${lat}, ${lng}` : prev.address)
        }));

        setCameraGpsInfo({
          lat,
          lng,
          accuracy,
          time: new Date().toLocaleTimeString()
        });
      },
      (err) => {
        console.warn("GPS error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // CAMERA CAPTURE LOGIC
  const startCamera = async (facingMode = 'environment') => {
    setCameraError(null);
    stopCameraStream();
    setCameraOpen(true);

    // Also auto-fetch current GPS location
    handleGetLocation(false);

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (audioErr) {
        // Fallback without audio if microphone permission denied
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode }
        });
      }

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError("Camera access denied or device not found. Please allow camera permissions in browser.");
    }
  };

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setCameraOpen(false);
  };

  const switchCamera = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Snap high-resolution photo from video frame
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert frame to blob/file
    canvas.toBlob((blob) => {
      if (!blob) return;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `civic_photo_${timestamp}.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });

      setAttachedFiles(prev => [...prev, file]);
      setFilePreviews(prev => [
        ...prev,
        {
          name: filename,
          url: URL.createObjectURL(blob),
          isVideo: false,
          gps: cameraGpsInfo
        }
      ]);

      alert(`Photo captured with GPS coordinates: ${formData.latitude}, ${formData.longitude}!`);
    }, 'image/jpeg', 0.92);
  };

  // Video Recording with MediaRecorder API
  const startRecordingVideo = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];

    let mimeType = 'video/webm;codecs=vp8,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/mp4';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = ''; // Let browser pick default
      }
    }

    try {
      const options = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(mediaStreamRef.current, options);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(recordedChunksRef.current, { type: mimeType || 'video/webm' });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `civic_video_${timestamp}.webm`;
        const videoFile = new File([videoBlob], filename, { type: mimeType || 'video/webm' });

        setAttachedFiles(prev => [...prev, videoFile]);
        setFilePreviews(prev => [
          ...prev,
          {
            name: filename,
            url: URL.createObjectURL(videoBlob),
            isVideo: true,
            gps: cameraGpsInfo
          }
        ]);

        alert(`Video recording saved with GPS location!`);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // 1-second chunks
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start MediaRecorder:", err);
      alert("Video recording could not be started: " + err.message);
    }
  };

  const stopRecordingVideo = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  // Upload files from disk
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setAttachedFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const isVideo = file.type.startsWith('video/') ||
        ['.mp4', '.webm', '.mov', '.mkv'].some(ext => file.name.toLowerCase().endsWith(ext));

      const previewUrl = URL.createObjectURL(file);
      setFilePreviews(prev => [
        ...prev,
        {
          name: file.name,
          url: previewUrl,
          isVideo,
          gps: cameraGpsInfo
        }
      ]);
    });
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const fetchAiPreview = async () => {
    if (!formData.title || !formData.description) return;
    setAiLoading(true);
    try {
      const data = await api.previewAI(formData);
      setAiPreview(data);
    } catch (err) {
      console.error("AI preview failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (!formData.title.trim() || formData.title.length < 5) {
        alert("Please provide a descriptive problem title (min 5 characters)");
        return;
      }
      if (!formData.description.trim() || formData.description.length < 15) {
        alert("Please provide a detailed description (min 15 characters)");
        return;
      }
    } else if (step === 2) {
      if (!formData.address.trim()) {
        alert("Please specify the street address or locality");
        return;
      }
    } else if (step === 3) {
      // Close camera if open before going to review
      stopCameraStream();
      fetchAiPreview();
    }
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      alert("Please sign in or use the Evaluator Persona switcher before submitting a complaint");
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Submit problem data
      const created = await api.createProblem(formData);

      // 2. Upload attachments (photos & videos)
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          try {
            await api.uploadAttachment(created.id, file);
          } catch (e) {
            console.error("Attachment upload error:", e);
          }
        }
      }

      setSubmittedIssue(created);
      setStep(5); // Success step
    } catch (err) {
      alert("Submission failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Hidden canvas for taking photo frames */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Wizard Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { s: 1, label: 'Details' },
            { s: 2, label: 'Location' },
            { s: 3, label: 'Evidence (Cam/Video)' },
            { s: 4, label: 'Review & AI' },
            { s: 5, label: 'Confirmed' }
          ].map((item) => {
            const isCompleted = step > item.s;
            const isCurrent = step === item.s;
            return (
              <div key={item.s} className="flex-1 flex flex-col items-center relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : item.s}
                </div>
                <span className={`text-[11px] font-semibold mt-1.5 text-center ${isCurrent ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        
        {/* STEP 1: PROBLEM DETAILS */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 1: Problem Details</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Describe what is broken, hazardous, or in need of municipal repair.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Problem Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Deep pothole cluster near Metro Pillar 142"
                className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Detailed Description *
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Explain the extent of damage, how long it has been present, and any immediate traffic or safety risks..."
                className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Urgency Level
                </label>
                <select
                  name="urgency_level"
                  value={formData.urgency_level}
                  onChange={handleChange}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Low">Low (Routine maintenance)</option>
                  <option value="Medium">Medium (Affecting local traffic / residents)</option>
                  <option value="High">High (Disrupting major street / services)</option>
                  <option value="Critical">Critical (Immediate danger to life / property)</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start space-x-3">
              <input
                type="checkbox"
                id="safety_hazard"
                name="safety_hazard"
                checked={formData.safety_hazard}
                onChange={handleChange}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <label htmlFor="safety_hazard" className="text-xs text-amber-900 dark:text-amber-200 cursor-pointer">
                <span className="font-bold block">Direct Public Safety Hazard</span>
                Check this if this issue poses an immediate risk of injury, vehicle crash, electrocution, or flooding.
              </label>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 2: Incident Location</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pinpoint where the problem is located so field officers can inspect it.</p>
              </div>
              <button
                type="button"
                onClick={() => handleGetLocation(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Fetch Current GPS</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 100ft Road, Opposite Indiranagar Post Office"
                className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Locality / Ward
                </label>
                <input
                  type="text"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  placeholder="e.g. Indiranagar, Ward 14"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Prominent Landmark
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="e.g. Near Metro Station Gate 2"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EVIDENCE PHOTOS & VIDEOS WITH LIVE CAMERA & GPS */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 3: Capture Photo & Video Evidence</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Use your device camera to take live photos or record short videos with automatic GPS geotagging.
                </p>
              </div>

              {!cameraOpen && (
                <button
                  type="button"
                  onClick={() => startCamera(cameraFacingMode)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 active:scale-95 transition-all self-start sm:self-auto"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Live Camera & GPS</span>
                </button>
              )}
            </div>

            {/* LIVE CAMERA VIEWFINDER BOX */}
            {cameraOpen && (
              <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-indigo-500 shadow-2xl space-y-2">
                
                {/* Live Video Viewfinder */}
                <div className="relative aspect-video w-full flex items-center justify-center bg-slate-950">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Geotag & Time Overlay Bar */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      GPS: {formData.latitude.toFixed(6)}°N, {formData.longitude.toFixed(6)}°E
                    </span>
                    {isRecording && (
                      <span className="flex items-center gap-1.5 text-rose-400 font-bold animate-pulse">
                        <Radio className="w-3.5 h-3.5" />
                        REC {formatTimer(recordingSeconds)}
                      </span>
                    )}
                  </div>

                  {/* Target Crosshair */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-24 h-24 border border-dashed border-white/40 rounded-lg"></div>
                  </div>
                </div>

                {cameraError && (
                  <div className="p-3 bg-rose-950/80 text-rose-300 text-xs font-medium text-center">
                    {cameraError}
                  </div>
                )}

                {/* Viewfinder Controls */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={switchCamera}
                      className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                      title="Switch Camera (Front/Back)"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Flip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGetLocation(false)}
                      className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                      title="Update GPS Tag"
                    >
                      <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[11px]">Sync GPS</span>
                    </button>
                  </div>

                  {/* Snap & Record Action Buttons */}
                  <div className="flex items-center space-x-3">
                    {/* Snap Photo */}
                    <button
                      type="button"
                      disabled={isRecording}
                      onClick={takePhoto}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold shadow-md active:scale-95 transition-all disabled:opacity-40"
                    >
                      <Camera className="w-4 h-4 text-brand-600" />
                      <span>Take Photo</span>
                    </button>

                    {/* Record Video */}
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startRecordingVideo}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                      >
                        <Video className="w-4 h-4" />
                        <span>Record Video</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecordingVideo}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md animate-pulse"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Recording ({formatTimer(recordingSeconds)})</span>
                      </button>
                    )}
                  </div>

                  {/* Close Camera */}
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Close Camera"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Standard File Upload Area */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-brand-500 transition-colors">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/png, image/jpeg, image/webp, video/mp4, video/webm, video/quicktime"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Or select photos & videos from your gallery / device
                </p>
                <p className="text-[11px] text-slate-400">Supported: JPG, PNG, WEBP, MP4, WEBM (Max 50MB)</p>
              </label>
            </div>

            {/* Evidence Previews List */}
            {filePreviews.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Attached Evidence ({filePreviews.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filePreviews.map((p, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 flex flex-col justify-between group shadow-sm"
                    >
                      {p.isVideo ? (
                        <div className="aspect-video bg-black flex items-center justify-center">
                          <video src={p.url} controls className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
                          <img src={p.url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="p-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="truncate max-w-[130px] font-medium text-slate-700 dark:text-slate-300">
                          {p.name}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          {p.isVideo ? 'VIDEO' : 'PHOTO'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors z-20"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: REVIEW & AI PREVIEW */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 4: AI Triage & Review</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Review your grievance details and see the real-time AI classification.</p>
            </div>

            {/* AI Triage Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-tr from-brand-950 to-indigo-900 text-white space-y-2.5 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-brand-300" />
                  <span className="font-bold text-indigo-200">AI Priority Score:</span>
                  <span className="font-bold font-mono text-emerald-300 text-sm">
                    {aiPreview?.calculated_priority_score?.toFixed(1) || '75.0'} / 100
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                  {aiPreview?.suggested_priority || formData.urgency_level.toUpperCase()} PRIORITY
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {aiPreview?.priority_explanation || "Analyzing hazard factors, pedestrian impact, and category density..."}
              </p>
              <div className="text-[11px] text-indigo-200 flex items-center justify-between pt-1 border-t border-indigo-800/60">
                <span>Recommended Routing: <strong>{aiPreview?.recommended_department || 'Department of Public Works'}</strong></span>
                <span>Duplicate candidates: {aiPreview?.duplicate_candidates?.length || 0}</span>
              </div>
            </div>

            {/* Duplicate Warning in Review */}
            {aiPreview?.duplicate_candidates && aiPreview.duplicate_candidates.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Notice: Similar Complaints Found</span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  We found {aiPreview.duplicate_candidates.length} similar reports near this location. Your report will be linked to prevent duplicate roadwork.
                </p>
              </div>
            )}

            {/* Summary List */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Title:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{formData.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{aiPreview?.suggested_category || formData.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">GPS Coordinates:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right">{formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Address:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{formData.address}, {formData.locality}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Evidence Files:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{attachedFiles.length} file(s) attached</span>
              </div>
            </div>

          </div>
        )}

        {/* STEP 5: SUBMITTED CONFIRMATION */}
        {step === 5 && submittedIssue && (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Grievance Registered</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Report ID: {submittedIssue.report_id}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">
                Your report '{submittedIssue.title}' has been persisted to the database and queued for administrative review.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 max-w-md mx-auto text-xs text-left space-y-1.5">
              <p><strong>Initial Status:</strong> <span className="text-indigo-600 font-semibold">{submittedIssue.status}</span></p>
              <p><strong>AI Priority Score:</strong> {submittedIssue.priority_score?.toFixed(1)}/100 ({submittedIssue.priority})</p>
              <p><strong>Geotagged Location:</strong> <span className="font-mono">{submittedIssue.latitude}, {submittedIssue.longitude}</span></p>
              <p><strong>Recommended Wing:</strong> {submittedIssue.ai_analysis?.recommended_department || 'Municipal Grievance Cell'}</p>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link
                to={`/issues/${submittedIssue.id}`}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md"
              >
                View Issue Details & Timeline
              </Link>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200"
              >
                Go to Citizen Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        {step < 5 && (
          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setStep(prev => prev - 1);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : <div></div>}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/25 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Saving & Analyzing...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Grievance</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
