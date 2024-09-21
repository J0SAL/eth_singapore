import { Route, Routes } from "react-router-dom";
import Home from "../components/home/Home";
import Profile from "../components/profile/Profile";
import TestContract from "../components/home/TestContract";
import Form from "../components/bill_upload/Form";
import Attest from "../components/attest_bills/Attest";
import PolicyAttestor from "../components/PolicyAttestor/UploadForm";
import PolicyListPage from "../components/PolicyAttestor/PolicyList";
import InsuranceClaimForm from "../components/InsuranceClaimForm/InsuranceClaimForm";
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
      <Route path="/attest" element={<Attest />} />
    </Routes>
  );
}

export default CustomRoutes;
