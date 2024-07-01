use starknet::{ContractAddress, EthAddress};

#[starknet::interface]
trait ICommitmentsInbox<TContractState> {
    // @notice Returns the address of the HeadersStore contract
    // @return The address of the headers store contract
    fn get_headers_store(self: @TContractState) -> ContractAddress;

    // @notice Returns the address of the L1 message sender
    // @return The address of the L1 message sender
    fn get_l1_message_sender(self: @TContractState) -> EthAddress;

    // @notice Returns the address of the owner
    // @return The address of the owner
    fn get_owner(self: @TContractState) -> ContractAddress;

    // @notice Sets the address of the HeadersStore contract
    // @dev This function is only callable by the owner
    // @param headers_store The address of the headers store contract
    fn set_headers_store(ref self: TContractState, headers_store: ContractAddress);

    // @notice Sets the address of the L1 message sender
    // @dev This function is only callable by the owner
    // @param l1_message_sender The address of the L1 message sender
    fn set_l1_message_sender(ref self: TContractState, l1_message_sender: EthAddress);

    // @notice Transfers ownership of the contract to a new address
    // @dev This function is only callable by the owner
    // @param new_owner The address of the new owner
    fn transfer_ownership(ref self: TContractState, new_owner: ContractAddress);

    // @notice Renounces ownership of the contract, once renounced it cannot be reversed
    // @dev This function is only callable by the owner
    fn renounce_ownership(ref self: TContractState);

    // @notice receives a parent blockhash and the corresponding block number, simulating L1 messaging, and sends it to the HeadersStore
    // @dev This function is only callable by the owner, ownership will be renounced in mainnet
    fn receive_commitment_owner(ref self: TContractState, parent_hash: u256, block_number: u256);
}

// @notice The contract that receives the commitments from L1, both individual blocks and proven MMRs, sending them to the HeadersStore
// @dev The contract ownership will be renounced in mainnet, it is only used for testing purposes
#[starknet::contract]
mod CommitmentsInbox {
    use starknet::{ContractAddress, get_caller_address, EthAddress};
    use herodotus_eth_starknet::core::headers_store::{
        IHeadersStoreDispatcherTrait, IHeadersStoreDispatcher
    };

    #[storage]
    struct Storage {
        headers_store: ContractAddress,
        l1_message_sender: EthAddress,
        owner: ContractAddress
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        OwnershipTransferred: OwnershipTransferred,
        OwnershipRenounced: OwnershipRenounced,
        CommitmentReceived: CommitmentReceived,
        MMRReceived: MMRReceived
    }

    #[derive(Drop, starknet::Event)]
    struct OwnershipTransferred {
        previous_owner: ContractAddress,
        new_owner: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct OwnershipRenounced {
        previous_owner: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct CommitmentReceived {
        parent_hash: u256,
        block_number: u256
    }

    #[derive(Drop, starknet::Event)]
    struct MMRReceived {
        root: felt252,
        last_pos: usize,
        aggregator_id: usize
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        headers_store: ContractAddress,
        l1_message_sender: EthAddress,
        owner: Option<ContractAddress>
    ) {
        self.headers_store.write(headers_store);
        self.l1_message_sender.write(l1_message_sender);

        match owner {
            Option::Some(o) => self.owner.write(o),
            Option::None(_) => self.owner.write(get_caller_address())
        };
    }

    #[external(v0)]
    impl CommitmentsInbox of super::ICommitmentsInbox<ContractState> {
        // @inheritdoc ICommitmentsInbox
        fn get_headers_store(self: @ContractState) -> ContractAddress {
            self.headers_store.read()
        }

        // @inheritdoc ICommitmentsInbox
        fn get_l1_message_sender(self: @ContractState) -> EthAddress {
            self.l1_message_sender.read()
        }

        // @inheritdoc ICommitmentsInbox
        fn get_owner(self: @ContractState) -> ContractAddress {
            self.owner.read()
        }

        // @inheritdoc ICommitmentsInbox
        fn set_headers_store(ref self: ContractState, headers_store: ContractAddress) {
            let caller = get_caller_address();
            assert(self.owner.read() == caller, 'Only owner');
            self.headers_store.write(headers_store);
        }

        // @inheritdoc ICommitmentsInbox
        fn set_l1_message_sender(ref self: ContractState, l1_message_sender: EthAddress) {
            let caller = get_caller_address();
            assert(self.owner.read() == caller, 'Only owner');
            self.l1_message_sender.write(l1_message_sender);
        }

        // @inheritdoc ICommitmentsInbox
        fn transfer_ownership(ref self: ContractState, new_owner: ContractAddress) {
            let caller = get_caller_address();
            assert(self.owner.read() == caller, 'Only owner');
            self.owner.write(new_owner);

            if new_owner.is_zero() {
                self.emit(Event::OwnershipRenounced(OwnershipRenounced { previous_owner: caller }));
                return;
            }

            self
                .emit(
                    Event::OwnershipTransferred(
                        OwnershipTransferred { previous_owner: caller, new_owner }
                    )
                );
        }

        // @inheritdoc ICommitmentsInbox
        fn renounce_ownership(ref self: ContractState) {
            let caller = get_caller_address();
            assert(self.owner.read() == caller, 'Only owner');
            self.owner.write(Zeroable::zero());

            self.emit(Event::OwnershipRenounced(OwnershipRenounced { previous_owner: caller }));
        }

        // @inheritdoc ICommitmentsInbox
        fn receive_commitment_owner(
            ref self: ContractState, parent_hash: u256, block_number: u256
        ) {
            let caller = get_caller_address();
            assert(self.owner.read() == caller, 'Only owner');

            let contract_address = self.headers_store.read();
            IHeadersStoreDispatcher { contract_address }.receive_hash(parent_hash, block_number);

            self.emit(Event::CommitmentReceived(CommitmentReceived { parent_hash, block_number }));
        }
    }

    // @notice receives a parent blockhash and the corresponding block number from L1, and sends it to the HeadersStore
    // @param from_address The address of the sender, checking that it is the L1 contract
    // @param blockhash The parent blockhash of the block
    // @param block_number The block number of the block
    #[l1_handler]
    fn receive_commitment(
        ref self: ContractState, from_address: felt252, parent_hash: u256, block_number: u256
    ) {
        assert(from_address == self.l1_message_sender.read().into(), 'Invalid sender');

        let contract_address = self.headers_store.read();
        IHeadersStoreDispatcher { contract_address }.receive_hash(parent_hash, block_number);

        self.emit(Event::CommitmentReceived(CommitmentReceived { parent_hash, block_number }));
    }

    // @notice receives an MMR root and the last position from L1, and sends it to the HeadersStore
    // @dev This MMR was built offchain and verified on L1
    // @param from_address The address of the sender, checking that it is the L1 contract
    // @param root The root of the MMR
    // @param last_pos The last position of the MMR
    // @param aggregator_id The aggregator id of the proven MMR
    #[l1_handler]
    fn receive_mmr(
        ref self: ContractState,
        from_address: felt252,
        root: felt252,
        last_pos: usize,
        aggregator_id: usize
    ) {
        assert(from_address == self.l1_message_sender.read().into(), 'Invalid sender');

        let contract_address = self.headers_store.read();
        IHeadersStoreDispatcher { contract_address }
            .create_branch_from_message(root, last_pos, aggregator_id);

        self.emit(Event::MMRReceived(MMRReceived { root, last_pos, aggregator_id }));
    }
}
