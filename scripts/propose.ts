import {
    NEW_STORE_VALUE,
    FUNC,
    PROPOSAL_DESCRIPTION,
    developmentChain,
    VOTING_DELAY,
    proposalsFile,
} from "../helper-hardhat-config"
import { moveBlocks } from "../utils/move-blocks"
//@ts-ignore
import { ethers, network } from "hardhat"
import * as fs from "fs"

export async function propose(args: any[], functionToCall: string, proposalDesc: string) {
    const governor = await ethers.getContract("GovernorContract")
    const box = await ethers.getContract("Box")
    console.log("Contracts got: " + box.address)

    //const encodedFunctionCall = await box.interface.encodeFunctionData(functionToCall, args)
    const encodedFunctionCall = await box.interface.encodeFunctionData(functionToCall, args)
    console.log("encoding done")
    console.log(encodedFunctionCall)

    console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`)
    console.log(`Description: \n ${proposalDesc} `)
    const proposalTx = await governor.propose(
        // address[] memory targets,
        // uint256[] memory values,
        // bytes[] memory calldatas,
        // string memory description
        [box.address],
        [0],
        [encodedFunctionCall],
        proposalDesc
    )
    const proposalReceipt = await proposalTx.wait(1)

    if (developmentChain.includes(network.name)) {
        await moveBlocks(VOTING_DELAY + 1)
    }

    const proposalId = proposalReceipt.events[0].args.proposalId
    // how to see deadline, what snapshot looks like: check out Patrick's github
    let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))

    if (!proposals[network.config.chainId!.toString()]) {
        proposals[network.config.chainId!.toString()] = []
    }

    console.log("proposals: " + proposals)
    proposals[network.config.chainId!.toString()].push(proposalId.toString())
    fs.writeFileSync(proposalsFile, JSON.stringify(proposals))
}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
