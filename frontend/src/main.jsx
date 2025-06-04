import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CheckAuth from "./components/check-auth";
import TicketsPage from "./pages/tickets";
import TicketPage from "./pages/ticket";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import AdminPage from "./pages/admin";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <CheckAuth protected={true}>
              <TicketsPage />
            </CheckAuth>
          }
        />
        <Route
          path="/ticket/:id"
          element={
            <CheckAuth protected={true}>
              <TicketPage />
            </CheckAuth>
          }
        />
        <Route
          path="/login"
          element={
            <CheckAuth protected={false}>
              <LoginPage />
            </CheckAuth>
          }
        />
        <Route
          path="/signup"
          element={
            <CheckAuth protected={false}>
              <SignupPage />
            </CheckAuth>
          }
        />
        <Route
          path="/signup"
          element={
            <CheckAuth protected={false}>
              <AdminPage />
            </CheckAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
