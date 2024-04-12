import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

describe("Racecar", function() {

  async function deployFixture() {

    const [deployer, racecar1] = await ethers.getSigners();

    const Racecar = await ethers.getContractFactory("Racecar");
    const racecar = await Racecar.deploy();
    await racecar.waitForDeployment();
    const nftAddress = await racecar.getAddress()
    console.log('NFT', nftAddress)


    return { deployer, racecar1, racecar };
  }

})


