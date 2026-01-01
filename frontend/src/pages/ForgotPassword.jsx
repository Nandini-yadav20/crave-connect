import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const serverUrl = "http://localhost:8000"; // adjust if needed

  /* ================= SEND OTP ================= */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );
      setStep(2);
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      setStep(3);
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
    }
  };

  /* ================= RESET PASSWORD ================= */
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      );

      alert("Password reset successful");
      navigate("/signIn");
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fff9f6] p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">

        {/* BACK BUTTON */}
        <button
          onClick={() => setStep(step - 1)}
          className="flex items-center gap-1 mb-4 text-[#ff4d2d]"
        >
          <IoIosArrowRoundBack size={24} /> Back
        </button>

        {/* STEP 1: EMAIL */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <h2 className="text-xl font-semibold">Forgot Password</h2>

            <input
              type="email"
              placeholder="Enter email"
              className="w-full border px-4 py-3 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button className="w-full bg-orange-500 text-white py-3 rounded-lg">
              Send OTP
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <h2 className="text-xl font-semibold">Verify OTP</h2>

            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full border px-4 py-3 rounded-lg"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <button className="w-full bg-orange-500 text-white py-3 rounded-lg">
              Verify OTP
            </button>
          </form>
        )}

        {/* STEP 3: RESET PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <h2 className="text-xl font-semibold">Reset Password</h2>

            <input
              type="password"
              placeholder="New Password"
              className="w-full border px-4 py-3 rounded-lg"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full border px-4 py-3 rounded-lg"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button className="w-full bg-orange-500 text-white py-3 rounded-lg">
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
