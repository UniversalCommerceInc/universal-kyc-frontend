import React, { useState, useRef, useEffect } from "react";
import Lottie from "react-lottie-player";
import Webcam from "react-webcam";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import FlipCameraIosIcon from "@mui/icons-material/FlipCameraIos";
import ocrIDFront from "../assets/ocr_id_front.json";
import ocrPassportFront from "../assets/ocr_passport.json";
import { ChevronRight } from "@mui/icons-material";
import { useParams } from "react-router-dom";

const PassportLottie = () => (
  <Lottie
    loop
    animationData={ocrPassportFront}
    play
    style={{ width: "250px", height: "250px", background: "transparent" }}
  />
);

const LottieAnimation = () => (
  <Lottie
    loop
    animationData={ocrIDFront}
    play
    style={{ width: "250px", height: "250px", background: "transparent" }}
  />
);

const DocumentUpload = ({ idType, onNext }) => {
  const [isCaptureMode, setIsCaptureMode] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isImageConfirmed, setIsImageConfirmed] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  // State to hold the detected crop box dimensions
  const [detectedCropBox, setDetectedCropBox] = useState(null);

  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const webcamRef = useRef(null);
  const cropperRef = useRef(null);
  const { id } = useParams();
  console.log(id);

  const renderAnimation = () =>
    idType === "passport" ? <PassportLottie /> : <LottieAnimation />;

  const getInstructionText = () => {
    switch (idType) {
      case "adhaar":
        return "AADHAAR CARD: Please ensure the document is clearly visible without any glare or shadows.";
      case "passport":
        return "PASSPORT: Ensure the document is clear and cropped to show only the info page.";
      case "pan":
        return "PAN CARD: Ensure visibility without glare or shadows.";
      default:
        return "Please ensure the document is clearly visible.";
    }
  };

  // ─── Enhanced Detect Crop Box Using OpenCV ──────────────────────────────
  // This function now applies dilation/erosion to the Canny output and searches
  // for the largest quadrilateral. If found, its bounding rectangle is returned.
  const detectCropBox = (srcImage) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = srcImage;
      img.onload = () => {
        // Create a temporary canvas to draw the loaded image
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        try {
          const cv = window.cv;
          let src = cv.imread(canvas);
          let gray = new cv.Mat();
          cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

          // Blur to reduce noise
          let blurred = new cv.Mat();
          cv.GaussianBlur(
            gray,
            blurred,
            new cv.Size(5, 5),
            0,
            0,
            cv.BORDER_DEFAULT
          );

          // Canny edge detection
          let edged = new cv.Mat();
          cv.Canny(blurred, edged, 75, 200);

          // Dilation and erosion to close gaps in edges
          let kernel = cv.getStructuringElement(
            cv.MORPH_RECT,
            new cv.Size(5, 5)
          );
          cv.dilate(edged, edged, kernel);
          cv.erode(edged, edged, kernel);
          kernel.delete();

          // Find contours
          let contours = new cv.MatVector();
          let hierarchy = new cv.Mat();
          cv.findContours(
            edged,
            contours,
            hierarchy,
            cv.RETR_LIST,
            cv.CHAIN_APPROX_SIMPLE
          );

          // Look for the largest quadrilateral
          let maxQuadArea = 0;
          let quadContour = null;
          for (let i = 0; i < contours.size(); i++) {
            let cnt = contours.get(i);
            let peri = cv.arcLength(cnt, true);
            let approx = new cv.Mat();
            cv.approxPolyDP(cnt, approx, 0.02 * peri, true);
            if (approx.rows === 4) {
              let area = cv.contourArea(approx);
              if (area > maxQuadArea) {
                maxQuadArea = area;
                if (quadContour) quadContour.delete();
                quadContour = approx.clone();
              }
            }
            approx.delete();
          }

          let rect;
          if (quadContour) {
            rect = cv.boundingRect(quadContour);
            quadContour.delete();
          } else {
            // Fallback: use the bounding rectangle of the largest contour
            let maxArea = 0;
            let maxContour = null;
            for (let i = 0; i < contours.size(); i++) {
              let cnt = contours.get(i);
              let area = cv.contourArea(cnt);
              if (area > maxArea) {
                maxArea = area;
                maxContour = cnt;
              }
            }
            if (maxContour) {
              rect = cv.boundingRect(maxContour);
            } else {
              rect = { x: 0, y: 0, width: canvas.width, height: canvas.height };
            }
          }

          // Clean up allocated memory
          src.delete();
          gray.delete();
          blurred.delete();
          edged.delete();
          contours.delete();
          hierarchy.delete();

          resolve(rect);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = (err) => {
        reject(err);
      };
    });
  };
  // ─────────────────────────────────────────────────────────────────────

  // When imageSrc changes, automatically detect the document region
  useEffect(() => {
    if (imageSrc) {
      detectCropBox(imageSrc)
        .then((rect) => {
          setDetectedCropBox(rect);
        })
        .catch((err) => {
          console.error("Crop box detection failed:", err);
          setDetectedCropBox(null);
        });
    }
  }, [imageSrc]);

  // Capture from webcam (letting the user adjust the crop)
  const handleCapture = () => {
    const capturedImage = webcamRef.current?.getScreenshot();
    if (capturedImage) {
      console.log("Captured Image:", capturedImage);
      setImageSrc(capturedImage);
      setIsCaptureMode(false);
      setShowCropper(true);
    } else {
      console.error("Failed to capture image. Webcam might not be active.");
    }
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = () => {
    const cropperInstance = cropperRef.current?.cropper;
    if (cropperInstance) {
      const croppedCanvas = cropperInstance.getCroppedCanvas({
        width: 800, // Increase resolution for better quality
        height: 800,
      });
      const croppedDataUrl = croppedCanvas.toDataURL("image/jpeg", 1.0);
      console.log("Cropped Image:", croppedDataUrl);
      setCroppedImage(croppedDataUrl);
      setShowCropper(false);
    } else {
      console.error("Cropper instance not available");
    }
  };

  const handleRetake = () => {
    setImageSrc(null);
    setCroppedImage(null);
    setIsImageConfirmed(false);
    setIsCaptureMode(false);
    setShowCropper(false);
    setDetectedCropBox(null);
  };

  const handleConfirmImage = () => {
    setIsImageConfirmed(true);
    setShowCropper(false);
  };

  const toggleCamera = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <Paper className="w-full max-w-lg bg-white shadow-lg rounded-lg p-8 space-y-4">
        <Typography
          variant="h5"
          className="text-center font-semibold mb-6 text-gray-800"
        >
          Document Upload
        </Typography>

        <Box className="mb-4 text-center">
          <Typography variant="body1" color="textSecondary">
            {getInstructionText()}
          </Typography>
        </Box>

        {/* Show animation only when no image is loaded and not in capture mode */}
        {!imageSrc && !isCaptureMode && (
          <Box className="flex justify-center mb-6">{renderAnimation()}</Box>
        )}

        {/* Show webcam when capture mode is active and no image is available */}
        {isCaptureMode && !imageSrc ? (
          <div className="relative w-full max-w-md">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full rounded-lg shadow-lg"
              videoConstraints={{
                facingMode,
                width: 1280,
                height: 720,
              }}
            />
            <Box className="flex justify-center space-x-4 mt-4">
              <IconButton
                color="success"
                onClick={handleCapture}
                style={{ backgroundColor: "rgba(0,128,0,0.2)" }}
              >
                <CheckCircleIcon style={{ fontSize: "40px", color: "green" }} />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => setIsCaptureMode(false)}
                style={{ backgroundColor: "rgba(255,0,0,0.2)" }}
              >
                <CancelIcon style={{ fontSize: "40px", color: "red" }} />
              </IconButton>
              {isSmallScreen && (
                <IconButton
                  onClick={toggleCamera}
                  style={{ backgroundColor: "rgba(0,0,255,0.2)" }}
                >
                  <FlipCameraIosIcon
                    style={{ fontSize: "40px", color: "blue" }}
                  />
                </IconButton>
              )}
            </Box>
          </div>
        ) : (
          <>
            {/* Only show file input / capture buttons when no image is confirmed and cropper is not visible */}
            {!isImageConfirmed && !showCropper && (
              <Box className="flex justify-center space-x-4 mb-6">
                {isSmallScreen ? (
                  <Button
                    variant="outlined"
                    color="secondary"
                    component="label"
                    style={{ borderRadius: "20px", padding: "10px 20px" }}
                  >
                    Take
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleUpload}
                    />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      color="secondary"
                      component="label"
                      style={{ borderRadius: "20px", padding: "10px 20px" }}
                    >
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleUpload}
                      />
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ borderRadius: "20px", padding: "10px 20px" }}
                      onClick={() => setIsCaptureMode(true)}
                    >
                      Take
                    </Button>
                  </>
                )}
              </Box>
            )}

            {/* Show the Cropper if an image is available */}
            {showCropper && imageSrc && (
              <div>
                <Cropper
                  src={imageSrc}
                  style={{ height: "400px", width: "100%" }}
                  autoCropArea={1}
                  guides={false}
                  ref={cropperRef}
                  viewMode={2} // restrict crop box within image boundaries
                  dragMode="move"
                  ready={() => {
                    if (detectedCropBox && cropperRef.current) {
                      const cropper = cropperRef.current.cropper;
                      const imageData = cropper.getImageData();
                      // Calculate scale factor between displayed image and its natural size
                      const scale = imageData.width / imageData.naturalWidth;
                      // Set crop box based on detected document region
                      cropper.setCropBoxData({
                        left: detectedCropBox.x * scale,
                        top: detectedCropBox.y * scale,
                        width: detectedCropBox.width * scale,
                        height: detectedCropBox.height * scale,
                      });
                    }
                  }}
                />
                <Box className="flex justify-center space-x-4 mt-4">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCropComplete}
                  >
                    Confirm Crop
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleRetake}
                  >
                    Retake
                  </Button>
                </Box>
              </div>
            )}

            {croppedImage && (
              <div className="flex flex-col items-center mt-6">
                <img
                  src={croppedImage}
                  alt="Cropped Preview"
                  className="rounded-lg shadow-lg mb-4 w-full max-w-xs"
                />
                <Typography variant="body2" color="textSecondary">
                  Cropped Preview
                </Typography>
                <Box className="flex space-x-4 mt-4">
                  <IconButton
                    color="success"
                    onClick={handleConfirmImage}
                    style={{ backgroundColor: "rgba(0,128,0,0.2)" }}
                  >
                    <CheckCircleIcon
                      style={{ fontSize: "30px", color: "green" }}
                    />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={handleRetake}
                    style={{ backgroundColor: "rgba(255,0,0,0.2)" }}
                  >
                    <CancelIcon style={{ fontSize: "30px", color: "red" }} />
                  </IconButton>
                </Box>
              </div>
            )}
          </>
        )}

        {isImageConfirmed && (
          <div className="flex justify-center pt-6">
            <button
              type="button"
              onClick={() => onNext(croppedImage)}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Next <ChevronRight className="ml-1" />
            </button>
          </div>
        )}
      </Paper>
    </div>
  );
};

export default DocumentUpload;
