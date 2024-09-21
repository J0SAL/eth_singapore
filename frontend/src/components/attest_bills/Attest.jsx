import React, { useEffect, useState } from "react";
import { SignProtocolClient, SpMode } from "@ethsign/sp-sdk";
import { contractAddressesSign } from "../../contract_ref";
import { useAuth } from "../../context/AuthContext";

const Attest = () => {
  const { getTpaReimbursements, getDocumentsByReimbursementId, attestClaim } =
    useAuth();
  const [reimbursements, setRemibursements] = useState([]);
  const [reimbDocs, setReimbDocs] = useState([]);
  const [reason, setReason] = useState("");
  const [showReasonField, setShowReasonField] = useState(false);

  useEffect(() => {
    const fetchReimbursements = async () => {
      try {
        const reimbs = await getTpaReimbursements();
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

  const handleApprove = async (documentHash, reimbursementID) => {
    console.log("User clicked Approve - ", documentHash, reimbursementID);
    await attestClaim(documentHash, reimbursementID, true, "");
  };

  // Function to handle "Disapprove" button click
  const handleDisapprove = async (documentHash, reimbursementID) => {
    if (!reason) {
      alert("Please provide a reason for disapproving!");
      return;
    }
    await attestClaim(documentHash, reimbursementID, false, reason);
    console.log(
      "User clicked Disapprove with reason:",
      reason,
      documentHash,
      reimbursementID
    );
  };

  return (
    <div>
      Attester Screen
      {reimbursements &&
        reimbDocs &&
        reimbursements.length != 0 &&
        reimbDocs.length != 0 &&
        reimbursements.map((item, val) => {
          return (
            <p key={val}>
              <h3>Select an Option</h3>
              <button
                onClick={() => {
                  handleApprove(
                    reimbDocs[val][0].documentHash,
                    item.reimbursementId
                  );
                }}
              >
                Approve
              </button>
              <button
                onClick={() => {
                  handleDisapprove(
                    reimbDocs[val][0].documentHash,
                    item.reimbursementId
                  ); // Show reason field when disapprove is clicked
                }}
              >
                Disapprove
              </button>

              <div>
                <input
                  type="text"
                  placeholder="Enter reason for disapproval"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)} // Update reason state on change
                />
              </div>
            </p>
          );
        })}
    </div>
  );
};

export default Attest;
