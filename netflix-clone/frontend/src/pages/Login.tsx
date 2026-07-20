import { useState, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { AppDispatch, RootState } from "../store";
import { loginThunk } from "../store/auth.slice";

export function Login() {
  const dispatch  = useDispatch<AppDispatch>();
  const navigate  = useNavigate();
  const { status, error } = useSelector((s: RootState) => s.auth);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const r = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(r)) navigate("/profiles");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundImage: "url(https://assets.nflxext.com/ffe/siteui/vlv3/9134db96-10d6-4a64-a619-a21da22f8999/a449fabb-05e4-4c8a-b062-b0bec7c4a891/IN-en-20240205-popsignuptwoweeks-perspective_alpha_website_medium.jpg)", backgroundSize: "cover" }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 bg-black/75 p-10 md:p-16 rounded-md w-full max-w-md">
        <div className="text-[#E50914] font-extrabold text-3xl tracking-tighter mb-8">NETFLIX</div>
        <h1 className="text-white text-3xl font-bold mb-8">Sign In</h1>

        {error && (
          <div className="bg-[#E87C03] text-white text-sm px-4 py-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email" placeholder="Email address" value={email}
            onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
            className="w-full bg-[#333] text-white rounded px-4 py-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
            className="w-full bg-[#333] text-white rounded px-4 py-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            type="submit" disabled={status === "loading"}
            className="w-full bg-[#E50914] hover:bg-[#f6121d] disabled:opacity-60 text-white font-bold py-4 rounded transition-colors"
          >
            {status === "loading" ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-gray-500 mt-6 text-sm">
          New to Netflix?{" "}
          <Link to="/register" className="text-white font-semibold hover:underline">Sign up now.</Link>
        </p>
      </div>
    </div>
  );
}
