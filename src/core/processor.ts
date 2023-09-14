import {EvmBatchProcessor, EvmBatchProcessorFields, BlockHeader, Log as _Log, Transaction as _Transaction} from '@subsquid/evm-processor'
import {KnownArchivesEVM, lookupArchive} from '@subsquid/archive-registry'
import * as poolAbi from '../abi/pool'
import * as positionManagerAbi from '../abi/positionManager'
import { chainId } from '../utils/chain'
import { poolAddressesOfInterest, poolsOfInterest } from '../pools'

const POOL_FACTORY_ADDRESS = '0x1f98431c8ad98523631ae4a59f267346ea31f984'
const POSITION_MANAGER_ADDRESS = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'

const lowestBlock: number = poolsOfInterest().reduce((acc, pool) => Math.min(acc, pool.deployedAtBlock), Number.MAX_SAFE_INTEGER)

const networkName = (): KnownArchivesEVM => {
    switch(chainId()){
        case 1: return 'eth-mainnet'
        case 42161: return 'arbitrum'
        default: throw new Error('Unknown network!')
    }
}

export const processor = new EvmBatchProcessor()
    .setDataSource({
        archive: lookupArchive(networkName(), {type: 'EVM'}),
        // chain: process.env.ARB_RPC_ENDPOINT
    })
    .setFields({
            log: {
                topics: true,
                data: true,
                transactionHash: true,
            },
            transaction: {
                hash: true,
                input: true,
                from: true,
                value: true,
                to: true,
                chainId: true,
                gasUsed: true,
                status: true,
                contractAddress: true,
        }
    })
    .setFinalityConfirmation(10)
    .addLog({
        address: poolAddressesOfInterest,
        topic0: [
            poolAbi.events['Swap'].topic,
            poolAbi.events['Burn'].topic,
            poolAbi.events['Collect'].topic,
        ],
        transaction: true,
        range: {
            from: lowestBlock,
        },
    })
    .addLog({
        address: [POSITION_MANAGER_ADDRESS],
        topic0: [
            positionManagerAbi.events['IncreaseLiquidity'].topic,
            positionManagerAbi.events['DecreaseLiquidity'].topic,
            positionManagerAbi.events['Collect'].topic,
            positionManagerAbi.events['Transfer'].topic,
        ],
        transaction: true,
        range: {
            from: lowestBlock,
        },
    })
    .addTransaction({
        to: [POSITION_MANAGER_ADDRESS],
        sighash: [
            positionManagerAbi.functions['burn'].sighash,
            positionManagerAbi.functions['mint'].sighash,
        ],
        range: {
            from: lowestBlock,
        },
    })

export type Fields = EvmBatchProcessorFields<typeof processor>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type BlockTransaction = _Transaction<Fields>