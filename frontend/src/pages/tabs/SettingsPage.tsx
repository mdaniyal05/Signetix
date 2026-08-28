import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Camera, User } from "lucide-react"
import { useAppContext } from "../../context/AppContext"
import { useSettingsQuery } from "../../api/settings/settings-query"
import { useUpdateUserMutation } from "../../api/user/update-user-mutation"
import { uploadProfilePicture } from "../../api/user/upload-profile-picture-mutation"
import { removeStorageValue } from "../../context/storage"
import { queryClient } from "../../api"
import EditableField from "../../components/EditableField"
import {
  validatePasswordStrength,
  validatePasswordsMatch,
} from "../auth/SignupPage"
import styles from "./SettingsPage.module.css"

const SettingsPage = () => {
  const navigate = useNavigate()
  const { phoneNumber, user, setUser, reset } = useAppContext()
  const { isLoading } = useSettingsQuery({ phoneNumber })
  const { mutate: updateUser } = useUpdateUserMutation()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const [editingPassword, setEditingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [confirmError, setConfirmError] = useState("")
  const [generalError, setGeneralError] = useState("")

  const handleLogout = () => {
    removeStorageValue("user")

    reset()
    queryClient.removeQueries()

    navigate("/", { replace: true })
  }

  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file || !user) return
    setUploading(true)
    try {
      const { publicUrl } = await uploadProfilePicture({
        imageFile: file,
        phoneNumber: user.phoneNumber,
      })

      setUser({ ...user, profilePicture: publicUrl })

      updateUser(
        { phoneNumber: user.phoneNumber, profilePicture: publicUrl },
        {
          onSuccess: (data) => setUser({ ...user, ...data }),
        }
      )
    } catch (err) {
      alert("Failed to upload profile picture: " + (err as Error).message)
    } finally {
      setUploading(false)
      // reset input so same file can be picked again
      e.target.value = ""
    }
  }

  const resetPasswordFields = () => {
    setNewPassword("")
    setConfirmPassword("")
    setPasswordError("")
    setConfirmError("")
    setGeneralError("")
    setShowNew(false)
    setShowConfirm(false)
    setEditingPassword(false)
  }

  const handleChangePassword = () => {
    if (!user) return

    setGeneralError("")

    const se = validatePasswordStrength(newPassword)
    const me = validatePasswordsMatch(newPassword, confirmPassword)

    setPasswordError(se)
    setConfirmError(me)

    if (se || me) return

    updateUser(
      { phoneNumber: user.phoneNumber, password: newPassword },
      {
        onSuccess: () => {
          resetPasswordFields()
          alert("Password changed successfully")
        },
        onError: () =>
          setGeneralError("Failed to update password. Please try again."),
      }
    )
  }

  const passwordInvalid =
    !newPassword || !confirmPassword || !!passwordError || !!confirmError

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    )
  }

  // const initial = user?.name?.charAt(0)?.toUpperCase() ?? "?"

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Profile header */}
        <div className={styles.profileHeader}>
          {/* Avatar */}
          <div className={styles.avatarWrap}>
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                className={styles.avatar}
                alt={user.name}
              />
            ) : (
              <div className={styles.avatarFallback}>
                <User size={28} color="var(--gray)" />
              </div>
            )}
            <button
              className={styles.cameraBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Change profile picture"
              disabled={uploading}
            >
              {uploading ? (
                <div className={styles.miniSpinner} />
              ) : (
                <Camera size={14} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePickImage}
            />
          </div>

          {/* Editable name + status */}
          <div className={styles.profileText}>
            <EditableField
              max={30}
              value={user?.name ?? ""}
              onSave={(newName) => {
                if (!user) return
                setUser({ ...user, name: newName })
                updateUser(
                  { phoneNumber: user.phoneNumber, name: newName },
                  { onSuccess: (data) => setUser({ ...user, name: data.name }) }
                )
              }}
              size="large"
              name="name"
            />
            <EditableField
              max={100}
              value={user?.profileStatus ?? ""}
              onSave={(newStatus) => {
                if (!user) return
                setUser({ ...user, profileStatus: newStatus })
                updateUser(
                  { phoneNumber: user.phoneNumber, profileStatus: newStatus },
                  {
                    onSuccess: (data) =>
                      setUser({ ...user, profileStatus: data.profileStatus }),
                  }
                )
              }}
              size="small"
              name="status"
            />
          </div>
        </div>

        {/* Account section */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Account Settings</p>

          <div className={styles.field}>
            <span className={styles.label}>Phone</span>
            <span className={styles.value}>{phoneNumber}</span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Password</span>
            {!editingPassword ? (
              <button
                className={styles.passwordMask}
                onClick={() => setEditingPassword(true)}
              >
                ••••••••
              </button>
            ) : (
              <div className={styles.passwordBlock}>
                {/* New password */}
                <div className={styles.pwRow}>
                  <div
                    className={`${styles.pwField} ${passwordError ? styles.pwError : ""}`}
                  >
                    <input
                      type={showNew ? "text" : "password"}
                      className={styles.pwInput}
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onBlur={() =>
                        setPasswordError(validatePasswordStrength(newPassword))
                      }
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowNew((p) => !p)}
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className={styles.errorText}>{passwordError}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div className={styles.pwRow}>
                  <div
                    className={`${styles.pwField} ${confirmError ? styles.pwError : ""}`}
                  >
                    <input
                      type={showConfirm ? "text" : "password"}
                      className={styles.pwInput}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() =>
                        setConfirmError(
                          validatePasswordsMatch(newPassword, confirmPassword)
                        )
                      }
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowConfirm((p) => !p)}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmError && (
                    <p className={styles.errorText}>{confirmError}</p>
                  )}
                </div>

                {generalError && (
                  <p className={styles.errorText}>{generalError}</p>
                )}

                <div className={styles.pwActions}>
                  <button
                    className={`${styles.saveBtn} ${passwordInvalid ? styles.saveBtnDisabled : ""}`}
                    onClick={handleChangePassword}
                    disabled={passwordInvalid}
                  >
                    Change Password
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={resetPasswordFields}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default SettingsPage
