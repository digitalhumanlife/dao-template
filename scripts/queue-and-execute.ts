import {
    FUNC,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
    developmentChain,
    VOTING_PERIOD,
    MIN_DELAY,
} from "../helper-hardhat-config"
//@ts-ignore
import { ethers, network } from "hardhat"
import { moveBlocks } from "../utils/move-blocks"
import { moveTime } from "../utils/move-time"

export async function queueAndExecute() {
    const args = [NEW_STORE_VALUE]
    const box = await ethers.getContract("Box")
    const encodedFunctionCall = await box.interface.encodeFunctionData(FUNC, args)
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))
    const governor = await ethers.getContract("GovernorContract")
    console.log("Queueing proposal...")
    const queueTx = await governor.queue(
        [box.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    )
    await queueTx.wait(1)

    if (developmentChain.includes(network.name)) {
        await moveBlocks(1)
        await moveTime(MIN_DELAY + 1)
    }

    console.log("Executing proposal...")
    const executeTx = await governor.execute(
        [box.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    )
    await executeTx.wait(1)

    const boxNewValue = await box.retrieve()
    console.log("Box value after proposal execution: " + boxNewValue.toString())
}

queueAndExecute()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
