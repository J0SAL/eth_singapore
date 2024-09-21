import React, { useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "react-bootstrap";
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit";
// import axios from "axios";
import { decodeAbiParameters } from 'viem'


function Home() {
    const { getUnlockTime, withdrawMoney, publicAddress } = useAuth();
    console.log("Public address - ", publicAddress);
    //   const worldCoinAppId = env.WORLDCOIN_APP_ID;

    //   console.log("World coin - ", worldCoinAppId);

    const handleVerify = useCallback(async (proof) => {

        const unpackedProof = decodeAbiParameters([{ type: 'uint256[8]' }], proof.proof)[0]

        console.log("Proof -- ", proof);
        console.log("Unpacked - ", unpackedProof);


        // const res = await axios.post(" http://localhost:3000/verifyWorldCoin", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     result: JSON.stringify(proof),
        // });
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
            <Button onClick={getUnlockTime}>GetTime</Button>
            <Button onClick={withdrawMoney}>WithDraw</Button>
            <div>Home</div>

            <br />
            <br />

            <IDKitWidget
                // app_id={"app_staging_86f46e6e2736ccbaea9169f1827abe88"}
                app_id={"app_staging_270a047626e761cf2daa8adcff24eef5"}
                // action={"testing-action"}
                action={"onchain-action"}
                signal={publicAddress[0]}
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

export default Home;
