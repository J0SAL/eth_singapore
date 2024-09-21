
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit";
import { useAuth } from "../../context/AuthContext";
import { useCallback, useEffect } from "react";
import axios from "axios";

export function WorldCoinWidget() {
  const { setIsWorldIdVerified, linkWorldCoinId } = useAuth();
  const handleVerify = useCallback(async (proof) => {
    console.log("Proof -- ", proof);
    const res = await axios.post(" http://localhost:3000/verifyWorldCoin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      result: JSON.stringify(proof),
    });

    if (!res.data.success) {
      throw new Error("Verification failed.");
    } else {
      console.log("Verification Complete!")
      const world_id = proof?.nullifier_hash ?? "worldid";
      console.log("world_id: ", world_id);
      await linkWorldCoinId(world_id);
      setIsWorldIdVerified(true);
    }
  }, []);

  const handleSuccess = useCallback(() => {
    console.log("In success");
  }, []);

  return (
    <div>

      <IDKitWidget
        app_id={"app_staging_86f46e6e2736ccbaea9169f1827abe88"}
        action={"testing-action"}
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