import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { setTokens } from "../store/auth.slice";
import { authApi } from "../api/auth.api";

export function Register() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { data } = await authApi.register(email, password);
      dispatch(setTokens(data.data));
      navigate("/profiles");
    } catch (e: unknown) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center">
      <div className="w-full max-w-md p-10">
        <div className="text-[#E50914] font-extrabold text-3xl tracking-tighter mb-8">NETFLIX</div>
        <h1 className="text-white text-3xl font-bold mb-2">Create account</h1>
        <p className="text-gray-400 text-sm mb-8">Join Netflix and start watching.</p>

        {error && <div className="bg-red-700 text-white text-sm px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email" placeholder="Email address" value={email}
            onChange={(e) => setEmail(e.target.value)} required
            className="w-full bg-[#333] text-white rounded px-4 py-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="password" placeholder="Password (min 8 chars)" value={password}
            onChange={(e) => setPassword(e.target.value)} required minLength={8}
            className="w-full bg-[#333] text-white rounded px-4 py-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            type="submit" disabled={loading}
            className="w-full bg-[#E50914] hover:bg-[#f6121d] disabled:opacity-60 text-white font-bold py-4 rounded transition-colors"
          >
            {loading ? "Creating account..." : "Get Started"}
          </button>
        </form>

        <p className="text-gray-500 mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-white font-semibold hover:underline">Sign in.</Link>
        </p>
      </div>
    </div>
  );
}
