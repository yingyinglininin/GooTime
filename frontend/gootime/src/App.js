import React from "react";
import { LoginPage, HomePage, SchedulePage, SharePage } from "./pages";
import { Route, Routes } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

function App() {
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/share/:link" element={<SharePage />} />
          <Route path="/preview/:link" element={<SharePage />} />
        </Routes>
      </LocalizationProvider>
    </>
  );
}

export default App;
