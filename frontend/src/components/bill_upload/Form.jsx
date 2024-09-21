import React from "react";
import { SignProtocolClient, SpMode } from "@ethsign/sp-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { contractAddressesSign } from "../../contract_ref";
import { useAuth } from "../../context/AuthContext";
import { v4 as uuidv4 } from "uuid";
// Initialize Sign Client

const Form = () => {
  const {
    createReimbursementRequestByUser,
    publicAddress,
    getHospitals,
    getInsuranceAgencies,
    getTPAs,
  } = useAuth();
  const client = new SignProtocolClient(SpMode.OnChain, {
    account: publicAddress[0],
  });

  // Define the attestation schema
  // const schema = {
  //   documentHash: ipfsHash,
  //   claim: "Reimbursement claim for document XYZ",
  //   amount: 100,
  // };

  // Attestation creation
  async function createAttestation() {
    const attestation = await client.createAttestation(schema, {
      signer: attesterWallet,
    });
    console.log("Attestation created:", attestation);
  }

  const handleAttest = async (documentHash) => {
    await contractAddressesSign.methods
      .attestDocument(customerAddress, documentHash)
      .send({ from: attesterWallet });
  };

  const getAttestations = async (documentHash) => {
    const attestation = await client.queryAttestation(documentHash);
    console.log("Attestation status:", attestation);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    //call the ipfs uploaf files function and get the hash
    const ipfsHash = "samplehashmansi";
    const reimbursementID = uuidv4();
    const claimData = "request regarding wifi reimbursement";
    const claimAmount = 200;

    const party1addresses = await getTPAs();

    console.log("party1addresses here : ", party1addresses);
    const party2addresses = await getHospitals();
    const finalpartyaddresses = await getInsuranceAgencies();
    //call the method to get the tpa address from the reimbursement id

    await createReimbursementRequestByUser(
      party1addresses[0],
      party2addresses[0],
      finalpartyaddresses[0],
      reimbursementID,
      ipfsHash,
      claimData,
      claimAmount
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="give something" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Form;
