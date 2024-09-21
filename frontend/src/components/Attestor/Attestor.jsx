import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Attestor.css";

export function Attestor() {
  const {
    getTpaReimbursements,
    getDocumentsByReimbursementId,
    loggedIn,
    attestClaim,
    publicAddress,
    verifyTpaPublicIp,
  } = useAuth();

  const [expandedIndex, setExpandedIndex] = useState(null);

  const [reimbursements, setReimbursements] = useState(undefined);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      console.log("In try");
      const response = await getTpaReimbursements(publicAddress);
      console.log("reimbursement response - ", response);
      if (!response) {
        throw new Error("Reimbursement Response was not ok");
      }
      if (response && response.length > 0) {
        setReimbursements(response);
        setLoading(false);
      }
    } catch (error) {
      console.log("Error -", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn && publicAddress.length > 0) {
      console.log("In useEffect");
      fetchData();
    }
  }, [loggedIn, publicAddress]);

  // useEffect(() => {
  //   if (reimbursements && reimbursements.length > 0 && publicAddress.length>0) {
  //     console.log("In iff useEffect");
  //     setReimbursements(async (current) => {
  //       let suppDoc = await getDocumentsByReimbursementId(
  //         current.reimbursementId
  //       );

  //       return { ...current, suppDoc };
  //     });
  //   }
  // }, [reimbursements, getDocumentsByReimbursementId, publicAddress]);

  console.log("Reimbur--", reimbursements);

  const toggleExpand = async (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  function renderReimbursementDetails(item) {
    return <>{JSON.stringify(item)}</>;
  }

  function renderReimbursementList() {
    if (reimbursements && reimbursements.length > 0) {
      return (
        <>
          {reimbursements.map((item, index) => (
            <div key={index} className="list-item">
              <div className="list-item-header">
                <h3>{item.reimbursementId}</h3>
                <button onClick={() => toggleExpand(index)}>
                  {expandedIndex === index ? "Collapse" : "Expand"}
                </button>
              </div>
              {expandedIndex === index && (
                <div className="list-item-content">
                  {renderReimbursementDetails(item)}
                </div>
              )}
            </div>
          ))}
        </>
      );
    }
    return <></>;
  }

  return (
    <div className="container">
      <div className="expandable-list">{renderReimbursementList()}</div>
    </div>
  );
}
