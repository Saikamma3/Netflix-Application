import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { ProtectedRoute, AuthRequired } from "./components/ProtectedRoute";
import { Login }         from "./pages/Login";
import { Register }      from "./pages/Register";
import { ProfileSelect } from "./pages/ProfileSelect";
import { Browse }        from "./pages/Browse";
import { Search }        from "./pages/Search";
import { Watch }         from "./pages/Watch";
import { MyList }        from "./pages/MyList";

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Auth required, no profile needed */}
          <Route element={<AuthRequired />}>
            <Route path="/profiles" element={<ProfileSelect />} />
          </Route>

          {/* Auth + profile required */}
          <Route element={<ProtectedRoute />}>
            <Route path="/browse"    element={<Browse />} />
            <Route path="/search"    element={<Search />} />
            <Route path="/my-list"   element={<MyList />} />
            <Route path="/watch/:id" element={<Watch />} />
          </Route>

          <Route path="*" element={<Navigate to="/browse" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
