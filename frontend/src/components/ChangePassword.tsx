import { useState } from "react";
import { useAuth } from "../context/useAuth.ts";
import { changePassword } from "../services/userService.ts";

const MIN_LENGTH = 8;

/**
 * Shown instead of the dashboard while the signed-in user must change their password
 * (an admin chose it). The API answers 403 PASSWORD_CHANGE_REQUIRED to everything else
 * until this succeeds.
 */
function ChangePassword() {
    const { token, loginUser } = useAuth();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Fill in all three fields!");
            return;
        }
        if (newPassword.length < MIN_LENGTH || !/\S/.test(newPassword)) {
            setError(`The new password needs at least ${MIN_LENGTH} characters.`);
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("The new passwords don't match.");
            return;
        }
        if (newPassword === currentPassword) {
            setError("Choose a password different from the current one.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await changePassword(token, { currentPassword, newPassword });
            // The new token no longer needs a change, so this swaps the dashboard in.
            loginUser(response.data.user, response.data.token);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 bg-white p-6 rounded-lg border border-gray-300 text-left">
            <h2 className="text-2xl font-semibold mb-2 text-gray-700">
                Choose a new password
            </h2>
            <p className="text-gray-600 mb-4">
                Your account was set up with a temporary password. Choose your own before you continue.
            </p>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <input
                    type="password"
                    placeholder="Current password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
                />

                <input
                    type="password"
                    placeholder={`New password (at least ${MIN_LENGTH} characters)`}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
                />

                <input
                    type="password"
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
                />

                {error && (
                    <p className="text-red-500 mb-2">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white font-semibold py-2 rounded"
                >
                    {loading ? "Saving..." : "Change password"}
                </button>
            </form>
        </div>
    );
}

export default ChangePassword;
