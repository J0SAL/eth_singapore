import { Route, Routes } from "react-router-dom";
import Home from "../components/home/Home";
import Profile from "../components/profile/Profile";
import TestContract from "../components/home/TestContract";
import Form from "../components/bill_upload/Form";
import InsuranceClaimForm from "../components/InsuranceClaimForm/InsuranceClaimFOrm";
import PolicyAttestor from "../components/PolicyAttestor/UploadForm";
import PolicyListPage from "../components/PolicyAttestor/PolicyList";
 // Add this line

function CustomRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/test" element={<TestContract />} />
      <Route path="/form" element={<Form />} />
      <Route path="/insurance-claim" element={<InsuranceClaimForm />} /> 
      <Route path="/policy-attestor" element={<PolicyAttestor />} />
      <Route path="/policy-list" element={<PolicyListPage />} />
    </Routes>
  );
}

export default CustomRoutes;
