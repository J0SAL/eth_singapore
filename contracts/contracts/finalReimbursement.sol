// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    // Struct to hold reimbursement data, including verification statuses
    struct Reimbursement {
        address tpaPublicIp;
        address insurancePublicIp;
        address hospitalPublicIp;
        address userIp;
        string reimbursementId;
        bool tpaPublicIpVerified;
        bool insurancePublicIpVerified;
        bool hospitalPublicVerified;
    }

    struct DocumentSchema {
        string reimbursementId;
        string documentHash;
        string claim;
        uint256 amount;
        address attestedBy;
        bool isAttested;
    }

    struct User {
        address userAddress;
        string userEmail;
        string userName;
    }

    mapping(address => User) public userToUserdata;

    // Mapping for public address to world_coin_id and vice versa
    mapping(address => string) public publicAddressToWorldCoinId;
    mapping(string => address) public worldCoinIdToPublicAddress;

    // Mapping for reimbursement ID to reimbursement data
    mapping(string => Reimbursement) public reimbursements;

    //this address is the wallet address of the customer who has uploaded the bills
    mapping(address => DocumentSchema[]) public documents;

    uint256 public reimbursementCounter;
    string[] public reimbursementids;

    // Event for logging when a new reimbursement request is created
    event NewReimbursementRequest(
        string reimbursementId,
        address tpaPublicIp,
        address insurancePublicIp,
        address hospitalPublicIp
    );

    // Event for logging when a verification status changes
    event ReimbursementVerified(
        string reimbursementId,
        address verifiedBy,
        string role,
        bool isVerified
    );

    event DocumentSubmitted(
        address indexed customer,
        string documentHash,
        string claim,
        uint256 amount
    );
    event DocumentAttested(
        address indexed attester,
        string documentHash,
        bool isAttested
    );

    // Function to check if world_coin_id already exists
    function worldCoinIdNotExist(
        string memory _worldCoinId
    ) public view returns (bool) {
        return worldCoinIdToPublicAddress[_worldCoinId] == address(0);
    }

    // Function to link public address with world_coin_id
    function linkWorldCoinId(string memory _worldCoinId) public returns (bool) {
        if (!worldCoinIdNotExist(_worldCoinId)) {
            return false; // WorldCoinID already exists
        }
        publicAddressToWorldCoinId[msg.sender] = _worldCoinId;
        worldCoinIdToPublicAddress[_worldCoinId] = msg.sender;
        return true;
    }

    // Function save user data
    function saveUser(string memory emailId, string memory name) public {
        userToUserdata[msg.sender] = User({
            userAddress: msg.sender,
            userEmail: emailId,
            userName: name
        });
    }

    function getUser() public view returns (User memory) {
        return userToUserdata[msg.sender];
    }

    // Function to create a new reimbursement request
    function createReimbursementRequest(
        address _tpaPublicAddress,
        address _insurancePublicAddress,
        address _hospitalPublicAddress,
        string memory _newReimbursementId
    ) public returns (bool) {
        // Store the reimbursement details
        reimbursements[_newReimbursementId] = Reimbursement({
            tpaPublicIp: _tpaPublicAddress,
            insurancePublicIp: _insurancePublicAddress,
            hospitalPublicIp: _hospitalPublicAddress,
            userIp: msg.sender,
            reimbursementId: _newReimbursementId,
            tpaPublicIpVerified: false,
            insurancePublicIpVerified: false,
            hospitalPublicVerified: false
        });

        reimbursementCounter++;
        reimbursementids.push(_newReimbursementId);

        // Emit an event for the new reimbursement request
        emit NewReimbursementRequest(
            _newReimbursementId,
            _tpaPublicAddress,
            _insurancePublicAddress,
            _hospitalPublicAddress
        );

        return true; // Request created successfully
    }

    // Function to verify TPA public IP
    function verifyTpaPublicIp(
        string memory _reimbursementId,
        bool _status
    ) public returns (bool) {
        Reimbursement storage reimbursement = reimbursements[_reimbursementId];
        reimbursement.tpaPublicIpVerified = _status;

        // Emit an event for TPA verification
        emit ReimbursementVerified(
            _reimbursementId,
            reimbursement.tpaPublicIp,
            "TPA",
            _status
        );
        return true;
    }

    // Function to verify insurance public IP
    function verifyInsurancePublicIp(
        string memory _reimbursementId,
        bool _status
    ) public returns (bool) {
        Reimbursement storage reimbursement = reimbursements[_reimbursementId];
        reimbursement.insurancePublicIpVerified = _status;

        // Emit an event for Insurance verification
        emit ReimbursementVerified(
            _reimbursementId,
            reimbursement.insurancePublicIp,
            "Insurance",
            _status
        );
        return true;
    }

    // Function to verify hospital public IP
    function verifyHospitalPublicIp(
        string memory _reimbursementId,
        bool _status
    ) public returns (bool) {
        Reimbursement storage reimbursement = reimbursements[_reimbursementId];
        reimbursement.hospitalPublicVerified = _status;

        // Emit an event for Hospital verification
        emit ReimbursementVerified(
            _reimbursementId,
            reimbursement.hospitalPublicIp,
            "Hospital",
            _status
        );
        return true;
    }

    // Function to check if all verifications are complete
    function isFullyVerified(
        string memory _reimbursementId
    ) public view returns (bool) {
        Reimbursement storage reimbursement = reimbursements[_reimbursementId];
        return
            reimbursement.tpaPublicIpVerified &&
            reimbursement.insurancePublicIpVerified &&
            reimbursement.hospitalPublicVerified;
    }

    // Get reimbursements associated with reimbursement id
    function getReimbursementsbyId(
        string memory _reimbursementId
    ) public view returns (Reimbursement[] memory) {
        // Temporarily store matching reimbursements
        Reimbursement[] memory tempReimbursements = new Reimbursement[](
            reimbursementCounter
        );
        uint256 count = 0;

        for (uint256 i = 0; i < reimbursementids.length; i++) {
            // Loop through the reimbursementIds array
            string memory currentId = reimbursementids[i];
            Reimbursement memory reimbursement = reimbursements[currentId];

            if (
                keccak256(abi.encodePacked(reimbursement.reimbursementId)) ==
                keccak256(abi.encodePacked(_reimbursementId))
            ) {
                tempReimbursements[count] = reimbursement;
                count++;
            }
        }

        // Resize the array to fit the count of matches
        Reimbursement[] memory result = new Reimbursement[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tempReimbursements[i];
        }
        return result;
    }

    // Get reimbursements associated with the hospital public IP
    function getHospitalReimbursements()
        public
        view
        returns (Reimbursement[] memory)
    {
        Reimbursement[] memory hospitalReimbursements = new Reimbursement[](
            reimbursementCounter
        );
        uint256 count = 0;

        for (uint256 i = 0; i < reimbursementCounter; i++) {
            Reimbursement storage reimbursement = reimbursements[
                reimbursementids[i]
            ];
            if (reimbursement.hospitalPublicIp == msg.sender) {
                hospitalReimbursements[count] = reimbursement;
                count++;
            }
        }

        Reimbursement[] memory result = new Reimbursement[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = hospitalReimbursements[i];
        }
        return result;
    }

    // Get reimbursements associated with the individuals public IP
    function getUserReimbursements()
        public
        view
        returns (Reimbursement[] memory)
    {
        Reimbursement[] memory userReimbursements = new Reimbursement[](
            reimbursementCounter
        );
        uint256 count = 0;

        for (uint256 i = 0; i < reimbursementCounter; i++) {
            Reimbursement storage reimbursement = reimbursements[
                reimbursementids[i]
            ];
            if (reimbursement.userIp == msg.sender) {
                userReimbursements[count] = reimbursement;
                count++;
            }
        }

        Reimbursement[] memory result = new Reimbursement[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userReimbursements[i];
        }
        return result;
    }

    // Get reimbursements associated with the TPA public IP
    function getTpaReimbursements()
        public
        view
        returns (Reimbursement[] memory)
    {
        Reimbursement[] memory tpaReimbursements = new Reimbursement[](
            reimbursementCounter
        );
        uint256 count = 0;

        for (uint256 i = 0; i < reimbursementCounter; i++) {
            Reimbursement storage reimbursement = reimbursements[
                reimbursementids[i]
            ];
            if (reimbursement.tpaPublicIp == msg.sender) {
                tpaReimbursements[count] = reimbursement;
                count++;
            }
        }

        Reimbursement[] memory result = new Reimbursement[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tpaReimbursements[i];
        }
        return result;
    }

    // Get reimbursements associated with the insurance public IP
    function getInsuranceReimbursements()
        public
        view
        returns (Reimbursement[] memory)
    {
        Reimbursement[] memory insuranceReimbursements = new Reimbursement[](
            reimbursementCounter
        );
        uint256 count = 0;

        for (uint256 i = 0; i < reimbursementCounter; i++) {
            Reimbursement storage reimbursement = reimbursements[
                reimbursementids[i]
            ];
            if (reimbursement.insurancePublicIp == msg.sender) {
                insuranceReimbursements[count] = reimbursement;
                count++;
            }
        }

        Reimbursement[] memory result = new Reimbursement[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = insuranceReimbursements[i];
        }
        return result;
    }

    // Function get TPAs 11, 12
    function getTPAs() public pure returns (string[2] memory) {
        string[2] memory temp;
        temp[0] = "0x71bE63f3384f5fb98995898A86B02Fb2426c5788";
        temp[1] = "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a";

        return temp;
    }

    // Function get Hospitals 13, 14
    function getHospitals() public pure returns (string[2] memory) {
        string[2] memory temp;
        temp[0] = "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec";
        temp[1] = "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097";

        return temp;
    }

    // Function get Insurances 15,16
    function getInsuranceAgencies() public pure returns (string[2] memory) {
        string[2] memory temp;
        temp[0] = "0xcd3B766CCDd6AE721141F452C550Ca635964ce71";
        temp[1] = "0x2546BcD3c84621e976D8185a91A922aE77ECEc30";

        return temp;
    }

    function submitDocument(
        string memory _documentHash,
        string memory _claim,
        uint256 _amount,
        string memory _reimbursementId
    ) public {
        DocumentSchema memory newDoc = DocumentSchema({
            reimbursementId: _reimbursementId,
            documentHash: _documentHash,
            claim: _claim,
            amount: _amount,
            attestedBy: address(0),
            isAttested: false
        });

        documents[msg.sender].push(newDoc);
        emit DocumentSubmitted(msg.sender, _documentHash, _claim, _amount);
    }

    function attestDocument(
        address customer_address,
        string memory _documentHash,
        string memory _reimbursementId
    ) public {
        // Assuming attestation by a specific wallet (third-party)
        Reimbursement storage reimbursement = reimbursements[_reimbursementId];
        address attester_address = reimbursement.tpaPublicIp;
        for (uint256 i = 0; i < documents[customer_address].length; i++) {
            if (
                keccak256(
                    abi.encodePacked(
                        documents[customer_address][i].documentHash
                    )
                ) == keccak256(abi.encodePacked(_documentHash))
            ) {
                documents[customer_address][i].isAttested = true;
                documents[customer_address][i].attestedBy = attester_address;
                emit DocumentAttested(attester_address, _documentHash, true);
                break;
            }
        }
    }
}
