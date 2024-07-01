// SPDX-License-Identifier: GPL-3.0

use snforge_std::{declare, PreparedContract, deploy, start_prank, stop_prank};
use starknet::ContractAddress;
use cairo_lib::data_structures::mmr::mmr::MMR;
use cairo_lib::data_structures::mmr::mmr::MMRTrait;
use cairo_lib::utils::bitwise::bit_length;
use cairo_lib::utils::math::pow;
use herodotus_eth_starknet::remappers::interface::{
    ITimestampRemappersDispatcherTrait, ITimestampRemappersDispatcher, BinarySearchTree,
    ProofElement, OriginElement
};
use herodotus_eth_starknet::core::headers_store::{
    IHeadersStoreDispatcherTrait, IHeadersStoreDispatcher
};

fn deploy_headers_store() -> ContractAddress {
    let class_hash = declare('HeadersStore');
    let mut constructor_calldata = ArrayTrait::new();
    constructor_calldata.append(0);

    let prepared = PreparedContract {
        class_hash: class_hash, constructor_calldata: @constructor_calldata
    };

    deploy(prepared).unwrap()
}

fn deploy_timestamp_remappers(headers_store: ContractAddress) -> ContractAddress {
    let class_hash = declare('TimestampRemappers');
    let mut constructor_calldata: Array<felt252> = ArrayTrait::new();
    constructor_calldata.append(headers_store.into());

    let prepared = PreparedContract {
        class_hash: class_hash, constructor_calldata: @constructor_calldata
    };

    deploy(prepared).unwrap()
}

fn inner_test_proof(mmr: @MMR) {
    let mut proof = ArrayTrait::new();
    proof.append(4);
    proof.append(0x5d44a3decb2b2e0cc71071f7b802f45dd792d064f0fc7316c46514f70f9891a);

    let mut peaks = ArrayTrait::new();
    peaks.append(0x43c59debacab61e73dec9edd73da27738a8be14c1e123bb38f9634220323c4f);
    peaks.append(8);

    let result = mmr.verify_proof(index: 5, hash: 5, peaks: peaks.span(), proof: proof.span());
    assert(result.unwrap() == true, 'Invalid proof');
}

fn count_ones(n: u256) -> u256 {
    let mut n = n;
    let mut count = 0;
    loop {
        if n == 0 {
            break count;
        }
        n = n & (n - 1);
        count += 1;
    }
}

fn leaf_index_to_mmr_index(n: u256) -> u256 {
    2 * n - 1 - count_ones(n - 1)
}

fn prepare_mmr() -> MMR {
    // An MMR containing { 1, 2, 4, 5, 8 } as number with Starknet Poseidon as a hasher.
    let mut mmr: MMR = Default::default();
    mmr.append(1, ArrayTrait::new().span()).unwrap();

    let mut peaks = ArrayTrait::new();
    peaks.append(1);
    mmr.append(2, peaks.span()).unwrap();

    let mut peaks_2 = ArrayTrait::new();
    peaks_2.append(0x5d44a3decb2b2e0cc71071f7b802f45dd792d064f0fc7316c46514f70f9891a);
    mmr.append(4, peaks_2.span());

    peaks_2.append(4);
    mmr.append(5, peaks_2.span()).unwrap();

    let mut peaks_3 = ArrayTrait::new();
    peaks_3.append(0x43c59debacab61e73dec9edd73da27738a8be14c1e123bb38f9634220323c4f);
    mmr.append(8, peaks_3.span()).unwrap();

    mmr
}

fn inner_test_reindex_batch(
    remapper_dispatcher: ITimestampRemappersDispatcher, mapper_id: usize, mmr_id: usize
) {
    let header = array![
        0x7323c119a02202f9,
        0xccd4b52272cda25d,
        0xfefc2ee430bbac4e,
        0x3aed19aa3c70ccbe,
        0x4dcc1da066dfa755,
        0xb585ab7a5dc7dee8,
        0x4512d31ad4ccb667,
        0x42a1f013748a941b,
        0x2638944793d440fd,
        0x19f1dc688dbd9c53,
        0x8c27b45745990be8,
        0x97689a3cc1a09fec,
        0x9073868ef5a2ade4,
        0x5ef16f749af03962,
        0x6692bf0d4a26fc2a,
        0xdd0f4a03a0a88872,
        0x5bd277967ae6c483,
        0x3ef8be67e971a2cb,
        0x9b9564c19dc47126,
        0x2456dfa0f6755ce0,
        0xdd0a1dad38723f9a,
        0x3a6ed7151d0cc191,
        0xc9ede0c742e1461c,
        0x1b925be8c24e3,
        0x4d5061414200200a,
        0xb0801385000c5000,
        0x1042403002400860,
        0x101401ac1202212b,
        0x4200400000003ac0,
        0x8402040108890a00,
        0x20501000018260,
        0x2026a4821c1e9286,
        0x1821705d60404100,
        0xa282240408120048,
        0x2220064300c41100,
        0xa188849040c00380,
        0xe0a21600a20480,
        0xd814a02c905000,
        0x1280104880880,
        0xc2c84251c43608,
        0xa41021264281203,
        0x8a00000800024810,
        0xc17062801004030,
        0x410421055010120,
        0x1030055500000ea,
        0x224608b8160000c0,
        0x822185a0418a0684,
        0x200240024038005,
        0x888c3080b2503481,
        0x1445320501210205,
        0x1000180060400a04,
        0x610228a0280102,
        0x21012000201d1010,
        0x1010004004016690,
        0x4902190140280000,
        0x94088081480a0890,
        0xc90184cf4e8d8380,
        0x64846b2a578380c3,
        0xc761b4a08014839d,
        0xa40be52ef2ec0fbd,
        0xbb6931a97c5bad22,
        0xe6da9e1c6bb3fbca,
        0x88bae3bf8ebc,
        0x5985000000000000,
        0xeaacf6a0a53c8e7a,
        0x6a22557c83d50e43,
        0xd8a510354f5c2ac,
        0xcd5e2af22ae57ff1,
        0xe77e2bad58
    ];
    let header2 = array![
        0x434f4ebaa03b02f9,
        0x669f32e8c6170f4a,
        0x12fdb1e3005c5c6c,
        0x6c82bec3ce4ec14c,
        0x4dcc1da0695a1b19,
        0xb585ab7a5dc7dee8,
        0x4512d31ad4ccb667,
        0x42a1f013748a941b,
        0x5e45944793d440fd,
        0xf4ce6cbc6984a15a,
        0xa387c56656649495,
        0x24b776f622a01ba7,
        0x7406988cc3537bdc,
        0x3fda350a00448ff0,
        0x3cef8d662b47ca7b,
        0x856c7596a0de4072,
        0x674755b4983e01cf,
        0x64ebd1decccf45dd,
        0xbd66319c1ec10673,
        0xee2d08a02420ec1c,
        0xb9ce501b8db455e8,
        0xca6f0345cac3c8b3,
        0x732a59d86a87417b,
        0x1b9a049e5eb98,
        0x908334260020309,
        0x6042151120012060,
        0x800040845820aa02,
        0x904038812000561,
        0x4a2028092020a040,
        0x6a30084300008008,
        0xd88e000240802100,
        0x882234020c0b0030,
        0xc401301e00400382,
        0x8001a5802a20028a,
        0xa0006b9c31a409e0,
        0x90a9088000800c4,
        0x4002228201900140,
        0x9a81c088046130,
        0x425380102094424,
        0x474006001880e008,
        0xa6186502101022f,
        0x821048800048602b,
        0x8423400c01020080,
        0x68400af704002405,
        0x508000010014a8a,
        0x1030a78c0000802,
        0x22165a201020028,
        0x204212806800415,
        0x12060140e3403281,
        0x100020108240a10,
        0xa8820421000a08,
        0x60430ca201090a,
        0x4502200410001200,
        0x8048402008002000,
        0x5122182809001080,
        0x802201988000002,
        0xc90184d04e8d8380,
        0x64843ddac28380c3,
        0xb0183d89920839d,
        0x6788687465678406,
        0x85332e30322e316f,
        0xc92ca078756e696c,
        0xb2b27dc3b6649557,
        0x2febefe311a9d018,
        0x58dc9721e0ba68c6,
        0x88ea0caf56c365,
        0x8500000000000000,
        0x719fa04293ae8d52,
        0xa867700bc54d1fba,
        0xabf5b31bcee4e99d,
        0x7f696abc6fbec48b,
        0x1182f859a9e8
    ];
    let header3 = array![
        0xd1671c9aa03c02f9,
        0x2999828d10e10359,
        0xd8cf2035f37a8e,
        0xde3530619648ed71,
        0x4dcc1da072bf195d,
        0xb585ab7a5dc7dee8,
        0x4512d31ad4ccb667,
        0x42a1f013748a941b,
        0xe2c6944793d440fd,
        0x6dca7ce2bf919945,
        0xe4a123da352f7286,
        0x930b50732ba097cb,
        0x16a756cdcd205d78,
        0x60efc134f4101277,
        0x733c1d6ba2c4486d,
        0x776413bea03692dc,
        0xfa9a481a4067ddc8,
        0x9c7c02984430a7f6,
        0x13e0a2ab93e9c8c4,
        0xe7aa8fa0746731d0,
        0x41672ccbc9543913,
        0x1ee886f7e96d100b,
        0xf709922f95156b2a,
        0x1b9f09e147a1a,
        0xd1062595402300d,
        0xa400119000007004,
        0x13840a100030040,
        0x1d040180120085f3,
        0x6303312100407604,
        0xad00ac49b8050285,
        0xd20088140048b8,
        0x202228860c166124,
        0x5400408c6a41575e,
        0x2102002228c10442,
        0x2028425b60001904,
        0x1d89249000800885,
        0xc174a242c080a040,
        0x81080ae844020,
        0x4005380586400400,
        0x4632000638482401,
        0xa4504707830a601,
        0x80a80020404a4002,
        0xcec22408c1400488,
        0x508251400520a1,
        0x110104301c20008a,
        0x2202143846050040,
        0x8a2505a021020082,
        0x612ba03c5099b85,
        0x8845404e6583491,
        0x445260501200a00,
        0x1504820411100806,
        0x72a1460c22682592,
        0x2028740a31301218,
        0x201220c244a13288,
        0x6a029809585c4580,
        0x1020000808a40030,
        0xc90184d14e8d8380,
        0x849a8fc4018480c3,
        0x183d89938839d64,
        0x886874656784050b,
        0x322e30322e316f67,
        0x9a078756e696c85,
        0x2dfe2f5a3fca6de3,
        0x81038a83115bf48a,
        0x433cbdc065ed74ba,
        0x88c6368bf1c90e91,
        0x0,
        0xea06bfaeb045185,
        0x5b902159c11a2411,
        0x894481adbf3d735b,
        0x24e4b350318e0569,
        0x8e3a7677ab931
    ];

    let peaks = array![
        0x3249306f7fbb958aa06bb53ecdc242d2e815ee4aab5580d71dacc6e457aaf37,
        0x394c5c4d3e563b16011ea60560422e88124953002686fe9c0043f404a40bf11
    ]
        .span();
    let origin_elements = array![
        OriginElement {
            tree_id: mmr_id,
            last_pos: 4,
            leaf_idx: 1,
            leaf_value: 0x3e3a0deca5bb29188d24cd6ead1aa6b312425db393386d034bacd71a2b8d27f, // poseidon_hash(hexRlp(9260751))
            inclusion_proof: array![
                0x447bad30928f8a9c6e35b1437e6327a354b174b828337762941c409ac6e7491
            ]
                .span(),
            peaks,
            header: header.span(),
        },
        OriginElement {
            tree_id: mmr_id,
            last_pos: 4,
            leaf_idx: 2,
            leaf_value: 0x447bad30928f8a9c6e35b1437e6327a354b174b828337762941c409ac6e7491, // poseidon_hash(hexRlp(9260752))
            inclusion_proof: array![
                0x3e3a0deca5bb29188d24cd6ead1aa6b312425db393386d034bacd71a2b8d27f
            ]
                .span(),
            peaks,
            header: header2.span(),
        },
        OriginElement {
            tree_id: mmr_id,
            last_pos: 4,
            leaf_idx: 4,
            leaf_value: 0x394c5c4d3e563b16011ea60560422e88124953002686fe9c0043f404a40bf11, // poseidon_hash(hexRlp(9260753))
            inclusion_proof: array![].span(),
            peaks,
            header: header3.span(),
        },
    ];
    remapper_dispatcher.reindex_batch(mapper_id, ArrayTrait::new().span(), origin_elements.span());
// From this point on, mapper_peaks has root 0x215ea4dbc30f0b14338d306f0035277c856c486126cd34966a82ead2a0a1c01 and 4 as elements count
}

#[test]
fn test_remappers() {
    let headers_store: ContractAddress = deploy_headers_store();
    let timestamp_remappers: ContractAddress = deploy_timestamp_remappers(headers_store);

    let remapper_dispatcher = ITimestampRemappersDispatcher {
        contract_address: timestamp_remappers
    };
    let start_block: u256 = 9260751; // Mainnet block
    let mapper_id = remapper_dispatcher.create_mapper(start_block);
    assert(mapper_id == 0, 'Invalid mapper id');

    // An MMR containing { 1, 2, 4, 5, 8 } as string with Starknet Poseidon as a hasher.
    let mmr = prepare_mmr();
    inner_test_proof(@mmr);

    let headers_store_dispatcher = IHeadersStoreDispatcher { contract_address: headers_store };
    let mmr_id = 1; // First MMR

    start_prank(headers_store, 0.try_into().unwrap());
    headers_store_dispatcher
        .create_branch_from_message(
            0x25aedbc0ddea804ce21d29a39f00358f68df0e462114f75b0576182d08db0, 4, 1
        );
    stop_prank(headers_store);

    inner_test_reindex_batch(remapper_dispatcher, mapper_id, mmr_id);

    let peaks = array![
        0x5f97afc157cf05dd5414a752bce3ca2ecf9ce685ce3022f41659816c08af771, 1688044344
    ];
    let proofs = array![
        ProofElement { index: 2, value: 1688044320, proof: array![1688044308].span(), },
        ProofElement { index: 4, value: 1688044344, proof: array![].span(), }
    ];
    let tree = BinarySearchTree {
        mapper_id: mapper_id,
        last_pos: 4,
        peaks: peaks.span(),
        proofs: proofs.span(),
        left_neighbor: Option::Some(
            ProofElement { index: 4, value: 1688044344, proof: array![].span(), }
        )
    };
    let timestamp = 1688044344; // Element to find (exact match)
    let corresponding_block_number = remapper_dispatcher
        .get_closest_l1_block_number(tree, timestamp)
        .unwrap();
    assert(corresponding_block_number.unwrap() == start_block + 2, 'Unexpected block number');
    assert(
        remapper_dispatcher.get_last_mapper_timestamp(mapper_id) == timestamp,
        'Invalid mapper timestamp'
    );
}
