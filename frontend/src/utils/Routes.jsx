import { Route, Routes } from "react-router-dom";
import Home from "../components/home/Home";
import Profile from "../components/profile/Profile";
import Form from "../components/bill_upload/Form";

function CustomRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/form" element={<Form />} />
    </Routes>
  );
}

export default CustomRoutes;
