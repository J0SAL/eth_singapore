import React from "react";
import { Button } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

function TestContract() {
  const {
    linkWorldCoinId,
    createReimbursementRequest,
    verifyInsurancePublicIp,
    verifyHospitalPublicIp,
    verifyTpaPublicIp,
    isFullyVerified,
  } = useAuth();
  return (
    <>
      <div>TestContract</div>
      <Button onClick={() => linkWorldCoinId("worldcoinid")}>
        linkWorldCoinId
      </Button>
      <Button
        onClick={() =>
          createReimbursementRequest(
            "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
            "0xcd3B766CCDd6AE721141F452C550Ca635964ce71",
            "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",
            "r01",
            "dochash",
            "claimData",
            100
          )
        }
      >
        createReimbursementRequest
      </Button>
      <Button onClick={() => verifyInsurancePublicIp("r01", true)}>
        verifyInsurancePublicIp
      </Button>
      <Button onClick={() => verifyHospitalPublicIp("r01", true)}>
        verifyHospitalPublicIp
      </Button>
      <Button onClick={() => verifyTpaPublicIp("r01", true)}>
        verifyTpaPublicIp
      </Button>
      <Button onClick={() => isFullyVerified("r01")}>isFullyVerified</Button>
    </>
  );
}

export default TestContract;
