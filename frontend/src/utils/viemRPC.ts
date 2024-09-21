import {
  createWalletClient,
  createPublicClient,
  custom,
  formatEther,
  parseEther,
  Address,
} from "viem";
import { mainnet, polygonAmoy, sepolia, hardhat } from "viem/chains";
import type { IProvider } from "@web3auth/base";
import {
  signabi,
  contractAddressesSign,
  abi,
  contractAddresses,
  worldCoinAddress,
  worldCoinAbi,

} from "../contract_ref";

const getViewChain = (provider: IProvider) => {
  switch (provider.chainId) {
    case "1":
      return mainnet;
    case "0x13882":
      return polygonAmoy;
    case "0xaa36a7":
      return sepolia;
    case "0x7a69":
      return hardhat;
    default:
      return mainnet;
  }
};

const getChainId = async (provider: IProvider): Promise<any> => {
  try {
    const walletClient = createWalletClient({
      transport: custom(provider),
    });

    const address = await walletClient.getAddresses();

    const chainId = await walletClient.getChainId();
    return chainId.toString();
  } catch (error) {
    return error;
  }
};
const getAccounts = async (provider: IProvider): Promise<any> => {
  try {
    const walletClient = createWalletClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });

    const address = await walletClient.getAddresses();

    return address;
  } catch (error) {
    return error;
  }
};

const getBalance = async (provider: IProvider): Promise<string> => {
  try {
    const publicClient = createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });

    const walletClient = createWalletClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });

    const address = await walletClient.getAddresses();

    const balance = await publicClient.getBalance({ address: address[0] });
    console.log(balance);
    return formatEther(balance);
  } catch (error) {
    return error as string;
  }
};

const sendTransaction = async (provider: IProvider): Promise<any> => {
  try {
    const publicClient = createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });

    const walletClient = createWalletClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });

    // data for the transaction
    const destination = "0x40e1c367Eca34250cAF1bc8330E9EddfD403fC56";
    const amount = parseEther("0.0001");
    const address = await walletClient.getAddresses();

    // Submit transaction to the blockchain
    const hash = await walletClient.sendTransaction({
      account: address[0],
      to: destination,
      value: amount,
    });
    console.log(hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return JSON.stringify(
      receipt,
      (key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
    );
  } catch (error) {
    return error;
  }
};

const signMessage = async (provider: IProvider): Promise<any> => {
  try {
    const walletClient = createWalletClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });

    // data for signing
    const address = await walletClient.getAddresses();
    const originalMessage = "YOUR_MESSAGE";

    // Sign the message
    const hash = await walletClient.signMessage({
      account: address[0],
      message: originalMessage,
    });

    console.log(hash);

    return hash.toString();
  } catch (error) {
    return error;
  }
};

// ** Smart Contract Functions **
const getUnlockTime = async (provider: IProvider) => {
  try {
    const publicClient = createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });
    const chainId = await getChainId(provider);
    let unlockTime = await publicClient.readContract({
      abi: abi,
      // @ts-ignore
      address: `${contractAddresses[chainId]}`,
      functionName: "unlockTime",
    });

    return unlockTime;
  } catch (error) {
    console.log("Something went wrong");
    console.log(error);
    return "error";
  }
};

const withdrawMoney = async (provider: IProvider, publicAddress: string) => {
  try {
    const privateKey = await provider.request({
      method: "eth_private_key",
    });

    console.log("private key", privateKey);
  } catch (error) {
    console.log("error, probably you are using metamask/external wallet");
  }
  try {
    const publicClient = createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });

    const walletClient = createWalletClient({
      chain: getViewChain(provider),
      transport: custom(provider),
      // @ts-ignore
      account: `${publicAddress[0]}`,
    });
    console.log(publicAddress[0]);
    const chainId = await getChainId(provider);
    console.log(1);
    console.log(chainId);
    // @ts-ignore
    console.log(contractAddresses[chainId]);
    let hash = await walletClient.writeContract({
      abi: abi,
      // @ts-ignore
      address: `${contractAddresses[chainId]}`,
      functionName: "withdraw",
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return "success";
  } catch (error) {
    console.log("Something went wrong");
    console.log(error);
    return "error";
  }
};

const linkWorldCoinId = async (
  provider: IProvider,
  worldCoinId: string,
  publicAddress: string
) => {
  console.log("public address: ", publicAddress[0]);
  try {
    const publicClient = await createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });

    const walletClient = await createWalletClient({
      chain: getViewChain(provider),
      transport: custom(provider),
      // @ts-ignore
      account: `${publicAddress[0]}`,
    });

    const chainId = await getChainId(provider);
    // @ts-ignore
    console.log("contract address: ", contractAddressesSign[chainId]);

    let hash = await walletClient.writeContract({
      abi: signabi,
      // @ts-ignore
      address: `${contractAddressesSign[chainId]}`,
      functionName: "linkWorldCoinId",
      args: [worldCoinId],
    });
    console.log(hash);
    await publicClient.waitForTransactionReceipt({ hash });
  } catch (error) {
    console.log("error: linkWorldCoinId");
    console.log(error);
  }
};

const createReimbursementRequestByUser = async (
  provider: IProvider,
  party1address: string,
  party2address: string,
  finalpartyaddress: string,
  reimbursementID: string,
  ipfshash: string,
  claimData: string,
  claimAmount: number,
  publicAddress: string[]
) => {
  try {
    console.log("all public addresses - ", publicAddress);
    const publicClient = await createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });

    const walletClient = await createWalletClient({
      chain: getViewChain(provider),
      transport: custom(provider),
      // @ts-ignore
      account: `${publicAddress[0]}`,
    });
    console.log(publicAddress[0]);
    const chainId = await getChainId(provider);
    console.log(1);
    console.log(chainId);
    // @ts-ignore
    console.log(contractAddressesSign[chainId]);
    console.log("now values - ");
    console.log(
      party1address,
      party2address,
      finalpartyaddress,
      reimbursementID,
      ipfshash,
      claimData,
      claimAmount
    );
    let hash = await walletClient.writeContract({
      abi: signabi,
      // @ts-ignore
      address: `${contractAddressesSign[chainId]}`,
      functionName: "createReimbursementRequest",
      args: [
        party1address,
        party2address,
        finalpartyaddress,
        reimbursementID,
        ipfshash,
        claimData,
        claimAmount,
      ],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return "success";
  } catch (error) {
    console.log("Something went wrong");
    console.log(error);
    return "error";
  }
};

const getTPAs = async (provider: IProvider) => {
  try {
    const publicClient = createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });
    const chainId = await getChainId(provider);
    let party1addresses = await publicClient.readContract({
      abi: signabi,
      // @ts-ignore
      address: `${contractAddressesSign[chainId]}`,
      functionName: "getTPAs",
    });

    return party1addresses;
  } catch (error) {
    console.log("Something went wrong");
    console.log(error);
    return "error";
  }
};

const getHospitals = async (provider: IProvider) => {
  try {
    const publicClient = createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });
    const chainId = await getChainId(provider);
    let party2addresses = await publicClient.readContract({
      abi: signabi,
      // @ts-ignore
      address: `${contractAddressesSign[chainId]}`,
      functionName: "getHospitals",
    });

    return party2addresses;
  } catch (error) {
    console.log("Something went wrong");
    console.log(error);
    return "error";
  }
};

const getInsuranceAgencies = async (provider: IProvider) => {
  try {
    const publicClient = createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });
    const chainId = await getChainId(provider);
    let finalPartyAddresses = await publicClient.readContract({
      abi: signabi,
      // @ts-ignore
      address: `${contractAddressesSign[chainId]}`,
      functionName: "getInsuranceAgencies",
    });

    return finalPartyAddresses;
  } catch (error) {
    console.log("Something went wrong");
    console.log(error);
    return "error";
  }
};

const verifyInsurancePublicIp = async (
  provider: IProvider,
  rid: string,
  status: boolean,
  publicAddress: string[]
) => {
  console.log("public address: ", publicAddress[0]);
  try {
    const publicClient = await createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });

    const walletClient = await createWalletClient({
      chain: getViewChain(provider),
      transport: custom(provider),
      // @ts-ignore
      account: `${publicAddress[0]}`,
    });

    const chainId = await getChainId(provider);
    // @ts-ignore
    console.log("contract address: ", contractAddressesSign[chainId]);

    let hash = await walletClient.writeContract({
      abi: signabi,
      // @ts-ignore
      address: `${contractAddressesSign[chainId]}`,
      functionName: "verifyInsurancePublicIp",
      args: [rid, status],
    });
    console.log(hash);
    await publicClient.waitForTransactionReceipt({ hash });
  } catch (error) {
    console.log("error: verifyInsurancePublicIp");
    console.log(error);
  }
};

const verifyHospitalPublicIp = async (
  provider: IProvider,
  rid: string,
  status: boolean,
  publicAddress: string[]
) => {
  console.log("public address: ", publicAddress[0]);
  try {
    const publicClient = await createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });

    const walletClient = await createWalletClient({
      chain: getViewChain(provider),
      transport: custom(provider),
      // @ts-ignore
      account: `${publicAddress[0]}`,
    });

    const chainId = await getChainId(provider);
    // @ts-ignore
    console.log("contract address: ", contractAddressesSign[chainId]);

    let hash = await walletClient.writeContract({
      abi: signabi,
      // @ts-ignore
      address: `${contractAddressesSign[chainId]}`,
      functionName: "verifyHospitalPublicIp",
      args: [rid, status],
    });
    console.log(hash);
    await publicClient.waitForTransactionReceipt({ hash });
  } catch (error) {
    console.log("error: verifyHospitalPublicIp");
    console.log(error);
  }
};

const verifyTpaPublicIp = async (
  provider: IProvider,
  documentHash: string,
  rid: string,
  status: boolean,
  reason: string,
  publicAddress: string[]
) => {
  console.log("public address: ", publicAddress[0]);
  try {
    const publicClient = await createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });

    const walletClient = await createWalletClient({
      chain: getViewChain(provider),
      transport: custom(provider),
      // @ts-ignore
      account: `${publicAddress[0]}`,
    });

    const chainId = await getChainId(provider);
    // @ts-ignore
    console.log("contract address: ", contractAddressesSign[chainId]);

    let hash = await walletClient.writeContract({
      abi: signabi,
      // @ts-ignore
      address: `${contractAddressesSign[chainId]}`,
      functionName: "verifyTpaPublicIp",
      args: [documentHash, rid, status, reason],
    });
    console.log(hash);
    await publicClient.waitForTransactionReceipt({ hash });
  } catch (error) {
    console.log("error: verifyTpaPublicIp");
    console.log(error);
  }
};

const isFullyVerified = async (
  provider: IProvider,
  rid: string,
  publicAddress: string[]
) => {
  console.log("public address: ", publicAddress[0]);
  try {
    const publicClient = createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });
    const chainId = await getChainId(provider);
    let isVerified = await publicClient.readContract({
      abi: signabi,
      // @ts-ignore
      address: `${contractAddressesSign[chainId]}`,
      functionName: "isFullyVerified",
      args: [rid],
    });

    return isVerified;
  } catch (error) {
    console.log("error: isFullyVerified");
    console.log(error);
  }
};

const getTpaReimbursements = async (
  provider: IProvider,
  publicAddress: string[]
) => {
  try {
    const publicClient = createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
      // @ts-ignore
      account: `${publicAddress[0]}`,
    });
    const chainId = await getChainId(provider);
    let party1addresses = await publicClient.readContract({
      abi: signabi,
      // @ts-ignore
      address: `${contractAddressesSign[chainId]}`,
      functionName: "getTpaReimbursements",
    });

    return party1addresses;
  } catch (error) {
    console.log("Something went wrong");
    console.log(error);
    return "error";
  }
};

const getUserReimbursements = async (
  provider: IProvider,
  publicAddress: string[]
) => {
  try {
    const publicClient = createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
      // @ts-ignore
      account: `${publicAddress[0]}`,
    });
    const chainId = await getChainId(provider);
    let party1addresses = await publicClient.readContract({
      abi: signabi,
      // @ts-ignore
      address: `${contractAddressesSign[chainId]}`,
      functionName: "getUserReimbursements",
    });

    return party1addresses;
  } catch (error) {
    console.log("Something went wrong");
    console.log(error);
    return "error";
  }
};

const getDocumentsByReimbursementId = async (
  provider: IProvider,
  publicAddress: string[],
  reimbursementID: string
) => {
  try {
    const publicClient = createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
      // @ts-ignore
      account: `${publicAddress[0]}`,
    });
    const chainId = await getChainId(provider);
    let doccontent = await publicClient.readContract({
      abi: signabi,
      // @ts-ignore
      address: `${contractAddressesSign[chainId]}`,
      functionName: "getDocumentsByReimbursementId",
      args: [reimbursementID],
    });

    return doccontent;
  } catch (error) {
    console.log("Something went wrong");
    console.log(error);
    return "error";
  }
};

const attestClaim = async (
  provider: IProvider,
  documentHash: string,
  reimbursementID: string,
  approved: boolean,
  reason: string,
  publicAddress: string[]
) => {
  try {
    const publicClient = await createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });

    const walletClient = await createWalletClient({
      chain: getViewChain(provider),
      transport: custom(provider),
      // @ts-ignore
      account: `${publicAddress[0]}`,
    });
    console.log(publicAddress[0]);
    const chainId = await getChainId(provider);
    console.log(1);
    console.log(chainId);
    // @ts-ignore
    console.log(contractAddressesSign[chainId]);

    let hash = await walletClient.writeContract({
      abi: signabi,
      // @ts-ignore
      address: `${contractAddressesSign[chainId]}`,
      functionName: "attestDocument",
      args: [documentHash, reimbursementID, approved, reason],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return "success";
  } catch (error) {
    console.log("Something went wrong");
    console.log(error);
    return "error";
  }
};

const verifyAndExecuteWorldCoin = async (provider: IProvider, signal: string, root: string, nullifierHash: string, proof: any[], publicAddress: string[]) => {
  console.log("public Address: ", publicAddress[0])
  try {
    const publicClient = await createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });

    const walletClient = await createWalletClient({
      chain: getViewChain(provider),
      transport: custom(provider),
      // @ts-ignore
      account: `${publicAddress[0]}`,
    });
    console.log(publicAddress[0]);
    const chainId = await getChainId(provider);
    console.log(chainId);
    // @ts-ignore
    console.log(contractAddressesSign[chainId]);
  
    let hash = await walletClient.writeContract({
      abi: worldCoinAbi,
      // @ts-ignore
      address: `${worldCoinAddress[chainId]}`,
      functionName: "verifyAndExecute",
      args: [
        signal,
        root, 
        nullifierHash, 
        proof
      ],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return "success";
  } catch (error) {
    console.log("Something went wrong");
    console.log(error);
    return "error";
  }
};

const findWorldId = async (provider: IProvider, publicAddress: string[]) => {
  console.log("public address in findWorldId: ", publicAddress[0]);
  try {
    const publicClient = await createPublicClient({
      chain: getViewChain(provider),
      transport: custom(provider),
    });

    const chainId = await getChainId(provider);
    
    let isVerified = await publicClient.readContract({
      abi: signabi,
      // @ts-ignore
      address: `${contractAddressesSign[chainId]}`,
      functionName: "publicAddressToWorldCoinId",
      args:[publicAddress[0]],
       // @ts-ignore
       account: `${publicAddress[0]}`,
    });

    return isVerified;
  } catch (error) {
    console.log("error: findWorldId");
    console.log(error);
  }
}

export default {
  getChainId,
  getAccounts,
  getBalance,
  sendTransaction,
  signMessage,
  getUnlockTime,
  withdrawMoney,
  createReimbursementRequestByUser,
  getTPAs,
  getHospitals,
  getInsuranceAgencies,
  linkWorldCoinId,
  getTpaReimbursements,
  getUserReimbursements,
  getDocumentsByReimbursementId,
  attestClaim,
  verifyInsurancePublicIp,
  verifyHospitalPublicIp,
  verifyTpaPublicIp,
  isFullyVerified,
  verifyAndExecuteWorldCoin,
  findWorldId,
};
