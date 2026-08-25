import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { useGetOtpMutation } from "../../api/user/get-otp-mutation"
import { useVerifyOtpMutation } from "../../api/user/verify-otp-mutation"
import { useUpdateUserMutation } from "../../api/user/update-user-mutation"
import { sanitizePhoneNumber } from "../../constants/Utils"
import { validatePasswordStrength, validatePasswordsMatch } from "./SignupPage"
import styles from "./Auth.module.css"

const RESEND_DELAY = 60

const ForgotPasswordPage = () => {
  const [phone, setPhone] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const { mutate: sendOtp, isPending: sendingOtp } = useGetOtpMutation()
  const { mutateAsync: verifyOtp, isPending: verifyingOtp } =
    useVerifyOtpMutation()
  const { mutate: updatePassword, isPending: isResetting } =
    useUpdateUserMutation()

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (resendTimer > 0) {
      intervalRef.current = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!)
            return 0
          }

          return t - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [resendTimer])

  const handleSendOtp = () => {
    const sanitized = sanitizePhoneNumber(phone)

    if (!sanitized) {
      setError("Please enter a phone number")
      return
    }

    setError("")

    sendOtp(sanitized, {
      onSuccess: () => {
        setOtpSent(true)
        setResendTimer(RESEND_DELAY)
      },
      onError: () =>
        setError("Failed to send OTP. Please check your phone number."),
    })
  }

  const handleVerifyOtp = async () => {
    const sanitized = sanitizePhoneNumber(phone)

    try {
      const result = await verifyOtp({ phoneNumber: sanitized, otpCode })

      if (result.valid) {
        setIsOtpVerified(true)
        setError("")
      } else setError("Invalid OTP. Please try again.")
    } catch {
      setError("OTP verification failed. Try again.")
    }
  }

  const handleResetPassword = () => {
    const se = validatePasswordStrength(newPassword)
    const me = validatePasswordsMatch(newPassword, confirmPassword)

    if (se) {
      setError(se)
      return
    }

    if (me) {
      setError(me)
      return
    }

    const sanitized = sanitizePhoneNumber(phone)

    updatePassword(
      { phoneNumber: sanitized, password: newPassword },
      {
        onSuccess: () => {
          setSuccessMessage("Password reset successfully. You can now log in.")
          setError("")
        },
        onError: (err) =>
          setError(`Failed to reset password. ${(err as Error).message}`),
      }
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Reset Your Password</h1>
        {!successMessage && (
          <p className={styles.stepHint}>
            Enter your phone number to receive an OTP and reset your password.
          </p>
        )}

        {successMessage ? (
          <>
            <p className={styles.successText}>{successMessage}</p>
            <Link
              to="/"
              className={styles.btn}
              style={{
                display: "block",
                textAlign: "center",
                lineHeight: "48px",
              }}
            >
              Back to Login
            </Link>
          </>
        ) : (
          <>
            {/* Phone input — disabled after OTP sent */}
            {!otpSent && (
              <div className={styles.fieldGroup}>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="+49123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}

            {/* OTP entry */}
            {otpSent && !isOtpVerified && (
              <>
                <p className={styles.hint}>OTP sent to {phone}</p>
                <div className={styles.fieldGroup}>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="Enter OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                </div>
                <button
                  className={styles.btn}
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp}
                >
                  {verifyingOtp ? "Verifying…" : "Verify OTP"}
                </button>
                <button
                  className={`${styles.btn} ${resendTimer > 0 ? styles.btnDisabled : ""}`}
                  onClick={handleSendOtp}
                  disabled={resendTimer > 0}
                  style={{
                    marginTop: 0,
                    background: "transparent",
                    color: "var(--primary)",
                    border: "1px solid var(--primary)",
                  }}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </>
            )}

            {/* Send OTP button */}
            {!otpSent && (
              <button
                className={styles.btn}
                onClick={handleSendOtp}
                disabled={sendingOtp || !phone}
              >
                {sendingOtp ? "Sending…" : "Get OTP"}
              </button>
            )}

            {/* New password fields */}
            {isOtpVerified && (
              <>
                <div className={styles.fieldGroup}>
                  <div className={styles.passwordRow}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={styles.passwordInput}
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword((p) => !p)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.passwordRow}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      className={styles.passwordInput}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowConfirm((p) => !p)}
                    >
                      {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button
                  className={styles.btn}
                  onClick={handleResetPassword}
                  disabled={isResetting}
                >
                  {isResetting ? "Resetting…" : "Reset Password"}
                </button>
              </>
            )}

            {error && <p className={styles.errorText}>{error}</p>}
          </>
        )}

        <Link
          to="/"
          className={styles.linkText}
          style={{ textAlign: "center", marginTop: 8 }}
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
