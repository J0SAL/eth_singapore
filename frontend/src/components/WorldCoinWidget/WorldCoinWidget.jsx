
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit";
import { useAuth } from "../../context/AuthContext";
import { useCallback } from "react";
import { decodeAbiParameters } from "viem";
import axios from "axios";

export function WorldCoinWidget(){
    const {publicAddress} = useAuth();
    console.log("In worldCoin - ");

    const handleVerify = useCallback(async (proof) => {
    
        // const unpackedProof = decodeAbiParameters([{ type: 'uint256[8]' }], proof.proof)[0]
    
        console.log("Proof -- ", proof);
        // console.log("Unpacked - ", unpackedProof);
        
    
        const res = await axios.post(" http://localhost:3000/verifyWorldCoin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          result: JSON.stringify(proof),
        });

        console.log("Response - ", res);

        if (!res.data.success) {
          throw new Error("Verification failed.");
        }
      }, []);
    
      const handleSuccess = useCallback(() => {
        console.log("In success");
      }, []);
    
      return (
        <div>
          
          <IDKitWidget
            app_id={"app_staging_86f46e6e2736ccbaea9169f1827abe88"}
            // app_id={"app_staging_270a047626e761cf2daa8adcff24eef5"}
            action={"testing-action"}
            // action={"onchain-action"}
            // signal={publicAddress[0]}
            onSuccess={handleSuccess} // callback when the modal is closed
            handleVerify={handleVerify} // callback when the proof is received
            verification_level={VerificationLevel.Orb}
          >
            {({ open }) => (
              // This is the button that will open the IDKit modal
              <button onClick={open}>Verify with World ID</button>
            )}
          </IDKitWidget>
        </div>
      );
}