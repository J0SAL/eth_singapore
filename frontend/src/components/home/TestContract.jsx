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
    verifyAndExecuteWorldCoin,
  } = useAuth();
  return (
    <div>
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
      {/* <Button onClick={() => verifyTpaPublicIp("r01", true)}>
        verifyTpaPublicIp
      </Button> */}
      <Button onClick={() => isFullyVerified("r01")}>isFullyVerified</Button>

      <Button onClick={() => verifyAndExecuteWorldCoin("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x0af7616a4d8add981043bc70f03ad2efe1763bfd5436703715aaceb2ba4e628b", "0x272034dff953d6f4bce9d4162edd34aaa6ad910274941c0e32b3cfaa4572efbb", [8840182334656385515916820032249832999127333505596303772089219299191069825624n, 6897360388837491741451370492699476106046802448410749805357102429379365826510n, 20049906784355877080451589420649295643652870691842325703243639169395771188544n, 19410465728291021830300834849848716657373148381996837929826515713766595099182n, 4246151665789669144172556730238070853870051299103193653520593830449587499209n, 15811239481122278983553482888955600494841517259396260600570216686351164278989n, 4273846502750649036220785225593408930054381847829202547392484901803979740301n, 15395977717004253251680609956764249686842108558706993161864708911857857573804n])}>verifyAndExecuteWorldCoin</Button>
      <br />
      <br />
      <br />
    </div>
  );
}

export default TestContract;
