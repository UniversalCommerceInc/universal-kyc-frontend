import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useGetKycDataQuery } from "../features/api/kycApiSlice";

const SuccessPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get KYC ID from the route

  // Fetch KYC data using the query
  const { data, isLoading, error } = useGetKycDataQuery(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-medium text-red-600">
          Error fetching data. Please try again.
        </div>
      </div>
    );
  }

  const { kyc } = data;
  const { name, email, kycStatus, selfieImage } = kyc;

  const handleBackToDashboard = () => {
    navigate(`/kyc/${id}`); // Redirect to dashboard
  };

  const handleContactSupport = () => {
    navigate("/support"); // Redirect to support
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-200 via-green-300 to-blue-300 opacity-40 rounded-full blur-[180px]"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200 via-purple-300 to-pink-300 opacity-40 rounded-full blur-[180px]"></div>
      </div>

      {/* Success Card */}
      <div className="relative z-10 bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl text-center border border-gray-200">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-8xl drop-shadow-lg" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Congratulations, {name.split(" ")[0]}!
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mb-6">
          Your KYC has been successfully submitted and is currently under review. 
          We’ll notify you at <span className="font-semibold text-gray-800">{email}</span> once the process is completed.
        </p>

        {/* User Selfie */}
        <div className="flex justify-center mb-6">
          <img
            src={selfieImage}
            alt="User Selfie"
             crossOrigin="anonymous"
            className="w-28 h-28 rounded-full border-4 border-green-500 shadow-lg object-cover"
          />
        </div>

        {/* Status Badge */}
        <div
  className={`inline-block px-5 py-2 text-sm font-medium shadow-md mb-6 rounded-full ${
    kycStatus === "Rejected"
      ? "bg-red-600 text-white"
      : kycStatus === "Verified"
      ? "bg-green-600 text-white"
      : "bg-yellow-500 text-white"
  }`}
>
  KYC Status: {kycStatus}
</div>


        {/* Action Buttons */}
        <div className="flex justify-center space-x-6 mt-6">
          <button
            onClick={handleBackToDashboard}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-300 font-medium"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleContactSupport}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-300 font-medium"
          >
            Contact Support
          </button>
        </div>
      </div>

      {/* Floating Decorations */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 opacity-30 blur-[140px]"></div>
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-gradient-to-r from-pink-300 via-yellow-300 to-red-300 opacity-30 blur-[140px]"></div>
    </div>
  );
};

export default SuccessPage;
