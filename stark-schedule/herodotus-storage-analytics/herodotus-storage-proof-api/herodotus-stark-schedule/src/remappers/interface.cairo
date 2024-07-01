// SPDX-License-Identifier: GPL-3.0

//
// Interface types
//

use cairo_lib::data_structures::mmr::proof::Proof;
use cairo_lib::data_structures::mmr::peaks::Peaks;
use cairo_lib::utils::types::words64::Words64;

type Headers = Span<Words64>;

#[derive(Drop, Serde)]
struct OriginElement {
    tree_id: usize,
    last_pos: usize,
    leaf_idx: usize,
    leaf_value: felt252,
    inclusion_proof: Proof,
    peaks: Peaks,
    header: Words64
}

#[derive(Drop, Serde)]
struct ProofElement {
    index: usize,
    value: u256,
    proof: Proof,
}

#[derive(Drop, Serde)]
struct BinarySearchTree {
    mapper_id: usize,
    last_pos: usize, // last_pos in mapper's MMR
    peaks: Peaks,
    proofs: Span<ProofElement>, // Midpoint elements inclusion proofs
    left_neighbor: Option<ProofElement>, // Optional left neighbor inclusion proof
}

//
// Interface
//

#[starknet::interface]
trait ITimestampRemappers<TContractState> {
    // Creates a new mapper and returns its ID.
    fn create_mapper(ref self: TContractState, start_block: u256) -> usize;

    // Adds elements from other trusted data sources to the given mapper.
    fn reindex_batch(
        ref self: TContractState,
        mapper_id: usize,
        mapper_peaks: Peaks,
        origin_elements: Span<OriginElement>
    );

    // Retrieves the block number of the L1 closest timestamp to the given timestamp.
    fn get_closest_l1_block_number(
        self: @TContractState, tree: BinarySearchTree, timestamp: u256
    ) -> Result<Option<u256>, felt252>;

    // Getter for the last timestamp of a given mapper.
    fn get_last_mapper_timestamp(self: @TContractState, mapper_id: usize) -> u256;
}
