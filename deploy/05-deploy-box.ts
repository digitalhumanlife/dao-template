import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
//@ts-ignore
import { ethers } from "hardhat"

const deployBox: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    //@ts-ignore
    const { deployments, getNamedAccounts } = hre
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    log("Deploying Box...")

    await deploy("Box", {
        from: deployer,
        args: [],
        log: true,
    })
    const timeLock = await get("TimeLock")
    //const boxContract = await get("Box")
    const boxContractComp = await ethers.getContract("Box")
    //console.log("boxContract", boxContract)
    //console.log("boxContract1", boxContractComp)
    const transferOwnershipTx = await boxContractComp.transferOwnership(timeLock.address)

    await transferOwnershipTx.wait(1)
    log("Box deployed!")
}

export default deployBox
