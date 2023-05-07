import * as fs from "fs"
import { developmentChain, proposalsFile, VOTING_PERIOD } from "../helper-hardhat-config"
//@ts-ignore
import { network, ethers } from "hardhat"
import { moveBlocks } from "../utils/move-blocks"

const index = 0

async function main(proposalIndex: number) {
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
    const proposalId = proposals[network.config.chainId!][proposalIndex]

    const voteWay = 1 // 1 for yes, 2 for no
    const governor = await ethers.getContract("GovernorContract")
    const reason = "I like a change"
    const voteTxResponse = await governor.castVoteWithReason(proposalId, voteWay, reason)
    await voteTxResponse.wait(1)

    if (developmentChain.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1)
    }
    console.log("Voted on proposal: " + proposalId)
}

main(index)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
