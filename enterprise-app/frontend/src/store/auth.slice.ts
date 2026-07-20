import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../api/auth.api";
import { TokenPair } from "../types";

interface AuthState {
  accessToken:  string | null;
  refreshToken: string | null;
  status: "idle" | "loading" | "error";
  error:  string | null;
}

const initialState: AuthState = {
  accessToken:  localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  status: "idle",
  error:  null,
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(email, password);
      return data.data as TokenPair;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Login failed";
      return rejectWithValue(msg);
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try { await authApi.logout(); } catch { /* ignore */ }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<TokenPair>) {
      state.accessToken  = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem("accessToken",  action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    },
    logout(state) {
      state.accessToken  = null;
      state.refreshToken = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error  = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status       = "idle";
        state.accessToken  = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem("accessToken",  action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "error";
        state.error  = action.payload as string;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.accessToken  = null;
        state.refreshToken = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      });
  },
});

export const { setTokens, logout } = authSlice.actions;
export default authSlice.reducer;
