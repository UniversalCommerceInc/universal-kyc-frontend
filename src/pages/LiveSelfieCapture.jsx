// import React, { useRef, useState, useEffect } from "react";
// import Webcam from "react-webcam";
// import * as faceapi from "face-api.js";
// import { Typography } from "@mui/material";
// import { useUploadKycMutation } from "../features/api/assetUploadApiSlice";

// // import { useParams } from "react-router-dom";

// const LiveSelfieCapture = ({ onNext, onBack, id, docImg }) => {
//   const webcamRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [faceDetected, setFaceDetected] = useState(false);
//   const [cameraActive, setCameraActive] = useState(false);
//   const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
//   const [selfieImage, setSelfieImage] = useState(null);
//   const [uploadKyc, { isLoading, error }] = useUploadKycMutation();


  
// console.log("id--------", id);
// console.log("docImg--------", docImg);

//   // Load face-api.js models
//   useEffect(() => {
//     const loadModels = async () => {
//       const MODEL_URL = process.env.PUBLIC_URL + "/models";
//       try {
//         await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
//         await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
//         await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
//         setModelsLoaded(true);
//       } catch (error) {
//         console.error("Error loading face-api.js models", error);
//       }
//     };
//     loadModels();
//   }, []);

//   const detectFace = async () => {
//     if (
//       webcamRef.current &&
//       webcamRef.current.video.readyState === 4 &&
//       modelsLoaded
//     ) {
//       const video = webcamRef.current.video;
//       const displaySize = {
//         width: video.videoWidth,
//         height: video.videoHeight,
//       };

//       faceapi.matchDimensions(canvasRef.current, displaySize);

//       const detections = await faceapi.detectSingleFace(
//         video,
//         new faceapi.TinyFaceDetectorOptions({
//           inputSize: 512,
//           scoreThreshold: 0.5,
//         })
//       );

//       if (!detections) {
//         setFaceDetected(false);
//         canvasRef.current
//           .getContext("2d")
//           .clearRect(0, 0, displaySize.width, displaySize.height);
//         return;
//       }

//       const resizedDetections = faceapi.resizeResults(detections, displaySize);

//       canvasRef.current
//         .getContext("2d")
//         .clearRect(0, 0, displaySize.width, displaySize.height);

//       if (resizedDetections) {
//         setFaceDetected(true);
//         faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
//       } else {
//         setFaceDetected(false);
//       }
//     }
//   };

//   const handleTakePhoto = async () => {
//     try {
//       await navigator.mediaDevices.getUserMedia({ video: true });
//       setCameraActive(true);
//       setCameraPermissionGranted(true);
//     } catch (error) {
//       console.error("Camera permission denied:", error);
//       setCameraPermissionGranted(false);
//     }
//   };

//   useEffect(() => {
//     let interval;
//     if (cameraActive && modelsLoaded) {
//       interval = setInterval(() => {
//         detectFace();
//       }, 1000); // Check for face every second
//     }
//     return () => clearInterval(interval); // Clean up interval on unmount
//   }, [cameraActive, modelsLoaded]);

//    const handleCapture = async () => {
//     const imageSrc = webcamRef.current.getScreenshot();
//     if (imageSrc) {
//       setSelfieImage(imageSrc);
//       setCameraActive(false);
//       try {
//         const selfieBlob = await fetch(imageSrc).then((res) => res.blob());
//         const documentBlob = await fetch(docImg).then((res) => res.blob());


//         // Ensure `docImg` is converted to Blob if it's not already a File or Blob
//         // let documentBlob;
//         // if (docImg instanceof File || docImg instanceof Blob) {
//         //   documentBlob = docImg;
//         // } else {
//         //   documentBlob = await fetch(docImg).then((res) => res.blob());
//         // }
  
//         // Create FormData and append files
//         const formData = new FormData();
//         formData.append("document", documentBlob, "document.jpg"); // Add document as Blob
//         formData.append("selfie", selfieBlob, "selfie.jpg"); // Add selfie as Blob
  
//         console.log("docImg as Blob----", documentBlob);
//         console.log("selfie as Blob----", selfieBlob);
  
//         // Make API request
//         const kycId = id || 
//         const response = await uploadKyc({ id, file: formData }).unwrap();
//         console.log("Upload successful:", response);
  
//         onNext(); // Proceed to the next step
//       } catch (apiError) {
//         console.error("Error during upload:", apiError);
//       }
//     }
//   };

//   const handleUpload = () => {
//     console.log("Upload button clicked");
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
//       <Typography
//         variant="h5"
//         className="text-center font-semibold mb-6 text-gray-800"
//       >
//         Live Selfie Capture
//       </Typography>

//       {!cameraActive && (
//         <p className="text-center text-lg text-gray-700 mb-6">
//           Please ensure your face is clearly visible. <br />
//           Click <span className="text-blue-600 font-semibold">'Take'</span> to
//           start capturing your live selfie.
//         </p>
//       )}

//       <div className="relative w-full max-w-lg h-80 mb-6 rounded-xl overflow-hidden shadow-2xl bg-white flex items-center justify-center">
//         {!cameraActive ? (
//           <div className="w-full h-full flex items-center justify-center">
//             <div className="flex flex-col items-center justify-center">
//               <div className="relative w-40 h-40 rounded-full border-4 border-blue-500 flex items-center justify-center">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-24 w-24 text-blue-500 animate-pulse"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth={2}
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <path d="M15 3h4.8c.7 0 1.2.5 1.2 1.2v4.8c0 .7-.5 1.2-1.2 1.2H15" />
//                   <path d="M4 16c0-2.2 1.8-4 4-4h8c2.2 0 4 1.8 4 4v5H4v-5z" />
//                   <circle cx="12" cy="10" r="3" />
//                   <path d="M5 3h3v3H5z" />
//                 </svg>
//               </div>
//               <p className="text-gray-500 mt-4 font-medium ">
//                 Align your face within the circle
//               </p>
//             </div>
//           </div>
//         ) : (
//           <div className="relative">
//             <Webcam
//               audio={false}
//               ref={webcamRef}
//               screenshotFormat="image/jpeg"
//               className="w-full h-full object-cover rounded-xl shadow-lg"
//               videoConstraints={{
//                 width: 1280,
//                 height: 720,
//                 facingMode: "user",
//               }}
//             />
//             <canvas
//               ref={canvasRef}
//               className="absolute top-0 left-0 w-full h-full rounded-xl z-20"
//             />
//           </div>
//         )}
//       </div>

//       <div className="flex space-x-4">
//         {/* <button
//           className="px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
//           onClick={handleUpload}
//         >
//           Upload
//         </button> */}

//         {cameraActive ? (
//           faceDetected ? (
//             <button
//               className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:bg-blue-500 transition duration-300"
//               onClick={handleCapture}
//             >
//               Capture
//             </button>
//           ) : (
//             <button
//               disabled
//               className="px-6 py-2 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed"
//             >
//               Detecting Face...
//             </button>
//           )
//         ) : (
//           <button
//             className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:bg-blue-500 transition duration-300"
//             onClick={handleTakePhoto}
//           >
//             Take
//           </button>
//         )}
//       </div>

//       {!cameraPermissionGranted && cameraActive && (
//         <p className="text-red-500 mt-4">
//           Camera permission is required to proceed.
//         </p>
//       )}
//     </div>
//   );
// };

// export default LiveSelfieCapture;


// // import React, { useRef, useState, useEffect } from "react";
// // import Webcam from "react-webcam";
// // import * as faceapi from "face-api.js";
// // import { Typography } from "@mui/material";
// // import { useUploadKycMutation } from "../features/api/assetUploadApiSlice";

// // const LiveSelfieCapture = ({ onNext, id, docImg }) => {
// //   const webcamRef = useRef(null);
// //   const canvasRef = useRef(null);
// //   const [modelsLoaded, setModelsLoaded] = useState(false);
// //   const [faceDetected, setFaceDetected] = useState(false);
// //   const [cameraActive, setCameraActive] = useState(false);
// //   const [selfieImage, setSelfieImage] = useState(null);
// //   const [uploadKyc, { isLoading, error }] = useUploadKycMutation();

// //   // Load face-api.js models
// //   useEffect(() => {
// //     const loadModels = async () => {
// //       const MODEL_URL = process.env.PUBLIC_URL + "/models";
// //       try {
// //         await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
// //         await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
// //         await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
// //         setModelsLoaded(true);
// //       } catch (error) {
// //         console.error("Error loading face-api.js models", error);
// //       }
// //     };
// //     loadModels();
// //   }, []);

// //   const detectFace = async () => {
// //     if (
// //       webcamRef.current &&
// //       webcamRef.current.video.readyState === 4 &&
// //       modelsLoaded
// //     ) {
// //       const video = webcamRef.current.video;
// //       const displaySize = {
// //         width: video.videoWidth,
// //         height: video.videoHeight,
// //       };

// //       faceapi.matchDimensions(canvasRef.current, displaySize);

// //       const detections = await faceapi.detectSingleFace(
// //         video,
// //         new faceapi.TinyFaceDetectorOptions()
// //       );

// //       if (detections) {
// //         setFaceDetected(true);
// //         const resizedDetections = faceapi.resizeResults(detections, displaySize);
// //         faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
// //       } else {
// //         setFaceDetected(false);
// //       }
// //     }
// //   };

// //   useEffect(() => {
// //     let interval;
// //     if (cameraActive && modelsLoaded) {
// //       interval = setInterval(() => {
// //         detectFace();
// //       }, 1000);
// //     }
// //     return () => clearInterval(interval);
// //   }, [cameraActive, modelsLoaded]);

// //   const handleCapture = async () => {
// //     const imageSrc = webcamRef.current.getScreenshot();
// //     if (imageSrc) {
// //       setSelfieImage(imageSrc);
// //       setCameraActive(false);
// //       try {
// //         const selfieBlob = await fetch(imageSrc).then((res) => res.blob());

// //         // Ensure `docImg` is converted to Blob if it's not already a File or Blob
// //         let documentBlob;
// //         if (docImg instanceof File || docImg instanceof Blob) {
// //           documentBlob = docImg;
// //         } else {
// //           documentBlob = await fetch(docImg).then((res) => res.blob());
// //         }
  
// //         // Create FormData and append files
// //         const formData = new FormData();
// //         formData.append("document", documentBlob, "document.jpg"); // Add document as Blob
// //         formData.append("selfie", selfieBlob, "selfie.jpg"); // Add selfie as Blob
  
// //         console.log("docImg as Blob----", documentBlob);
// //         console.log("selfie as Blob----", selfieBlob);
  
// //         // Make API request
// //         const response = await uploadKyc({ id, file: formData }).unwrap();
// //         console.log("Upload successful:", response);
  
// //         onNext(); // Proceed to the next step
// //       } catch (apiError) {
// //         console.error("Error during upload:", apiError);
// //       }
// //     }
// //   };

// //   return (
// //     <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
// //       <Typography
// //         variant="h5"
// //         className="text-center font-semibold mb-6 text-gray-800"
// //       >
// //         Live Selfie Capture
// //       </Typography>

// //       <div className="relative w-full max-w-lg h-80 mb-6 rounded-xl overflow-hidden shadow-2xl bg-white flex items-center justify-center">
// //         {cameraActive ? (
// //           <div className="relative">
// //             <Webcam
// //               audio={false}
// //               ref={webcamRef}
// //               screenshotFormat="image/jpeg"
// //               className="w-full h-full object-cover rounded-xl shadow-lg"
// //               videoConstraints={{
// //                 width: 1280,
// //                 height: 720,
// //                 facingMode: "user",
// //               }}
// //             />
// //             <canvas
// //               ref={canvasRef}
// //               className="absolute top-0 left-0 w-full h-full rounded-xl z-20"
// //             />
// //           </div>
// //         ) : (
// //           <p className="text-center text-lg text-gray-700 mb-6">
// //             Click <span className="text-blue-600 font-semibold">Take</span> to
// //             start capturing your live selfie.
// //           </p>
// //         )}
// //       </div>

// //       <div className="flex space-x-4">
// //         {cameraActive ? (
// //           faceDetected ? (
// //             <button
// //               className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:bg-blue-500 transition duration-300"
// //               onClick={handleCapture}
// //               disabled={isLoading}
// //             >
// //               {isLoading ? "Uploading..." : "Capture"}
// //             </button>
// //           ) : (
// //             <button
// //               disabled
// //               className="px-6 py-2 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed"
// //             >
// //               Detecting Face...
// //             </button>
// //           )
// //         ) : (
// //           <button
// //             className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:bg-blue-500 transition duration-300"
// //             onClick={() => setCameraActive(true)}
// //           >
// //             Take
// //           </button>
// //         )}
// //       </div>

// //       {error && (
// //         <p className="text-red-500 mt-4">
// //           {error?.data?.message || "Error uploading data."}
// //         </p>
// //       )}
// //     </div>
// //   );
// // };

// // export default LiveSelfieCapture;



import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useUploadKycMutation } from "../features/api/assetUploadApiSlice";
import { setKycId } from "../features/auth/kycSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const LiveSelfieCapture = ({ onNext, onBack, docImg }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [submissionInProgress, setSubmissionInProgress] = useState(false); // State for submission loader
  const [uploadKyc, { isLoading }] = useUploadKycMutation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const kycId = useSelector((state) => state.kyc.kycId);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + "/models";
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading face-api.js models", error);
      }
    };
    loadModels();
  }, []);

  // const detectFace = async () => {
  //   if (
  //     webcamRef.current &&
  //     webcamRef.current.video.readyState === 4 &&
  //     modelsLoaded
  //   ) {
  //     const video = webcamRef.current.video;
  //     const displaySize = {
  //       width: video.videoWidth,
  //       height: video.videoHeight,
  //     };

  //     faceapi.matchDimensions(canvasRef.current, displaySize);

  //     const detections = await faceapi.detectSingleFace(
  //       video,
  //       new faceapi.TinyFaceDetectorOptions({
  //         inputSize: 512,
  //         scoreThreshold: 0.5,
  //       })
  //     );

  //     if (!detections) {
  //       setFaceDetected(false);
  //       canvasRef.current
  //         .getContext("2d")
  //         .clearRect(0, 0, displaySize.width, displaySize.height);
  //       return;
  //     }

  //     const resizedDetections = faceapi.resizeResults(detections, displaySize);

  //     canvasRef.current
  //       .getContext("2d")
  //       .clearRect(0, 0, displaySize.width, displaySize.height);

  //     if (resizedDetections) {
  //       setFaceDetected(true);
  //       faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
  //     } else {
  //       setFaceDetected(false);
  //     }
  //   }
  // };


  const detectFace = async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      modelsLoaded &&
      canvasRef.current
    ) {
      const video = webcamRef.current.video;
      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };
  
      faceapi.matchDimensions(canvasRef.current, displaySize);
  
      const detections = await faceapi.detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.5,
        })
      );
  
      if (!detections) {
        setFaceDetected(false);
        if (canvasRef.current) {
          canvasRef.current
            .getContext("2d")
            .clearRect(0, 0, displaySize.width, displaySize.height);
        }
        return;
      }
  
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
  
      if (canvasRef.current) {
        canvasRef.current
          .getContext("2d")
          .clearRect(0, 0, displaySize.width, displaySize.height);
  
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
      }
      setFaceDetected(true);
    }
  };
  
  const handleTakePhoto = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraActive(true);
      setCameraPermissionGranted(true);
    } catch (error) {
      console.error("Camera permission denied:", error);
      setCameraPermissionGranted(false);
    }
  };

  useEffect(() => {
    let interval;
    if (cameraActive && modelsLoaded) {
      interval = setInterval(() => {
        detectFace();
      }, 1000); // Check for face every second
    }
    return () => clearInterval(interval); // Clean up interval on unmount
  }, [cameraActive, modelsLoaded]);

  const handleCapture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCameraActive(false);
      setSubmissionInProgress(true); // Show loader when submission starts
      try {
        const selfieBlob = await fetch(imageSrc).then((res) => res.blob());
        const documentBlob = await fetch(docImg).then((res) => res.blob());

        const formData = new FormData();
        formData.append("document", documentBlob, "document.jpg");
        formData.append("selfie", selfieBlob, "selfie.jpg");

        console.log("Uploading form data...");
        const response = await uploadKyc({ id: kycId, file: formData }).unwrap();
        console.log("Upload successful:", response);

        const { id } = response.kyc;

        dispatch(setKycId(id));
        navigate(`/kyc/success/${id}`);
      } catch (apiError) {
        console.error("Error during upload:", apiError);
        toast.error(
          apiError?.data?.details?.message || "Something went wrong. Please try again.",
          {
            style: { background: "#fee2e2", color: "#b91c1c" },
            icon: "❌",
          }
        );
      } finally {
        setSubmissionInProgress(false); // Hide loader once submission ends
      }
    } else {
      toast.error("Unable to capture image. Please try again.", {
        style: { background: "#fee2e2", color: "#b91c1c" },
        icon: "📸",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
      {submissionInProgress ? (
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-700 mt-4">Submitting KYC data...</p>
        </div>
      ) : (
        <>
          <Typography
            variant="h5"
            className="text-center font-semibold mb-6 text-gray-800"
          >
            Live Selfie Capture
          </Typography>

          {!cameraActive && (
            <p className="text-center text-lg text-gray-700 mb-6">
              Please ensure your face is clearly visible. <br />
              Click <span className="text-blue-600 font-semibold">'Take'</span> to
              start capturing your live selfie.
            </p>
          )}

          <div className="relative w-full max-w-lg h-80 mb-6 rounded-xl overflow-hidden shadow-2xl bg-white flex items-center justify-center">
            {!cameraActive ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-40 h-40 rounded-full border-4 border-blue-500 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-blue-500 animate-pulse"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 3h4.8c.7 0 1.2.5 1.2 1.2v4.8c0 .7-.5 1.2-1.2 1.2H15" />
                      <path d="M4 16c0-2.2 1.8-4 4-4h8c2.2 0 4 1.8 4 4v5H4v-5z" />
                      <circle cx="12" cy="10" r="3" />
                      <path d="M5 3h3v3H5z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mt-4 font-medium">
                    Align your face within the circle
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover rounded-xl shadow-lg"
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "user",
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full rounded-xl z-20"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            {cameraActive ? (
              faceDetected ? (
                <button
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:bg-blue-500 transition duration-300"
                  onClick={handleCapture}
                  disabled={isLoading}
                >
                  {isLoading ? "Uploading..." : "Capture"}
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-2 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed"
                >
                  Detecting Face...
                </button>
              )
            ) : (
              <button
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:bg-blue-500 transition duration-300"
                onClick={handleTakePhoto}
              >
                Take
              </button>
            )}
          </div>

          {!cameraPermissionGranted && cameraActive && (
            <p className="text-red-500 mt-4">
              Camera permission is required to proceed.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default LiveSelfieCapture;
