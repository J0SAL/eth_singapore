/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */

import {
  CHAIN_NAMESPACES,
  WEB3AUTH_NETWORK,
  WALLET_ADAPTERS,
} from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth } from "@web3auth/modal";
import { useEffect, useState, useContext, createContext, useLayoutEffect } from "react";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import RPC from "../utils/viemRPC";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const clientId = import.meta.env.VITE_SOME_KEY;

// const chainConfig = {
//   chainNamespace: CHAIN_NAMESPACES.EIP155,
//   chainId: "0xaa36a7",
//   rpcTarget: "https://rpc.ankr.com/eth_sepolia",
//   displayName: "Ethereum Sepolia Testnet",
//   blockExplorerUrl: "https://sepolia.etherscan.io",
//   ticker: "ETH",
//   tickerName: "Ethereum",
//   logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
// };
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x7a69", // Hardhat local network chainId in hexadecimal
  rpcTarget: "http://localhost:8545", // Local Hardhat network RPC URL
  displayName: "Hardhat Local Network",
  blockExplorerUrl: "", // Local network does not have a block explorer
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "", // Local network typically does not have a logo
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider,
});

export function AuthProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isWorldIdVerified, setIsWorldIdVerified] = useState(false);
  const [tpaReimbursements, setTpaReimbursements] = useState([]);

  const [publicAddress, setWalletAddress] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [accountBalance, setAccountBalance] = useState(0);
  const navigate = useNavigate();


  useLayoutEffect(() => {
    if (isWorldIdVerified) {
      toast.success("World Id Verified!🙋‍♂️");
      navigate('/')
    }
  }, [isWorldIdVerified])

  useEffect(() => {
    const init = async () => {
      try {
        const metamaskAdapter = new MetamaskAdapter({
          clientId,
          sessionTime: 3600,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          chainConfig: { ...chainConfig },
        });
        await web3auth.configureAdapter(metamaskAdapter);
        await web3auth.initModal({
          modalConfig: {
            [WALLET_ADAPTERS.OPENLOGIN]: {
              label: "openlogin",
              loginMethods: {
                email_passwordless: {
                  name: "email_passwordless",
                  showOnModal: true,
                },
                google: {
                  name: "google",
                  showOnModal: true,
                },
              },
            },
          },
        });
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
          toast.success("Sup User!🙋‍♂️");
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (loggedIn) {
      getAccounts();
      getBalance();
      getUserInfo();
    }
  }, [loggedIn]);

  useEffect(() => {
    if (publicAddress?.length > 0) {
      findWorldId();
      getTpaReimbursements();
    }
  }, [publicAddress]);

  const login = async () => {
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    if (web3auth.connected) {
      setLoggedIn(true);
    }
  };

  const getUserInfo = async () => {
    const user = await web3auth.getUserInfo();
    console.log(user);
    setUserInfo(user);
  };

  const logout = async () => {
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    console.log("logged out");
    navigate("/");
  };

  const getAccounts = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return "";
    }
    const address = await RPC.getAccounts(provider);
    console.log(address);
    setWalletAddress(address);
  };

  const getBalance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const balance = await RPC.getBalance(provider);
    console.log(balance);
    setAccountBalance(balance);
  };

  // Smart Contract Functions
  const getUnlockTime = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const unlockTime = await RPC.getUnlockTime(provider);
    console.log(unlockTime);
  };

  const withdrawMoney = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const result = await RPC.withdrawMoney(provider, publicAddress);
    console.log(result);
  };

  const getTPAs = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const party1addresses = await RPC.getTPAs(provider);
    return party1addresses;
  };

  const getHospitals = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const party2addresses = await RPC.getHospitals(provider);
    return party2addresses;
  };

  const getInsuranceAgencies = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const finalpartyaddresses = await RPC.getInsuranceAgencies(provider);
    return finalpartyaddresses;
  };

  const getTpaReimbursements = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    console.log("In tpa - ", publicAddress);
    const reimbursements = await RPC.getTpaReimbursements(
      provider,
      publicAddress
    );
    return reimbursements;
  };

  const getHospitalReimbursements = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    console.log("In tpa - ", publicAddress);
    const reimbursements = await RPC.getHospitalReimbursements(
      provider,
      publicAddress
    );
    return reimbursements;
  };
  // getInsuranceReimbursements

  const getInsuranceReimbursements = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    console.log("In tpa - ", publicAddress);
    const reimbursements = await RPC.getInsuranceReimbursements(
      provider,
      publicAddress
    );
    return reimbursements;
  };

  const getUserReimbursements = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const reimbursements = await RPC.getUserReimbursements(
      provider,
      publicAddress
    );
    return reimbursements;
  };

  const getDocumentsByReimbursementId = async (reimbursementID) => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const reimbDocs = await RPC.getDocumentsByReimbursementId(
      provider,
      publicAddress,
      reimbursementID
    );
    return reimbDocs;
  };

  const linkWorldCoinId = async (worldCoinId) => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    console.log("PUBLIC : ", publicAddress)
    await RPC.linkWorldCoinId(provider, worldCoinId, publicAddress);
  };

  const createReimbursementRequest = async (
    tpaPublic,
    insurancePublic,
    hospitalPublic,
    rid,
    docHash,
    claimData,
    claimAmount
  ) => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    return await RPC.createReimbursementRequestByUser(
      provider,
      tpaPublic,
      insurancePublic,
      hospitalPublic,
      rid,
      docHash,
      claimData,
      claimAmount,
      publicAddress
    );
  };

  const attestClaim = async (
    documentHash,
    reimbursementID,
    approved,
    reason
  ) => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    return await RPC.attestClaim(
      provider,
      documentHash,
      reimbursementID,
      approved,
      reason,
      publicAddress
    );
  };

  const verifyInsurancePublicIp = async (rid, status) => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    await RPC.verifyInsurancePublicIp(provider, rid, status, publicAddress);
  };
  const verifyHospitalPublicIp = async (rid, status) => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    await RPC.verifyHospitalPublicIp(provider, rid, status, publicAddress);
  };
  const verifyTpaPublicIp = async (documentHash, rid, status, reason) => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    await RPC.verifyTpaPublicIp(provider, documentHash, rid, status, reason, publicAddress);
  };

  const isFullyVerified = async (rid) => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const res = await RPC.isFullyVerified(provider, rid, publicAddress);
    console.log(res);
  }

  const verifyAndExecuteWorldCoin = async (signal, root, nullifierHash, proof) => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const res = await RPC.verifyAndExecuteWorldCoin(provider, signal, root, nullifierHash, proof, publicAddress);
    console.log(res);
  }

  const findWorldId = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const worldid = await RPC.findWorldId(provider, publicAddress);
    console.log("world id ", worldid);
    if (worldid?.length > 0)
      setIsWorldIdVerified(true);
  };

  return (
    <AuthContext.Provider
      value={{
        isWorldIdVerified,
        loggedIn,
        login,
        publicAddress,
        userInfo,
        accountBalance,
        tpaReimbursements,
        getUserInfo,
        logout,
        getAccounts,
        getBalance,
        // -
        getUnlockTime,
        findWorldId,
        withdrawMoney,
        createReimbursementRequest,
        getTPAs,
        getHospitals,
        getInsuranceAgencies,
        linkWorldCoinId,
        verifyInsurancePublicIp,
        verifyHospitalPublicIp,
        verifyTpaPublicIp,
        isFullyVerified,
        verifyAndExecuteWorldCoin,
        getTpaReimbursements,
        getHospitalReimbursements,
        getInsuranceReimbursements,
        getDocumentsByReimbursementId,
        attestClaim,
        getUserReimbursements,
        setIsWorldIdVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
