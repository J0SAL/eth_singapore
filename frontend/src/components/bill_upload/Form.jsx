import React from "react";
import { SignProtocolClient, SpMode } from "@ethsign/sp-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { contractAddressesSign } from "../../contract_ref";
const privateKey = "0xabc";

// Initialize Sign Client
const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.sepolia,
  account: privateKeyToAccount(privateKey), // optional
});

// Define the attestation schema
const schema = {
  documentHash: ipfsHash,
  claim: "Reimbursement claim for document XYZ",
  amount: 100,
};

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

const handleSubmit = async () => {
  const ipfsHash = "samplehashmansi";
  //call the method to get the tpa address from the reimbursement id
  await contractAddressesSign.methods
    .submitDocument(ipfsHash, "Reimbursement claim for document XYZ", 100)
    .send({ from: customerWallet });
};

const Form = () => {
  return (
    <div>
      <input type="text" onClick={handleSubmit} />
    </div>
  );
};

export default Form;
