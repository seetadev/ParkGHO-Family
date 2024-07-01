// SPDX-License-Identifier: GPL-3.0

//
// Contract
//

#[starknet::contract]
mod TimestampRemappers {
    use herodotus_eth_starknet::remappers::interface::{
        ITimestampRemappers, Headers, OriginElement, Proof, Peaks, Words64, ProofElement,
        BinarySearchTree
    };
    use starknet::ContractAddress;
    use cairo_lib::hashing::poseidon::{PoseidonHasher, hash_words64};
    use cairo_lib::data_structures::mmr::mmr::{MMR, MMRTrait};
    use cairo_lib::data_structures::mmr::utils::{leaf_index_to_mmr_index};
    use cairo_lib::encoding::rlp::{RLPItem, rlp_decode_list_lazy};
    use cairo_lib::utils::types::words64::{reverse_endianness_u64, bytes_used_u64};
    use herodotus_eth_starknet::core::headers_store::{
        IHeadersStoreDispatcherTrait, IHeadersStoreDispatcher
    };

    //
    // Events
    //

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        MapperCreated: MapperCreated,
        RemappedBlocks: RemappedBlocks
    }

    #[derive(Drop, starknet::Event)]
    struct MapperCreated {
        mapper_id: usize,
        start_block: u256
    }

    #[derive(Drop, starknet::Event)]
    struct RemappedBlocks {
        mapper_id: usize,
        start_block: u256,
        end_block: u256,
        mmr_root: felt252,
        mmr_size: usize
    }

    //
    // Structs
    //

    #[derive(Drop, Clone, starknet::Store)]
    struct Mapper {
        start_block: u256,
        elements_count: u256,
        last_timestamp: u256,
    }

    //
    // Storage
    //

    #[storage]
    struct Storage {
        headers_store: ContractAddress,
        // id => mapper
        mappers: LegacyMap::<usize, Mapper>,
        mappers_count: usize,
        // id => mmr
        mappers_mmrs: LegacyMap::<usize, MMR>,
        // (id, size) => root
        mappers_mmrs_history: LegacyMap::<(usize, usize), felt252>,
    }

    #[constructor]
    fn constructor(ref self: ContractState, headers_store: ContractAddress) {
        self.headers_store.write(headers_store);
        self.mappers_count.write(0);
    }

    //
    // External
    //

    #[external(v0)]
    impl TimestampRemappers of ITimestampRemappers<ContractState> {
        // Creates a new mapper and returns its ID.
        fn create_mapper(ref self: ContractState, start_block: u256) -> usize {
            let mmr: MMR = Default::default();

            let mapper_id = self.mappers_count.read();

            self.mappers_mmrs_history.write((mapper_id, 0), mmr.root);
            self.mappers_mmrs.write(mapper_id, mmr);

            let mapper = Mapper { start_block, elements_count: 0, last_timestamp: 0 };
            self.mappers.write(mapper_id, mapper);

            self.mappers_count.write(mapper_id + 1);

            self.emit(Event::MapperCreated(MapperCreated { mapper_id, start_block }));

            mapper_id
        }

        // Adds elements from other trusted data sources to the given mapper.
        fn reindex_batch(
            ref self: ContractState,
            mapper_id: usize,
            mapper_peaks: Peaks,
            origin_elements: Span<OriginElement>
        ) {
            let len = origin_elements.len(); // Count of elements in the batch to append
            assert(len != 0, 'Empty batch');

            // Fetch from storage
            let headers_store_addr = self.headers_store.read();
            let mut mapper = self.mappers.read(mapper_id);
            let mut mapper_mmr = self.mappers_mmrs.read(mapper_id);

            // Determine the expected block number of the first element in the batch
            let mut expected_block = mapper.start_block + mapper.elements_count;

            let mut idx = 0;
            let mut last_timestamp = 0; // Local to this batch
            let mut peaks = mapper_peaks;
            loop {
                if idx == len {
                    break ();
                }

                // 1. Verify that the block number is correct (i.e., matching with the expected block)
                let origin_element: @OriginElement = origin_elements.at(idx);
                let (origin_element_block_number, origin_element_timestamp) =
                    InternalFunctions::extract_header_block_number_and_timestamp(
                    *origin_element.header
                );
                assert(origin_element_block_number == expected_block, 'Unexpected block number');

                // 2. Verify that the header rlp is correct (i.e., matching with the leaf value)
                let current_hash = hash_words64(*origin_element.header);
                assert(current_hash == *origin_element.leaf_value.into(), 'Invalid header rlp');

                // 3. Verify that the inclusion proof of the leaf is valid
                let is_valid_proof = IHeadersStoreDispatcher {
                    contract_address: headers_store_addr
                }
                    .verify_historical_mmr_inclusion(
                        *origin_element.leaf_idx,
                        *origin_element.leaf_value,
                        *origin_element.peaks,
                        *origin_element.inclusion_proof,
                        *origin_element.tree_id,
                        *origin_element.last_pos
                    );
                assert(is_valid_proof, 'Invalid proof');

                // Add the block timestamp to the mapper MMR so we can binary search it later
                let (_, p) = mapper_mmr
                    .append(origin_element_timestamp.try_into().unwrap(), peaks)
                    .unwrap();
                peaks = p;

                // Update storage to the last timestamp of the batch
                if idx == len - 1 {
                    last_timestamp = origin_element_timestamp;
                } else {
                    expected_block += 1;
                }

                idx += 1;
            };

            // Update the mapper in the storage
            mapper.elements_count += len.into();
            mapper.last_timestamp = last_timestamp;
            self.mappers.write(mapper_id, mapper.clone());

            // Update the mapper MMR in the storage
            self.mappers_mmrs.write(mapper_id, mapper_mmr.clone());

            // Update MMR history
            self.mappers_mmrs_history.write((mapper_id, mapper_mmr.last_pos), mapper_mmr.root);

            self
                .emit(
                    Event::RemappedBlocks(
                        RemappedBlocks {
                            mapper_id,
                            start_block: mapper.start_block,
                            end_block: expected_block,
                            mmr_root: mapper_mmr.root,
                            mmr_size: mapper_mmr.last_pos
                        }
                    )
                );
        }

        // Retrieves the block number of the L1 block closest timestamp to the given timestamp.
        fn get_closest_l1_block_number(
            self: @ContractState, tree: BinarySearchTree, timestamp: u256
        ) -> Result<Option<u256>, felt252> {
            // Retrieve the corresponding mapper from storage
            let mapper = self.mappers.read(tree.mapper_id);

            let mapper_idx = InternalFunctions::mmr_binary_search(self, tree, timestamp);
            if mapper_idx.is_none() {
                // Happens when the provided timestamp is smaller or larger than
                // the first timestamp in the specified mapper MMR
                return Result::Err('No corresponding block number');
            }

            // The corresponding block number is the start block + the index in the MMR
            let corresponding_block_number: u256 = mapper.start_block + mapper_idx.unwrap();

            return Result::Ok(Option::Some(corresponding_block_number));
        }

        // Getter for the last timestamp of a given mapper.
        fn get_last_mapper_timestamp(self: @ContractState, mapper_id: usize) -> u256 {
            let mapper = self.mappers.read(mapper_id);
            mapper.last_timestamp
        }
    }

    //
    // Constants
    //

    const BLOCK_NUMBER_OFFSET_IN_HEADER_RLP: usize = 8;
    const TIMESTAMP_OFFSET_IN_HEADER_RLP: usize = 11;

    //
    // Internal
    //

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn extract_header_block_number_and_timestamp(header: Words64) -> (u256, u256) {
            let (decoded_rlp, _) = rlp_decode_list_lazy(
                header,
                array![BLOCK_NUMBER_OFFSET_IN_HEADER_RLP, TIMESTAMP_OFFSET_IN_HEADER_RLP].span()
            )
                .unwrap();
            let ((block_number, block_number_byte_len), (timestamp, timestamp_byte_len)) =
                match decoded_rlp {
                RLPItem::Bytes(_) => panic_with_felt252('Invalid header rlp'),
                RLPItem::List(l) => {
                    (*l.at(0), *l.at(1))
                },
            };
            (
                reverse_endianness_u64(*block_number.at(0), Option::Some(block_number_byte_len))
                    .into(),
                reverse_endianness_u64(*timestamp.at(0), Option::Some(timestamp_byte_len)).into()
            )
        }

        // Performs a binary search on the elements (i.e., timestamps) contained in the mapper MMR.
        // Since the elements are not accessible directly, we need to use their inclusion proofs
        // for each of those we want to access (i.e., every midpoint in the binary search).
        // Returns the index of the closest element to the given timestamp:
        // - If `x` is smaller than the first timestamp in the MMR, returns None.
        // - If `x` is larger than the last timestamp in the MMR, returns None.
        // - If `x` has an exact match, returns the index of the exact match.
        // - Otherwise, returns the index of the closest element smaller than `x` on the left side.
        fn mmr_binary_search(
            self: @ContractState, tree: BinarySearchTree, x: u256
        ) -> Option<u256> {
            // Fetch mapper and its last timestamp from storage
            let mapper = self.mappers.read(tree.mapper_id);
            let last_timestamp = mapper.last_timestamp;

            // Fetch MMR from history
            let root = self.mappers_mmrs_history.read((tree.mapper_id, tree.last_pos));
            let mmr = MMRTrait::new(root, tree.last_pos);

            // No elements to search in
            if mapper.elements_count == 0 {
                return Option::None(());
            }

            // If the timestamp is larger than the last timestamp in the MMR, return None
            if x > last_timestamp {
                return Option::None(());
            }

            let elements_count = mapper.elements_count; // Count of timestamps in the MMR
            let proofs: Span<ProofElement> = tree.proofs; // Inclusion proofs of midpoint elements
            let mut proof_idx = 0; // Offset in the proofs array
            let mut left: u256 = 0; // Lower boundary (search)
            let mut right: u256 = elements_count; // Higher boundary (search)

            let mut mid: u256 = 0;
            loop {
                if left >= right {
                    break;
                }

                mid = (left + right) / 2;
                let proof_element: @ProofElement = proofs.at(proof_idx);
                assert(
                    (*proof_element.index).into() == leaf_index_to_mmr_index(mid + 1),
                    'Unexpected proof index'
                );

                let mid_val: u256 = *proof_element.value;
                let is_valid_proof = mmr
                    .verify_proof(
                        index: *proof_element.index,
                        hash: mid_val.try_into().unwrap(),
                        peaks: tree.peaks,
                        proof: *proof_element.proof,
                    )
                    .unwrap();
                assert(is_valid_proof, 'Invalid proof');

                if x >= mid_val {
                    left = mid + 1;
                } else {
                    right = mid;
                }
                proof_idx += 1;
            };

            if left == 0 {
                return Option::None(());
            }
            let closest_idx: u256 = left - 1;

            if closest_idx != mid {
                // Verify the proof if it has not already been checked
                let tree_closest_low_val = tree.left_neighbor.unwrap();
                assert(
                    tree_closest_low_val.index.into() == leaf_index_to_mmr_index(closest_idx + 1),
                    'Unexpected proof index (c)'
                );

                let mmr = MMRTrait::new(root, tree.last_pos); // mmr was dropped
                let is_valid_low_proof = mmr
                    .verify_proof(
                        tree_closest_low_val.index,
                        tree_closest_low_val.value.try_into().unwrap(),
                        tree.peaks,
                        tree_closest_low_val.proof,
                    )
                    .unwrap();
                assert(is_valid_low_proof, 'Invalid proof');
            }

            return Option::Some(closest_idx);
        }
    }
}
