import React, { useState, useRef } from "react";
import { Eye, EyeOff, Camera } from "lucide-react";

function Register() {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "", 
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [faceMessage, setFaceMessage] = useState("Camera not started");
  const [embeddingData, setEmbeddingData] = useState(null);

  // ---------------- VALIDATION ----------------
  const validate = () => {
    let newErrors = {};

    if (!form.username || form.username.length < 3)
      newErrors.username = "Username must be minimum 3 characters";

    if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Invalid email address";

    if (!form.password || form.password.length < 6)
      newErrors.password = "Password must be minimum 6 characters";

    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!form.terms)
      newErrors.terms = "You must accept terms & conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------- CAMERA ----------------
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      setCameraOn(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);

      setFaceMessage("Camera started. Please capture face.");
    } catch (error) {
      console.log(error);
      setFaceMessage("Camera error: " + error.name);
    }
  };
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  }

  const captureFace = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    // ✅ THIS IS IMPORTANT
    const imageData = canvas.toDataURL("image/jpeg");

    const response = await fetch("http://127.0.0.1:8001/api/face-capture/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: imageData,  // must send full base64 string
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setFaceVerified(true);
      setEmbeddingData(data.embedding);
      setFaceMessage("Face verified successfully ✅");

  stopCamera();
    } else {
      console.log("Backend Error:", data);
      setFaceVerified(false);
      setFaceMessage(data.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // 🔥 Validate form first
    if (!validate()) return;

    if (!faceVerified) {
      alert("Please verify your face first");
      return;
    }

    setLoading(true);

    try {
      const floatEmbedding = embeddingData.map(value => parseFloat(value));
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          face_embedding: floatEmbedding,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        console.log("No JSON returned");
      }
      if (response.ok) {
        alert("OTP sent to your email ✅");

        // Optional: store email for OTP page
        // localStorage.setItem("email", form.email);

        // Navigate if using react-router
        // navigate("/verify-otp");

      } else {
        alert("Error: " + JSON.stringify(data));
      }
    } catch (error) {
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-6xl grid md:grid-cols-2 overflow-hidden">

        {/* LEFT SIDE FORM */}
        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Create Account
          </h2>

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Username */}
            <div>
              <input
                type="text"
                placeholder="Username"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
              {errors.username && (
                <p className="text-red-500 text-sm">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
              <div
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPass ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
              />
              <div
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() =>
                  setShowConfirmPass(!showConfirmPass)
                }
              >
                {showConfirmPass ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) =>
                  setForm({ ...form, terms: e.target.checked })
                }
              />
              <label className="text-sm">
                I agree to Terms & Conditions
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-500 text-sm">{errors.terms}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!faceVerified || loading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                faceVerified && !loading
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Registering..." : "Create Account"}
            </button>

            <p className="text-sm text-center">
              Already registered?{" "}
              <span className="text-indigo-600 cursor-pointer">
                Login
              </span>
            </p>
          </form>
        </div>

        {/* RIGHT SIDE CAMERA */}
        <div className="bg-gray-100 p-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-full h-64 bg-black rounded-xl overflow-hidden flex items-center justify-center">
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera size={60} className="text-gray-400" />
            )}
          </div>

          <button
            onClick={startCamera}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Start Camera
          </button>

          <button
            onClick={captureFace}
            disabled={!cameraOn}
            className={`px-6 py-2 rounded-lg text-white ${
              cameraOn
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Capture Face
          </button>

          <p
            className={`text-sm font-medium ${
              faceVerified ? "text-green-600" : "text-orange-500"
            }`}
          >
            {faceMessage}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;