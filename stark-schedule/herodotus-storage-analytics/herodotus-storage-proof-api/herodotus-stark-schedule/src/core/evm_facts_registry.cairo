use starknet::ContractAddress;
use cairo_lib::data_structures::mmr::proof::Proof;
use cairo_lib::data_structures::mmr::peaks::Peaks;
use cairo_lib::utils::types::words64::Words64;

#[derive(Drop, Serde)]
enum AccountField {
    StorageHash: (),
    CodeHash: (),
    Balance: (),
    Nonce: ()
}

#[starknet::interface]
trait IEVMFactsRegistry<TContractState> {
    // @notice Returns the address of the headers store
    // @return The address of the headers store
    fn get_headers_store(self: @TContractState) -> ContractAddress;

    // @notice Returns a proven account field values
    // @param account: The account to query
    // @param block: The block number
    // @param field: The field to query
    // @return The value of the field, if the field is not proven, returns None
    fn get_account_field(
        self: @TContractState, account: felt252, block: u256, field: AccountField
    ) -> Option<u256>;

    // @notice Returns a proven storage slot value
    // @param account: The account to query
    // @param block: The block number
    // @param slot: The slot to query
    // @return The value of the slot, if the slot is not proven, returns None
    fn get_slot_value(
        self: @TContractState, account: felt252, block: u256, slot: u256
    ) -> Option<u256>;

    // @notice Gets an account from a block
    // @param fields: The fields to query
    // @param block_header_rlp: The RLP of the block header
    // @param account: The account to query
    // @param mpt_proof: The MPT proof of the account
    // @param mmr_index: The index of the block in the MMR
    // @param mmr_peaks: The peaks of the MMR
    // @param mmr_proof: The proof of inclusion of the blockhash in the MMR
    // @param mmr_id: The id of the MMR
    // @param last_pos The size of the MMR for which the proof was generated
    // @return The values of the fields
    fn get_account(
        self: @TContractState,
        fields: Span<AccountField>,
        block_header_rlp: Words64,
        account: felt252,
        mpt_proof: Span<Words64>,
        mmr_index: usize,
        mmr_peaks: Peaks,
        mmr_proof: Proof,
        mmr_id: usize,
        last_pos: usize,
    ) -> Span<u256>;

    // @notice Gets a storage slot from a proven account
    // @dev The account storage hash must be proven
    // @param block: The block number
    // @param account: The account to query
    // @param slot: The slot to query
    fn get_storage(
        self: @TContractState, block: u256, account: felt252, slot: u256, mpt_proof: Span<Words64>
    ) -> u256;

    // @notice Proves an account at a given block
    // @dev The proven fields are written to storage and can later be used
    // @param fields: The fields to prove
    // @param block_header_rlp: The RLP of the block header
    // @param account: The account to prove
    // @param mpt_proof: The MPT proof of the account
    // @param mmr_index: The index of the block in the MMR
    // @param mmr_peaks: The peaks of the MMR
    // @param mmr_proof: The proof of inclusion of the blockhash in the MMR
    // @param mmr_id: The id of the MMR
    // @param last_pos The size of the MMR for which the proof was generated
    fn prove_account(
        ref self: TContractState,
        fields: Span<AccountField>,
        block_header_rlp: Words64,
        account: felt252,
        mpt_proof: Span<Words64>,
        mmr_index: usize,
        mmr_peaks: Peaks,
        mmr_proof: Proof,
        mmr_id: usize,
        last_pos: usize,
    );

    // @notice Proves a storage slot at a given block
    // @dev The proven slot is written to storage and can later be used
    // @dev The account storage hash must be proven
    // @param block: The block number
    // @param account: The account to prove
    // @param slot: The slot to prove
    // @param mpt_proof: The MPT proof of the slot (storage proof)
    fn prove_storage(
        ref self: TContractState,
        block: u256,
        account: felt252,
        slot: u256,
        mpt_proof: Span<Words64>
    );
}

// @notice Contract that stores all the proven facts, entrypoint for applications using with Herodotus
#[starknet::contract]
mod EVMFactsRegistry {
    use starknet::ContractAddress;
    use super::AccountField;
    use cairo_lib::data_structures::mmr::proof::Proof;
    use cairo_lib::data_structures::mmr::peaks::Peaks;
    use cairo_lib::hashing::poseidon::hash_words64;
    use cairo_lib::data_structures::eth_mpt::MPTTrait;
    use cairo_lib::encoding::rlp::{RLPItem, rlp_decode, rlp_decode_list_lazy};
    use cairo_lib::utils::types::words64::{
        Words64, Words64Trait, reverse_endianness_u64, bytes_used_u64
    };
    use herodotus_eth_starknet::core::headers_store::{
        IHeadersStoreDispatcherTrait, IHeadersStoreDispatcher
    };
    use cairo_lib::utils::bitwise::reverse_endianness_u256;
    use cairo_lib::hashing::keccak::keccak_cairo_words64;

    #[storage]
    struct Storage {
        headers_store: ContractAddress,
        // Update to EthAddress when supported
        // (account_address, block_number) => value
        storage_hash: LegacyMap::<(felt252, u256), Option<u256>>,
        code_hash: LegacyMap::<(felt252, u256), Option<u256>>,
        balance: LegacyMap::<(felt252, u256), Option<u256>>,
        nonce: LegacyMap::<(felt252, u256), Option<u256>>,
        // (account_address, block_number, slot) => value
        slot_values: LegacyMap::<(felt252, u256, u256), Option<u256>>
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        AccountProven: AccountProven,
        StorageProven: StorageProven
    }

    #[derive(Drop, starknet::Event)]
    struct AccountProven {
        account: felt252,
        block: u256,
        fields: Span<AccountField>
    }

    #[derive(Drop, starknet::Event)]
    struct StorageProven {
        account: felt252,
        block: u256,
        slot: u256,
        value: u256
    }

    #[constructor]
    fn constructor(ref self: ContractState, headers_store: ContractAddress) {
        self.headers_store.write(headers_store);
    }

    #[external(v0)]
    impl EVMFactsRegistry of super::IEVMFactsRegistry<ContractState> {
        // @inheritdoc IEVMFactsRegistry
        fn get_headers_store(self: @ContractState) -> ContractAddress {
            self.headers_store.read()
        }

        // @inheritdoc IEVMFactsRegistry
        fn get_account_field(
            self: @ContractState, account: felt252, block: u256, field: AccountField
        ) -> Option<u256> {
            match field {
                AccountField::StorageHash(_) => self.storage_hash.read((account, block)),
                AccountField::CodeHash(_) => self.code_hash.read((account, block)),
                AccountField::Balance(_) => self.balance.read((account, block)),
                AccountField::Nonce(_) => self.nonce.read((account, block))
            }
        }

        // @inheritdoc IEVMFactsRegistry
        fn get_slot_value(
            self: @ContractState, account: felt252, block: u256, slot: u256
        ) -> Option<u256> {
            self.slot_values.read((account, block, slot))
        }

        // @inheritdoc IEVMFactsRegistry
        fn get_account(
            self: @ContractState,
            fields: Span<AccountField>,
            block_header_rlp: Words64,
            account: felt252,
            mpt_proof: Span<Words64>,
            mmr_index: usize,
            mmr_peaks: Peaks,
            mmr_proof: Proof,
            mmr_id: usize,
            last_pos: usize,
        ) -> Span<u256> {
            let (_, fields) = InternalFunctions::get_account(
                self,
                fields,
                block_header_rlp,
                account,
                mpt_proof,
                mmr_index,
                mmr_peaks,
                mmr_proof,
                mmr_id,
                last_pos
            );

            fields
        }

        // @inheritdoc IEVMFactsRegistry
        fn get_storage(
            self: @ContractState,
            block: u256,
            account: felt252,
            slot: u256,
            mpt_proof: Span<Words64>
        ) -> u256 {
            let storage_hash = reverse_endianness_u256(
                self.storage_hash.read((account, block)).expect('Storage hash not proven')
            );

            // Split the slot into 4 64 bit words
            let word0_pow2 = 0x1000000000000000000000000000000000000000000000000;
            let word1_pow2 = 0x100000000000000000000000000000000;
            let word2_pow2 = 0x10000000000000000;
            let words = array![
                reverse_endianness_u64((slot / word0_pow2).try_into().unwrap(), Option::None),
                reverse_endianness_u64(
                    ((slot / word1_pow2) & 0xffffffffffffffff).try_into().unwrap(), Option::None
                ),
                reverse_endianness_u64(
                    ((slot / word2_pow2) & 0xffffffffffffffff).try_into().unwrap(), Option::None
                ),
                reverse_endianness_u64(
                    (slot & 0xffffffffffffffff).try_into().unwrap(), Option::None
                ),
            ]
                .span();
            let key = reverse_endianness_u256(keccak_cairo_words64(words, 8));

            let mpt = MPTTrait::new(storage_hash);
            let rlp_value = mpt.verify(key, 64, mpt_proof).expect('MPT verification failed');

            if rlp_value.is_empty() {
                return 0;
            }

            let (item, _) = rlp_decode(rlp_value).expect('Invalid RLP value');

            match item {
                RLPItem::Bytes((value, value_len)) => value
                    .as_u256_be(value_len)
                    .expect('Invalid value'),
                RLPItem::List(_) => panic_with_felt252('Invalid header rlp')
            }
        }

        // @inheritdoc IEVMFactsRegistry
        fn prove_account(
            ref self: ContractState,
            fields: Span<AccountField>,
            block_header_rlp: Words64,
            account: felt252,
            mpt_proof: Span<Words64>,
            mmr_index: usize,
            mmr_peaks: Peaks,
            mmr_proof: Proof,
            mmr_id: usize,
            last_pos: usize,
        ) {
            let (block, field_values) = InternalFunctions::get_account(
                @self,
                fields,
                block_header_rlp,
                account,
                mpt_proof,
                mmr_index,
                mmr_peaks,
                mmr_proof,
                mmr_id,
                last_pos
            );

            let mut i: usize = 0;
            loop {
                if i == field_values.len() {
                    break ();
                }

                let field = fields.at(i);
                let value = Option::Some(*field_values.at(i));

                match field {
                    AccountField::StorageHash(_) => {
                        self.storage_hash.write((account, block), value);
                    },
                    AccountField::CodeHash(_) => {
                        self.code_hash.write((account, block), value);
                    },
                    AccountField::Balance(_) => {
                        self.balance.write((account, block), value);
                    },
                    AccountField::Nonce(_) => {
                        self.nonce.write((account, block), value);
                    }
                };

                i += 1;
            };

            self.emit(Event::AccountProven(AccountProven { account, block, fields }));
        }

        // @inheritdoc IEVMFactsRegistry
        fn prove_storage(
            ref self: ContractState,
            block: u256,
            account: felt252,
            slot: u256,
            mpt_proof: Span<Words64>
        ) {
            let value = EVMFactsRegistry::get_storage(@self, block, account, slot, mpt_proof);
            self.slot_values.write((account, block, slot), Option::Some(value));

            self.emit(Event::StorageProven(StorageProven { account, block, slot, value: value }));
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        // @inheritdoc IEVMFactsRegistry
        fn get_account(
            self: @ContractState,
            fields: Span<AccountField>,
            block_header_rlp: Words64,
            account: felt252,
            mpt_proof: Span<Words64>,
            mmr_index: usize,
            mmr_peaks: Peaks,
            mmr_proof: Proof,
            mmr_id: usize,
            last_pos: usize,
        ) -> (u256, Span<u256>) {
            let blockhash = hash_words64(block_header_rlp);

            let contract_address = self.headers_store.read();
            let mmr_inclusion = IHeadersStoreDispatcher { contract_address }
                .verify_historical_mmr_inclusion(
                    mmr_index, blockhash, mmr_peaks, mmr_proof, mmr_id, last_pos
                );
            assert(mmr_inclusion, 'MMR inclusion not proven');

            let (decoded_rlp, _) = rlp_decode_list_lazy(block_header_rlp, array![3, 8].span())
                .expect('Invalid header rlp');
            let mut state_root: u256 = 0;
            let mut block_number: u256 = 0;
            match decoded_rlp {
                RLPItem::Bytes(_) => panic_with_felt252('Invalid header rlp'),
                RLPItem::List(l) => {
                    let (state_root_words, _) = *l.at(0);
                    state_root = state_root_words.as_u256_le(32).unwrap();

                    let (block_number_words, block_number_byte_len) = *l.at(1);
                    assert(block_number_words.len() == 1, 'Invalid block number');

                    let block_number_le = *block_number_words.at(0);
                    block_number =
                        reverse_endianness_u64(block_number_le, Option::Some(block_number_byte_len))
                        .into();
                },
            };

            let mpt = MPTTrait::new(state_root);
            let account_u256: u256 = account.into();

            // Split the address into 3 64 bit words
            let word0_pow2 = 0x1000000000000000000000000;
            let word1_pow2 = 0x100000000;
            let words = array![
                reverse_endianness_u64(
                    (account_u256 / word0_pow2).try_into().unwrap(), Option::None
                ),
                reverse_endianness_u64(
                    ((account_u256 / word1_pow2) & 0xffffffffffffffff).try_into().unwrap(),
                    Option::None
                ),
                reverse_endianness_u64(
                    (account_u256 & 0xffffffff).try_into().unwrap(), Option::Some(4)
                ),
            ]
                .span();
            let key = reverse_endianness_u256(keccak_cairo_words64(words, 4));

            let rlp_account = mpt.verify(key, 64, mpt_proof).expect('MPT verification failed');

            let mut account_fields = ArrayTrait::new();
            if rlp_account.is_empty() {
                let mut i: usize = 0;
                loop {
                    if i == fields.len() {
                        break ();
                    }

                    account_fields.append(0);

                    i += 1;
                };
            } else {
                let (decoded_account, _) = rlp_decode(rlp_account).expect('Invalid account rlp');
                match decoded_account {
                    RLPItem::Bytes(_) => panic_with_felt252('Invalid account rlp'),
                    RLPItem::List(l) => {
                        let mut i: usize = 0;
                        loop {
                            if i == fields.len() {
                                break ();
                            }

                            let field = fields.at(i);
                            let (field_value, field_value_len) = match field {
                                AccountField::StorageHash(_) => {
                                    *l.at(2)
                                },
                                AccountField::CodeHash(_) => {
                                    *l.at(3)
                                },
                                AccountField::Balance(_) => {
                                    *l.at(1)
                                },
                                AccountField::Nonce(_) => {
                                    *l.at(0)
                                },
                            };

                            account_fields.append(field_value.as_u256_be(field_value_len).unwrap());

                            i += 1;
                        };
                    },
                };
            }

            (block_number, account_fields.span())
        }
    }
}
