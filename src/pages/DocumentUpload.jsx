import React, { useState, useRef } from "react";
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

  const handleCapture = () => {
    const capturedImage = webcamRef.current?.getScreenshot();
    if (capturedImage) {
      console.log("Captured Image:", capturedImage); // Log the captured image
      setImageSrc(capturedImage);
      setIsCaptureMode(false);
      setShowCropper(true);
      setIsImageConfirmed(true);
    } else {
      console.error("Failed to capture image. Webcam might not be active.");
    }
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCropper(true);
      setIsImageConfirmed(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = () => {
    const cropperInstance = cropperRef.current?.cropper;
    if (cropperInstance) {
      const croppedCanvas = cropperInstance.getCroppedCanvas({
        width: 800, // Increase resolution for better quality
        height: 800,
      });
      const croppedDataUrl = croppedCanvas.toDataURL("image/jpeg", 1.0); // Maximum quality
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
  };

  const handleConfirmImage = () => {
    setIsImageConfirmed(true);
    setShowCropper(false);
  };

  const toggleCamera = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };
  // const handleNextClick = () => {
  //   console.log("clicked");
  //   if (croppedImage) {
  //     const data = {
  //       id: id, // Use the id from useParams if needed
  //       image: croppedImage,
  //     };
  //     console.log(data);
  //     onNext(data); // Call onNext and pass the required data
  //   } else {
  //     console.error("No cropped image to proceed.");
  //   }
  // };

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

        {!imageSrc && !isCaptureMode && (
          <Box className="flex justify-center mb-6">{renderAnimation()}</Box>
        )}

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
            {!isImageConfirmed && (
              <Box className="flex justify-center space-x-4 mb-6">
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
              </Box>
            )}

            {showCropper && imageSrc && (
              <div>
                <Cropper
                  src={imageSrc}
                  style={{ height: "400px", width: "100%" }}
                  initialAspectRatio={1}
                  guides={false}
                  ref={cropperRef}
                  viewMode={1}
                  dragMode="move"
                />
                <Box className="flex justify-center space-x-4 mt-4">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCropComplete} // Call the crop complete handler
                  >
                    Confirm Crop
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleRetake} // Allow the user to retake the image
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
