import { Route, Routes } from "react-router-dom";
import Home from "../components/home/Home";
import Profile from "../components/profile/Profile";
import TestContract from "../components/home/TestContract";

function CustomRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/test" element={<TestContract />} />
    </Routes>
  );
}

export default CustomRoutes;
