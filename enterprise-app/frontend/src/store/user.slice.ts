import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "../api/user.api";
import { UserDto } from "../types";

interface UserState {
  profile: UserDto | null;
  status: "idle" | "loading" | "error";
  error:  string | null;
}

const initialState: UserState = { profile: null, status: "idle", error: null };

export const fetchMe = createAsyncThunk(
  "user/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await userApi.me();
      return data.data as UserDto;
    } catch {
      return rejectWithValue("Failed to fetch profile");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearProfile(state) {
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
        state.error  = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status  = "idle";
        state.profile = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = "error";
        state.error  = action.payload as string;
      });
  },
});

export const { clearProfile } = userSlice.actions;
export default userSlice.reducer;
