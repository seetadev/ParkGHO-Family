use starknet::ContractAddress;
use cairo_lib::data_structures::mmr::peaks::Peaks;
use cairo_lib::data_structures::mmr::proof::Proof;
use cairo_lib::utils::types::words64::Words64;
use cairo_lib::data_structures::mmr::mmr::MMR;

#[starknet::interface]
trait IHeadersStore<TContractState> {
    // @notice Returns the address of the CommitmentsInbox contract
    // @return The address of the CommitmentsInbox contract
    fn get_commitments_inbox(self: @TContractState) -> ContractAddress;

    // @notice Returns the MMR with a given id
    // @param mmr_id The id of the MMR
    // @return The MMR with the given id
    fn get_mmr(self: @TContractState, mmr_id: usize) -> MMR;

    // @notice Returns the root of the MMR with a given id
    // @param mmr_id The id of the MMR
    // @return The root of the MMR with the given id
    fn get_mmr_root(self: @TContractState, mmr_id: usize) -> felt252;

    // @notice Returns the size of the MMR with a given id
    // @param mmr_id The id of the MMR
    // @return The size of the MMR with the given id
    fn get_mmr_size(self: @TContractState, mmr_id: usize) -> usize;

    // @notice Returns the parent blockhash of a given block number, received from L1 and send throught the CommitmentsInbox
    fn get_received_block(self: @TContractState, block_number: u256) -> u256;

    // @notice Returns the latest MMR id
    // @dev MMR IDs are incremental
    fn get_latest_mmr_id(self: @TContractState) -> usize;

    // @notice Returns the root of the MMR with a given id and size
    // @dev The reason why we need to get historical roots is because we don't want MMR proofs to expire
    // @param mmr_id The id of the MMR
    // @param size The size of the MMR
    // @return The root of the MMR with the given id and size
    fn get_historical_root(self: @TContractState, mmr_id: usize, size: usize) -> felt252;

    // @notice Receives a parent blockhash and the corresponding block number from L1 and saves it
    // @dev This function can only be called by the CommitmentsInbox contract
    fn receive_hash(ref self: TContractState, parent_hash: u256, block_number: u256);

    // @notice Verifies an inclusion proof in an MMR
    // @dev The most up to date (biggest size) MMR with the given id is used
    // @param index The index of the element in the MMR
    // @param poseidon_blockhash The Poseidon hash of the block
    // @param peaks The peaks of the MMR
    // @param proof The inclusion proof (i.e., siblings path to the root hash)
    // @param mmr_id The id of the MMR
    // @return True if the proof is valid and the element is present, false otherwise
    fn verify_mmr_inclusion(
        self: @TContractState,
        index: usize,
        poseidon_blockhash: felt252,
        peaks: Peaks,
        proof: Proof,
        mmr_id: usize,
    ) -> bool;

    // @notice Verifies an inclusion proof in an MMR
    // @dev By passing the last_pos, we can verify proofs in historical MMRs
    // @param index The index of the element in the MMR
    // @param poseidon_blockhash The Poseidon hash of the block
    // @param peaks The peaks of the MMR
    // @param proof The inclusion proof (i.e., siblings path to the root hash)
    // @param mmr_id The id of the MMR
    // @param last_pos The last position of the MMR
    // @return True if the proof is valid and the element is present, false otherwise
    fn verify_historical_mmr_inclusion(
        self: @TContractState,
        index: usize,
        poseidon_blockhash: felt252,
        peaks: Peaks,
        proof: Proof,
        mmr_id: usize,
        last_pos: usize,
    ) -> bool;

    // @notice Appends a batch of block hashes to the MMR starting from a specific block, either from a hash received from L1 or from an MMR element
    // @param headers_rlp The RLP-encoded headers
    // @param mmr_peaks The peaks of the MMR
    // @param mmr_id The id of the MMR
    // @param reference_block A block whose hash was receiven from L1 (if starting from MMR element, None)
    // @param mmr_index The index of the starting blockhash in the MMR (if starting from L1, None)
    // @param mmr_proof The MMR inclusion porrof of the starting blockhash (if starting from L1, None)
    // @dev If the starting blockhash was received from L1, then reference_block must be provided, and mmr_index and mmr_proof must be None
    // @dev If the starting blockhash is present in the MMR, then mmr_index and mmr_proof must be provided, and reference_block must be None
    fn process_batch(
        ref self: TContractState,
        headers_rlp: Span<Words64>,
        mmr_peaks: Peaks,
        mmr_id: usize,
        reference_block: Option<u256>,
        mmr_index: Option<usize>,
        mmr_proof: Option<Proof>,
    );

    // @notice Creates a new MMR with a given root and size, that was proven and verified on L1
    // @param root The root of the MMR
    // @param last_pos The size of the MMR
    // @param aggregator_id The id of the L1 aggregator
    // @dev This function can only be called by the CommitmentsInbox contract
    fn create_branch_from_message(
        ref self: TContractState, root: felt252, last_pos: usize, aggregator_id: usize
    );


    // @notice Creates a new MMR with a single element, present in another MMR (branch)
    // @param index The index of the element in the MMR
    // @param initial_poseidon_blockhash The Poseidon hash of the block
    // @param peaks The peaks of the MMR
    // @param proof The inclusion proof (i.e., siblings path to the root hash)
    // @param mmr_id The id of the MMR
    // @param last_pos last_pos of the given MMR
    fn create_branch_single_element(
        ref self: TContractState,
        index: usize,
        initial_poseidon_blockhash: felt252,
        peaks: Peaks,
        proof: Proof,
        mmr_id: usize,
        last_pos: usize
    );

    // @notice Creates a new MMR that is a clone of an already existing MMR
    // @param mmr_id The id of the MMR to clone
    // @param last_pos last_pos of the given MMR
    fn create_branch_from(ref self: TContractState, mmr_id: usize, last_pos: usize);
}


// @notice Contract responsible for storing all the block hashes
// @dev The contract keeps track of multiple MMRs (refered to as branches), each with a different id
// @dev The contract also keeps track of historical roots and corresponding sizes of every MMR, 
#[starknet::contract]
mod HeadersStore {
    use starknet::{ContractAddress, get_caller_address};
    use cairo_lib::data_structures::mmr::mmr::{MMR, MMRTrait};
    use cairo_lib::data_structures::mmr::peaks::Peaks;
    use cairo_lib::data_structures::mmr::proof::Proof;
    use cairo_lib::utils::types::words64::{
        Words64, Words64Trait, reverse_endianness_u64, bytes_used_u64
    };
    use cairo_lib::hashing::keccak::keccak_cairo_words64;
    use cairo_lib::hashing::poseidon::hash_words64;
    use cairo_lib::utils::bitwise::reverse_endianness_u256;
    use cairo_lib::encoding::rlp::{RLPItem, rlp_decode_list_lazy};

    const MMR_INITIAL_ROOT: felt252 =
        0x6759138078831011e3bc0b4a135af21c008dda64586363531697207fb5a2bae;

    #[storage]
    struct Storage {
        commitments_inbox: ContractAddress,
        mmr: LegacyMap::<usize, MMR>,
        // (id, size) => root
        mmr_history: LegacyMap::<(usize, usize), felt252>,
        // block_number => parent blockhash
        received_blocks: LegacyMap::<u256, u256>,
        latest_mmr_id: usize
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        HashReceived: HashReceived,
        ProcessedBlock: ProcessedBlock,
        ProcessedBatch: ProcessedBatch,
        BranchCreatedFromElement: BranchCreatedFromElement,
        BranchCreatedClone: BranchCreatedClone,
        BranchCreatedFromL1: BranchCreatedFromL1
    }

    #[derive(Drop, starknet::Event)]
    struct HashReceived {
        block_number: u256,
        parent_hash: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct ProcessedBlock {
        block_number: u256,
        new_root: felt252,
        new_size: usize,
        mmr_id: usize
    }

    #[derive(Drop, starknet::Event)]
    struct ProcessedBatch {
        block_start: u256,
        block_end: u256,
        new_root: felt252,
        new_size: usize,
        mmr_id: usize
    }

    #[derive(Drop, starknet::Event)]
    struct BranchCreatedFromElement {
        mmr_id: usize,
        root: felt252,
        last_pos: usize,
        detached_from_mmr_id: usize,
        mmr_index: usize
    }

    #[derive(Drop, starknet::Event)]
    struct BranchCreatedFromL1 {
        mmr_id: usize,
        root: felt252,
        last_pos: usize,
        aggregator_id: usize
    }

    #[derive(Drop, starknet::Event)]
    struct BranchCreatedClone {
        mmr_id: usize,
        root: felt252,
        last_pos: usize,
        detached_from_mmr_id: usize
    }

    #[constructor]
    fn constructor(ref self: ContractState, commitments_inbox: ContractAddress) {
        self.commitments_inbox.write(commitments_inbox);

        let mmr: MMR = MMRTrait::new(MMR_INITIAL_ROOT, 1);
        let root = mmr.root;

        self.mmr.write(0, mmr);
        self.mmr_history.write((0, 1), root);
        self.latest_mmr_id.write(0);
    }


    #[external(v0)]
    impl HeadersStore of super::IHeadersStore<ContractState> {
        // @inheritdoc IHeadersStore
        fn get_commitments_inbox(self: @ContractState) -> ContractAddress {
            self.commitments_inbox.read()
        }

        // @inheritdoc IHeadersStore
        fn get_mmr(self: @ContractState, mmr_id: usize) -> MMR {
            self.mmr.read(mmr_id)
        }

        // @inheritdoc IHeadersStore
        fn get_mmr_root(self: @ContractState, mmr_id: usize) -> felt252 {
            self.mmr.read(mmr_id).root
        }

        // @inheritdoc IHeadersStore
        fn get_mmr_size(self: @ContractState, mmr_id: usize) -> usize {
            self.mmr.read(mmr_id).last_pos
        }

        // @inheritdoc IHeadersStore
        fn get_received_block(self: @ContractState, block_number: u256) -> u256 {
            self.received_blocks.read(block_number)
        }

        // @inheritdoc IHeadersStore
        fn get_latest_mmr_id(self: @ContractState) -> usize {
            self.latest_mmr_id.read()
        }

        // @inheritdoc IHeadersStore
        fn get_historical_root(self: @ContractState, mmr_id: usize, size: usize) -> felt252 {
            self.mmr_history.read((mmr_id, size))
        }

        // @inheritdoc IHeadersStore
        fn receive_hash(ref self: ContractState, parent_hash: u256, block_number: u256) {
            let caller = get_caller_address();
            assert(caller == self.commitments_inbox.read(), 'Only CommitmentsInbox');

            self.received_blocks.write(block_number, parent_hash);

            self.emit(Event::HashReceived(HashReceived { block_number, parent_hash }));
        }

        // @inheritdoc IHeadersStore
        fn process_batch(
            ref self: ContractState,
            headers_rlp: Span<Words64>,
            mmr_peaks: Peaks,
            mmr_id: usize,
            reference_block: Option<u256>,
            mmr_index: Option<usize>,
            mmr_proof: Option<Proof>,
        ) {
            let mut mmr = self.mmr.read(mmr_id);
            let poseidon_hash = hash_words64(*headers_rlp.at(0));
            let mut peaks = mmr_peaks;
            let mut start_block = 0;
            let mut end_block = 0;

            let (mut decoded_rlp, mut rlp_byte_len) = (RLPItem::Bytes((array![].span(), 0)), 0);

            if mmr_proof.is_some() {
                assert(reference_block.is_none(), 'Cannot use proof AND ref block');
                assert(headers_rlp.len() >= 2, 'Invalid headers rlp');

                match rlp_decode_list_lazy(*headers_rlp.at(0), array![0, 8].span()) {
                    Result::Ok((d, d_l)) => {
                        decoded_rlp = d;
                        rlp_byte_len = d_l;
                    },
                    Result::Err(_) => {
                        panic_with_felt252('Invalid header rlp');
                    }
                };

                let valid_proof = mmr
                    .verify_proof(mmr_index.unwrap(), poseidon_hash, mmr_peaks, mmr_proof.unwrap())
                    .expect('MMR proof verification failed');
                assert(valid_proof, 'Invalid proof');

                match @decoded_rlp {
                    RLPItem::Bytes(_) => panic_with_felt252('Invalid header rlp'),
                    RLPItem::List(l) => {
                        let (start_block_words, start_block_byte_len) = *(*l).at(1);
                        assert(start_block_words.len() == 1, 'Invalid start_block');

                        let start_block_le = *start_block_words.at(0);
                        start_block =
                            reverse_endianness_u64(
                                start_block_le, Option::Some(start_block_byte_len)
                            )
                            .into()
                            - 1;

                        end_block = start_block - headers_rlp.len().into() + 2;
                    }
                };
            } else {
                assert(headers_rlp.len() >= 1, 'Invalid headers rlp');

                match rlp_decode_list_lazy(*headers_rlp.at(0), array![0].span()) {
                    Result::Ok((d, d_l)) => {
                        decoded_rlp = d;
                        rlp_byte_len = d_l;
                    },
                    Result::Err(_) => {
                        panic_with_felt252('Invalid header rlp');
                    }
                };

                let reference_block = reference_block.unwrap();
                start_block = reference_block - 1;
                end_block = start_block - headers_rlp.len().into() + 1;

                let initial_blockhash = self.received_blocks.read(reference_block);
                assert(initial_blockhash != Zeroable::zero(), 'Block not received');

                let mut last_word_byte_len = rlp_byte_len % 8;
                if last_word_byte_len == 0 {
                    last_word_byte_len = 8;
                }
                let rlp_hash = InternalFunctions::keccak_hash_rlp(
                    *headers_rlp.at(0), last_word_byte_len, true
                );
                assert(rlp_hash == initial_blockhash, 'Invalid initial header rlp');

                let (_, p) = mmr.append(poseidon_hash, mmr_peaks).expect('Failed to append to MMR');
                peaks = p;
            }

            let mut i: usize = 1;
            loop {
                if i == headers_rlp.len() {
                    break ();
                }

                let parent_hash: u256 = match decoded_rlp {
                    RLPItem::Bytes(_) => panic_with_felt252('Invalid header rlp'),
                    RLPItem::List(l) => {
                        let (words, words_byte_len) = *l.at(0);
                        assert(words.len() == 4 && words_byte_len == 32, 'Invalid parent_hash rlp');
                        words.as_u256_le(32).unwrap()
                    },
                };

                let current_rlp = *headers_rlp.at(i);

                match rlp_decode_list_lazy(current_rlp, array![0].span()) {
                    Result::Ok((d, d_l)) => {
                        decoded_rlp = d;
                        rlp_byte_len = d_l;
                    },
                    Result::Err(_) => {
                        panic_with_felt252('Invalid header rlp');
                    }
                };

                let mut last_word_byte_len = rlp_byte_len % 8;
                if last_word_byte_len == 0 {
                    last_word_byte_len = 8;
                }
                let current_hash = InternalFunctions::keccak_hash_rlp(
                    current_rlp, last_word_byte_len, false
                );
                assert(current_hash == parent_hash, 'Invalid header rlp');

                let poseidon_hash = hash_words64(current_rlp);

                let (_, p) = mmr.append(poseidon_hash, peaks).expect('Failed to append to MMR');
                peaks = p;

                i += 1;
            };

            self.mmr.write(mmr_id, mmr.clone());
            self.mmr_history.write((mmr_id, mmr.last_pos), mmr.root);

            self
                .emit(
                    Event::ProcessedBatch(
                        ProcessedBatch {
                            block_start: start_block,
                            block_end: end_block,
                            new_root: mmr.root,
                            new_size: mmr.last_pos,
                            mmr_id
                        }
                    )
                );
        }

        // @inheritdoc IHeadersStore
        fn verify_mmr_inclusion(
            self: @ContractState,
            index: usize,
            poseidon_blockhash: felt252,
            peaks: Peaks,
            proof: Proof,
            mmr_id: usize,
        ) -> bool {
            let mmr = self.mmr.read(mmr_id);

            mmr
                .verify_proof(index, poseidon_blockhash, peaks, proof)
                .expect('MMR proof verification failed')
        }

        // @inheritdoc IHeadersStore
        fn verify_historical_mmr_inclusion(
            self: @ContractState,
            index: usize,
            poseidon_blockhash: felt252,
            peaks: Peaks,
            proof: Proof,
            mmr_id: usize,
            last_pos: usize,
        ) -> bool {
            let root = self.mmr_history.read((mmr_id, last_pos));
            let mmr = MMRTrait::new(root, last_pos);

            mmr
                .verify_proof(index, poseidon_blockhash, peaks, proof)
                .expect('MMR proof verification failed')
        }

        // @inheritdoc IHeadersStore
        fn create_branch_from_message(
            ref self: ContractState, root: felt252, last_pos: usize, aggregator_id: usize
        ) {
            let caller = get_caller_address();
            assert(caller == self.commitments_inbox.read(), 'Only CommitmentsInbox');

            let mmr_id = self.latest_mmr_id.read() + 1;
            let mmr = MMRTrait::new(root, last_pos);
            self.mmr.write(mmr_id, mmr);
            self.mmr_history.write((mmr_id, last_pos), root);
            self.latest_mmr_id.write(mmr_id);

            self
                .emit(
                    Event::BranchCreatedFromL1(
                        BranchCreatedFromL1 { mmr_id, root, last_pos, aggregator_id }
                    )
                );
        }

        // @inheritdoc IHeadersStore
        fn create_branch_single_element(
            ref self: ContractState,
            index: usize,
            initial_poseidon_blockhash: felt252,
            peaks: Peaks,
            proof: Proof,
            mmr_id: usize,
            last_pos: usize
        ) {
            assert(
                HeadersStore::verify_historical_mmr_inclusion(
                    @self, index, initial_poseidon_blockhash, peaks, proof, mmr_id, last_pos
                ),
                'Invalid proof'
            );

            let mut mmr: MMR = Default::default();
            mmr.append(initial_poseidon_blockhash, array![].span());

            let root = mmr.root;
            let last_pos = mmr.last_pos;

            let latest_mmr_id = self.latest_mmr_id.read() + 1;
            self.mmr.write(latest_mmr_id, mmr);
            self.mmr_history.write((latest_mmr_id, last_pos), root);
            self.latest_mmr_id.write(latest_mmr_id);

            self
                .emit(
                    Event::BranchCreatedFromElement(
                        BranchCreatedFromElement {
                            mmr_id: latest_mmr_id,
                            root,
                            last_pos,
                            detached_from_mmr_id: mmr_id,
                            mmr_index: index
                        }
                    )
                );
        }

        // @inheritdoc IHeadersStore
        fn create_branch_from(ref self: ContractState, mmr_id: usize, last_pos: usize) {
            let latest_mmr_id = self.latest_mmr_id.read() + 1;
            let root = self.mmr_history.read((mmr_id, last_pos));

            let mmr = MMRTrait::new(root, last_pos);

            self.mmr.write(latest_mmr_id, mmr);
            self.mmr_history.write((latest_mmr_id, last_pos), root);
            self.latest_mmr_id.write(latest_mmr_id);

            self
                .emit(
                    Event::BranchCreatedClone(
                        BranchCreatedClone {
                            mmr_id: latest_mmr_id, root, last_pos, detached_from_mmr_id: mmr_id
                        }
                    )
                );
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        // @notice Hashes RLP-encoded header
        // @param rlp RLP-encoded header
        // @param last_word_bytes Number of bytes in the last word
        // @param big_endian Whether to reverse endianness of the hash
        // @return Hash of the header
        fn keccak_hash_rlp(rlp: Words64, last_word_bytes: usize, big_endian: bool) -> u256 {
            let mut hash = keccak_cairo_words64(rlp, last_word_bytes);
            if big_endian {
                reverse_endianness_u256(hash)
            } else {
                hash
            }
        }
    }
}
