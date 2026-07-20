import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../api/auth.api";
import { TokenPair } from "../types";

interface AuthState {
  accessToken:  string | null;
  refreshToken: string | null;
  profileId:    string | null;
  status: "idle" | "loading" | "error";
  error:  string | null;
}

function load(): Partial<AuthState> {
  return {
    accessToken:  localStorage.getItem("nf_access")  || null,
    refreshToken: localStorage.getItem("nf_refresh") || null,
    profileId:    localStorage.getItem("nf_profile") || null,
  };
}

function persist(tokens: TokenPair) {
  localStorage.setItem("nf_access",  tokens.accessToken);
  localStorage.setItem("nf_refresh", tokens.refreshToken);
}

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(email, password);
      return data.data as TokenPair;
    } catch (e: unknown) {
      return rejectWithValue((e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Login failed");
    }
  }
);

export const selectProfileThunk = createAsyncThunk(
  "auth/selectProfile",
  async (profileId: string, { rejectWithValue }) => {
    try {
      const { data } = await authApi.selectProfile(profileId);
      return { tokens: data.data as TokenPair, profileId };
    } catch (e: unknown) {
      return rejectWithValue("Profile selection failed");
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try { await authApi.logout(); } catch { /* ignore */ }
});

const authSlice = createSlice({
  name: "auth",
  initialState: { ...load(), status: "idle" as const, error: null } as AuthState,
  reducers: {
    setTokens(state, action: PayloadAction<TokenPair>) {
      state.accessToken  = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      persist(action.payload);
    },
    clearAuth(state) {
      state.accessToken = state.refreshToken = state.profileId = null;
      localStorage.removeItem("nf_access");
      localStorage.removeItem("nf_refresh");
      localStorage.removeItem("nf_profile");
    },
  },
  extraReducers: (b) => {
    b.addCase(loginThunk.pending,   (s) => { s.status = "loading"; s.error = null; });
    b.addCase(loginThunk.fulfilled, (s, a) => {
      s.status = "idle";
      s.accessToken  = a.payload.accessToken;
      s.refreshToken = a.payload.refreshToken;
      persist(a.payload);
    });
    b.addCase(loginThunk.rejected, (s, a) => { s.status = "error"; s.error = a.payload as string; });

    b.addCase(selectProfileThunk.fulfilled, (s, a) => {
      s.profileId    = a.payload.profileId;
      s.accessToken  = a.payload.tokens.accessToken;
      s.refreshToken = a.payload.tokens.refreshToken;
      localStorage.setItem("nf_profile", a.payload.profileId);
      persist(a.payload.tokens);
    });

    b.addCase(logoutThunk.fulfilled, (s) => {
      s.accessToken = s.refreshToken = s.profileId = null;
      localStorage.clear();
    });
  },
});

export const { setTokens, clearAuth } = authSlice.actions;
export default authSlice.reducer;
