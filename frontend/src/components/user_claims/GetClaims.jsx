import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const GetClaims = () => {
  const [reimbursements, setRemibursements] = useState([]);
  const [reimbDocs, setReimbDocs] = useState([]);
  const { getUserReimbursements, getDocumentsByReimbursementId } = useAuth();

  useEffect(() => {
    const fetchReimbursements = async () => {
      try {
        const reimbs = await getUserReimbursements();
        setRemibursements(reimbs); // corrected setter function
        let reimbsDocsTemp = [];
        if (reimbs.length > 0) {
          for (let i = 0; i < reimbs.length; i++) {
            console.log("check reimb id - ", reimbs[i].reimbursementId);
            let suppDoc = await getDocumentsByReimbursementId(
              reimbs[i].reimbursementId
            );
            console.log(suppDoc);
            reimbsDocsTemp.push(suppDoc);
          }
          setReimbDocs(reimbsDocsTemp);
        }
        console.log(reimbs);
        console.log(reimbDocs);
      } catch (error) {
        console.error("Failed to fetch reimbursements", error);
      }
    };
    fetchReimbursements();
  }, []);
  return <div>GetClaims</div>;
};

export default GetClaims;
