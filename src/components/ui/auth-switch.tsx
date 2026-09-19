"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import {
  Phone,
  User,
  Mail,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Salad,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { sendPhoneOtp, verifyPhoneOtp } from "@/app/actions/auth";
import InputOtp9 from "@/components/input-otp-9";

interface SignInFormData {
  phone: string;
}

interface SignUpFormData {
  fullName: string;
  phone: string;
  email?: string;
  foodPreference: "all" | "veg" | "non-veg" | "vegan";
}

interface OtpFormData {
  token: string;
}

export default function AuthSwitch() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Stored registration context for OTP verification step
  const [pendingPhone, setPendingPhone] = useState("");
  const [pendingFullName, setPendingFullName] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingFoodPreference, setPendingFoodPreference] = useState<"all" | "veg" | "non-veg" | "vegan">("all");

  // React Hook Form instances with onChange mode for live validation
  const signInForm = useForm<SignInFormData>({
    mode: "onChange",
    defaultValues: { phone: "" },
  });

  const signUpForm = useForm<SignUpFormData>({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      foodPreference: "all",
    },
  });

  const otpForm = useForm<OtpFormData>({
    mode: "onChange",
    defaultValues: { token: "" },
  });

  // Watch inputs to disable Send OTP and submit buttons until all mandatory fields are valid
  const signInPhone = signInForm.watch("phone") || "";
  const isSignInValid = /^[6-9]\d{9}$/.test(signInPhone.trim());

  const signUpFullName = signUpForm.watch("fullName") || "";
  const signUpPhone = signUpForm.watch("phone") || "";
  const signUpEmail = signUpForm.watch("email") || "";
  const isSignUpValid =
    signUpFullName.trim().length >= 2 &&
    /^[6-9]\d{9}$/.test(signUpPhone.trim()) &&
    (!signUpEmail.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpEmail.trim()));

  const otpToken = otpForm.watch("token") || "";
  const isOtpValid = /^\d{6}$/.test(otpToken.trim());

  // Switch between Sign In and Sign Up with clean state reset
  const handleModeSwitch = (toSignUp: boolean) => {
    setIsSignUp(toSignUp);
    setStep("phone");
    setError(null);
    setSuccessMsg(null);
    signInForm.reset();
    signUpForm.reset();
    otpForm.reset();
  };

  // Sign In submit (Step 1)
  const onSignInSubmit = async (data: SignInFormData) => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await sendPhoneOtp({
        fullName: "Customer",
        phone: data.phone,
      });

      if (!res.success) {
        setError(res.error || "Failed to send OTP.");
      } else {
        setPendingPhone(data.phone);
        setPendingFullName("Customer");
        setStep("otp");
        setSuccessMsg(`OTP sent to ${res.formattedPhone}`);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Sign Up submit (Step 1)
  const onSignUpSubmit = async (data: SignUpFormData) => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await sendPhoneOtp({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        foodPreference: data.foodPreference,
      });

      if (!res.success) {
        setError(res.error || "Failed to send OTP.");
      } else {
        setPendingPhone(data.phone);
        setPendingFullName(data.fullName);
        setPendingEmail(data.email || "");
        setPendingFoodPreference(data.foodPreference);
        setStep("otp");
        setSuccessMsg(`OTP sent to ${res.formattedPhone}`);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP submit (Step 2)
  const onOtpSubmit = async (data: OtpFormData) => {
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("phone", pendingPhone);
      formData.append("token", data.token);
      formData.append("fullName", pendingFullName || "Customer");
      if (pendingEmail) formData.append("email", pendingEmail);
      if (pendingFoodPreference) formData.append("foodPreference", pendingFoodPreference);

      const res = await verifyPhoneOtp(formData);

      if (!res.success) {
        setError(res.error || "Invalid OTP code.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-switch-root">
      <style>{`
        .auth-switch-root,
        .auth-switch-root * {
          box-sizing: border-box;
        }

        .auth-switch-root {
          min-height: 100vh;
          width: 100%;
          background: #090a0d;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: var(--font-huninn), "Huninn", sans-serif;
        }

        .back-home-btn {
          position: absolute;
          top: 28px;
          left: 28px;
          z-index: 20;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 40px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font-size: 0.82rem;
          font-family: var(--font-huninn), "Huninn", sans-serif;
          letter-spacing: 0.05em;
          text-decoration: none;
          transition: all 0.25s ease;
          backdrop-blur: 10px;
        }

        .back-home-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #ffbe33;
          color: #ffbe33;
          transform: translateX(-3px);
        }

        .ambient-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,190,51,0.08) 0%, rgba(230,0,0,0.05) 50%, transparent 70%);
          filter: blur(90px);
          pointer-events: none;
        }

        .container {
          position: relative;
          width: 100%;
          max-width: 980px;
          min-height: 660px;
          background: #12141a;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          box-shadow: 0 35px 80px rgba(0, 0, 0, 0.75);
          overflow: hidden;
        }

        .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s cubic-bezier(0.68, -0.15, 0.265, 1.15);
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        .form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 3.5rem;
          transition: all 0.3s 0.7s ease-in-out;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
          width: 100%;
        }

        .form-panel.sign-up-form {
          opacity: 0;
          z-index: 1;
          pointer-events: none;
          transform: scale(0.96);
        }

        .form-panel.sign-in-form {
          z-index: 2;
          pointer-events: all;
          transform: scale(1);
        }

        .form-title {
          font-size: 2.1rem;
          color: #ffffff;
          font-weight: 700;
          margin-bottom: 4px;
          text-align: center;
          font-family: var(--font-huninn), "Huninn", sans-serif;
          letter-spacing: -0.01em;
        }

        .form-subtitle {
          font-size: 0.82rem;
          color: #8a909d;
          margin-bottom: 20px;
          text-align: center;
          line-height: 1.4;
          font-family: var(--font-huninn), "Huninn", sans-serif;
        }

        /* Distinct, Clear Input Field Styles */
        .input-group {
          max-width: 360px;
          width: 100%;
          margin: 6px 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .input-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #d1d5db;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 4px;
          padding-left: 2px;
        }

        .input-label .required-star {
          color: #ffbe33;
        }

        .input-field {
          width: 100%;
          background: #0d0f16;
          border: 1.5px solid rgba(255, 255, 255, 0.18);
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          padding: 0 14px;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.45);
        }

        .input-field:hover {
          background: #131620;
          border-color: rgba(255, 190, 51, 0.5);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4), 0 0 12px rgba(255, 190, 51, 0.12);
        }

        .input-field:hover .icon {
          color: #ffbe33;
        }

        .input-field:focus-within {
          border-color: #ffbe33;
          background: #151926;
          box-shadow: 0 0 0 3px rgba(255, 190, 51, 0.25), inset 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .input-field:focus-within .icon {
          color: #ffbe33;
          transform: scale(1.08);
        }

        .input-field.has-error {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.22) !important;
        }

        .input-field .icon {
          color: #9ca3af;
          margin-right: 10px;
          flex-shrink: 0;
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .input-field input,
        .input-field select {
          background: transparent !important;
          background-color: transparent !important;
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          font-weight: 500;
          font-size: 0.95rem;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffbe33 !important;
          width: 100%;
          font-family: var(--font-huninn), "Huninn", sans-serif;
          letter-spacing: 0.02em;
        }

        .input-field select {
          appearance: none;
          cursor: pointer;
        }

        /* Prevent browser autofill from covering the styled input */
        .input-field input:-webkit-autofill,
        .input-field input:-webkit-autofill:hover,
        .input-field input:-webkit-autofill:focus,
        .input-field input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #0d0f16 inset !important;
          box-shadow: 0 0 0 1000px #0d0f16 inset !important;
          -webkit-text-fill-color: #ffffff !important;
          color: #ffffff !important;
          caret-color: #ffbe33 !important;
          transition: background-color 50000s ease-in-out 0s !important;
        }

        .input-field select option {
          background: #141722;
          color: #ffffff;
        }

        .input-field input::placeholder {
          color: #6b7280 !important;
          font-size: 0.88rem;
        }

        .field-error {
          color: #f87171;
          font-size: 0.72rem;
          margin-top: 1px;
          padding-left: 4px;
          font-family: var(--font-huninn), "Huninn", sans-serif;
        }

        .phone-badge {
          background: rgba(255, 190, 51, 0.12);
          border: 1px solid rgba(255, 190, 51, 0.3);
          color: #ffbe33;
          font-weight: 700;
          font-size: 0.82rem;
          padding: 2px 8px;
          border-radius: 6px;
          margin-right: 8px;
          letter-spacing: 0.04em;
        }

        .btn-gold {
          width: 100%;
          max-width: 360px;
          background: linear-gradient(135deg, #ffbe33 0%, #e6a827 100%);
          border: none;
          outline: none;
          height: 48px;
          border-radius: 12px;
          color: #0b0c0f;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 0.08em;
          margin-top: 14px;
          cursor: pointer;
          transition: all 0.25s ease;
          font-size: 0.82rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 8px 20px rgba(255, 190, 51, 0.25);
          font-family: var(--font-huninn), "Huninn", sans-serif;
        }

        .btn-gold:hover:not(:disabled) {
          background: linear-gradient(135deg, #ffd066 0%, #ffbe33 100%);
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(255, 190, 51, 0.35);
        }

        .btn-gold:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          background: #232733 !important;
          color: #6b7280 !important;
          box-shadow: none !important;
          transform: none !important;
        }

        .error-banner {
          max-width: 360px;
          width: 100%;
          background: rgba(230, 0, 0, 0.15);
          border: 1px solid rgba(230, 0, 0, 0.4);
          color: #ff7b7b;
          font-size: 0.78rem;
          padding: 10px 14px;
          border-radius: 12px;
          margin-bottom: 14px;
          text-align: center;
          font-family: var(--font-huninn), "Huninn", sans-serif;
        }

        .success-banner {
          max-width: 360px;
          width: 100%;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #4ade80;
          font-size: 0.78rem;
          padding: 10px 14px;
          border-radius: 12px;
          margin-bottom: 14px;
          text-align: center;
          font-family: var(--font-huninn), "Huninn", sans-serif;
        }

        .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }

        .left-panel {
          pointer-events: all;
          padding: 3rem 17% 2rem 12%;
        }

        .right-panel {
          pointer-events: none;
          padding: 3rem 12% 2rem 17%;
        }

        .panel .content {
          color: #fff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
          font-family: var(--font-huninn), "Huninn", sans-serif;
        }

        .panel h3 {
          font-weight: 700;
          line-height: 1.15;
          font-size: 1.75rem;
          margin-bottom: 10px;
          color: #ffffff;
        }

        .panel p {
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin-bottom: 22px;
        }

        .btn-transparent {
          background: transparent;
          border: 2px solid #ffffff;
          padding: 10px 28px;
          border-radius: 50px;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: var(--font-huninn), "Huninn", sans-serif;
        }

        .btn-transparent:hover {
          background: #ffffff;
          color: #0b0c0f;
          transform: translateY(-2px);
        }

        .right-panel .content {
          transform: translateX(800px);
        }

        .container.sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .container.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .container.sign-up-mode .signin-signup {
          left: 25%;
        }

        .container.sign-up-mode .form-panel.sign-up-form {
          opacity: 1;
          z-index: 2;
          pointer-events: all;
          transform: scale(1);
        }

        .container.sign-up-mode .form-panel.sign-in-form {
          opacity: 0;
          z-index: 1;
          pointer-events: none;
          transform: scale(0.96);
        }

        .container.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }

        .container.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .container.sign-up-mode .right-panel {
          pointer-events: all;
        }

        .container:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #ffbe33 0%, #e60000 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }

        @media (max-width: 870px) {
          .container {
            min-height: 780px;
            height: auto;
          }
          .signin-signup {
            width: 100%;
            top: 92%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }
          .signin-signup,
          .container.sign-up-mode .signin-signup {
            left: 50%;
          }
          .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }
          .right-panel {
            grid-row: 3 / 4;
          }
          .left-panel {
            grid-row: 1 / 2;
          }
          .panel .content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }
          .panel h3 {
            font-size: 1.3rem;
          }
          .panel p {
            display: none;
          }
          .container:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }
          .container.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }
          .container.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }
          .container.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }
          .right-panel .content {
            transform: translateY(300px);
          }
          .container.sign-up-mode .signin-signup {
            top: 6%;
            transform: translate(-50%, 0);
          }
        }
      `}</style>

      {/* Back to Home Button */}
      <Link href="/" className="back-home-btn">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Restaurant</span>
      </Link>

      <div className="ambient-glow" />

      <div className={isSignUp ? "container sign-up-mode" : "container"}>
        <div className="forms-container">
          <div className="signin-signup">
            
            {/* ======================================================== */}
            {/* SIGN IN FORM (PHONE OTP) */}
            {/* ======================================================== */}
            <div className="form-panel sign-in-form">
              <h2 className="form-title">Welcome Back</h2>
              <p className="form-subtitle">
                {step === "phone"
                  ? "Enter your mobile number to sign in to your account"
                  : "Enter the 6-digit verification code sent to your phone"}
              </p>

              {error && <div className="error-banner">{error}</div>}
              {successMsg && <div className="success-banner">{successMsg}</div>}

              {step === "phone" ? (
                <form
                  onSubmit={signInForm.handleSubmit(onSignInSubmit)}
                  className="w-full flex flex-col items-center"
                >
                  {/* Phone Input with clear label and visual structure */}
                  <div className="input-group">
                    <label className="input-label">
                      <span>Mobile Number</span>
                      <span className="required-star">*</span>
                    </label>
                    <div
                      className={`input-field ${
                        signInForm.formState.errors.phone ? "has-error" : ""
                      }`}
                    >
                      <Phone className="icon w-4 h-4" />
                      <span className="phone-badge">+91</span>
                      <input
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        maxLength={10}
                        autoComplete="tel"
                        {...signInForm.register("phone", {
                          required: "Mobile number is required",
                          pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: "Enter a valid 10-digit mobile number starting with 6-9",
                          },
                        })}
                      />
                    </div>
                    {signInForm.formState.errors.phone && (
                      <p className="field-error">
                        {signInForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <button type="submit" className="btn-gold" disabled={loading || !isSignInValid}>
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Send OTP</span>
                    )}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                  className="w-full flex flex-col items-center"
                >
                  {/* Integrated InputOtp9 component */}
                  <div className="w-full max-w-[360px] my-2">
                    <Controller
                      name="token"
                      control={otpForm.control}
                      rules={{
                        required: "OTP is required",
                        minLength: { value: 6, message: "Must be 6 digits" },
                        maxLength: { value: 6, message: "Must be 6 digits" },
                      }}
                      render={({ field }) => (
                        <InputOtp9
                          value={field.value}
                          onChange={field.onChange}
                          onComplete={(val) => {
                            field.onChange(val);
                            otpForm.handleSubmit(onOtpSubmit)();
                          }}
                          disabled={loading}
                          autoFocus={true}
                          label="Enter 6-digit Verification Code"
                          hasError={!!otpForm.formState.errors.token}
                        />
                      )}
                    />
                    {otpForm.formState.errors.token && (
                      <p className="field-error text-center mt-2">
                        {otpForm.formState.errors.token.message}
                      </p>
                    )}
                  </div>

                  <button type="submit" className="btn-gold" disabled={loading || !isOtpValid}>
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Sign In</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setError(null);
                      otpForm.reset();
                    }}
                    className="text-xs text-neutral-400 hover:text-white mt-4 underline transition-colors"
                  >
                    Change phone number
                  </button>
                </form>
              )}
            </div>

            {/* ======================================================== */}
            {/* SIGN UP FORM (FULL NAME + PHONE + OPTIONAL EMAIL + FOOD PREF) */}
            {/* ======================================================== */}
            <div className="form-panel sign-up-form">
              <h2 className="form-title">Join Calvary</h2>
              <p className="form-subtitle">
                {step === "phone"
                  ? "Create your dining account in seconds"
                  : "Verify your phone number to complete account setup"}
              </p>

              {error && <div className="error-banner">{error}</div>}
              {successMsg && <div className="success-banner">{successMsg}</div>}

              {step === "phone" ? (
                <form
                  onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}
                  className="w-full flex flex-col items-center"
                >
                  {/* Full Name */}
                  <div className="input-group">
                    <label className="input-label">
                      <span>Full Name</span>
                      <span className="required-star">*</span>
                    </label>
                    <div
                      className={`input-field ${
                        signUpForm.formState.errors.fullName ? "has-error" : ""
                      }`}
                    >
                      <User className="icon w-4 h-4" />
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        autoComplete="name"
                        {...signUpForm.register("fullName", {
                          required: "Full name is mandatory",
                          minLength: { value: 2, message: "Name must be at least 2 characters" },
                        })}
                      />
                    </div>
                    {signUpForm.formState.errors.fullName && (
                      <p className="field-error">
                        {signUpForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div className="input-group">
                    <label className="input-label">
                      <span>Mobile Number</span>
                      <span className="required-star">*</span>
                    </label>
                    <div
                      className={`input-field ${
                        signUpForm.formState.errors.phone ? "has-error" : ""
                      }`}
                    >
                      <Phone className="icon w-4 h-4" />
                      <span className="phone-badge">+91</span>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        autoComplete="tel"
                        {...signUpForm.register("phone", {
                          required: "Mobile number is mandatory",
                          pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: "Enter a valid 10-digit number starting with 6-9",
                          },
                        })}
                      />
                    </div>
                    {signUpForm.formState.errors.phone && (
                      <p className="field-error">
                        {signUpForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Optional Email */}
                  <div className="input-group">
                    <label className="input-label">
                      <span>Email Address</span>
                      <span className="text-neutral-500 font-normal lowercase text-[10px]">(optional)</span>
                    </label>
                    <div
                      className={`input-field ${
                        signUpForm.formState.errors.email ? "has-error" : ""
                      }`}
                    >
                      <Mail className="icon w-4 h-4" />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        autoComplete="email"
                        {...signUpForm.register("email", {
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Please enter a valid email address",
                          },
                        })}
                      />
                    </div>
                    {signUpForm.formState.errors.email && (
                      <p className="field-error">
                        {signUpForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Dietary Preference Selection */}
                  <div className="input-group">
                    <label className="input-label">
                      <span>Dietary Preference</span>
                    </label>
                    <div className="input-field relative">
                      <Salad className="icon w-4 h-4" />
                      <select
                        {...signUpForm.register("foodPreference")}
                        className="cursor-pointer pr-6"
                      >
                        <option value="all">All / No Restriction</option>
                        <option value="veg">Vegetarian (Pure Veg)</option>
                        <option value="non-veg">Non-Vegetarian</option>
                        <option value="vegan">Vegan (Plant-Based)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-neutral-400 pointer-events-none absolute right-3" />
                    </div>
                  </div>

                  <button type="submit" className="btn-gold" disabled={loading || !isSignUpValid}>
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Send Verification Code</span>
                    )}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                  className="w-full flex flex-col items-center"
                >
                  {/* Integrated InputOtp9 for Signup OTP */}
                  <div className="w-full max-w-[360px] my-2">
                    <Controller
                      name="token"
                      control={otpForm.control}
                      rules={{
                        required: "OTP is required",
                        minLength: { value: 6, message: "Must be 6 digits" },
                        maxLength: { value: 6, message: "Must be 6 digits" },
                      }}
                      render={({ field }) => (
                        <InputOtp9
                          value={field.value}
                          onChange={field.onChange}
                          onComplete={(val) => {
                            field.onChange(val);
                            otpForm.handleSubmit(onOtpSubmit)();
                          }}
                          disabled={loading}
                          autoFocus={true}
                          label="Enter 6-digit Verification Code"
                          hasError={!!otpForm.formState.errors.token}
                        />
                      )}
                    />
                    {otpForm.formState.errors.token && (
                      <p className="field-error text-center mt-2">
                        {otpForm.formState.errors.token.message}
                      </p>
                    )}
                  </div>

                  <button type="submit" className="btn-gold" disabled={loading || !isOtpValid}>
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Complete Registration</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setError(null);
                      otpForm.reset();
                    }}
                    className="text-xs text-neutral-400 hover:text-white mt-4 underline transition-colors"
                  >
                    Edit details or resend code
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

        {/* Sliding Panels */}
        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New to Calvary?</h3>
              <p>
                Create your dining account to book tables instantly and receive tailored culinary recommendations.
              </p>
              <button
                type="button"
                className="btn-transparent"
                onClick={() => handleModeSwitch(true)}
              >
                Sign Up
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>Already a Member?</h3>
              <p>
                Sign in with your phone number to manage your table bookings and dining preferences.
              </p>
              <button
                type="button"
                className="btn-transparent"
                onClick={() => handleModeSwitch(false)}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
