const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PredictionMarket", function () {
    let PredictionMarket;
    let market;
    let owner;
    let addr1;
    let addr2;
    const question = "Will Monad reach Mainnet by Q1 2026?";
    const duration = 60 * 60 * 24; // 1 day

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        PredictionMarket = await ethers.getContractFactory("PredictionMarket");
        market = await PredictionMarket.deploy(question, duration);
    });

    it("Should set the correct question and endTime", async function () {
        const marketState = await market.market();
        expect(marketState.question).to.equal(question);
        expect(marketState.endTime).to.be.above(await time.latest());
    });

    it("Should allow users to place YES bets", async function () {
        const betAmount = ethers.parseEther("1");
        await market.connect(addr1).placeBet(true, { value: betAmount });

        const marketState = await market.market();
        expect(marketState.totalYesPool).to.equal(betAmount);

        const userBet = await market.bets(addr1.address);
        expect(userBet.yesAmount).to.equal(betAmount);
    });

    it("Should allow users to place NO bets", async function () {
        const betAmount = ethers.parseEther("0.5");
        await market.connect(addr2).placeBet(false, { value: betAmount });

        const marketState = await market.market();
        expect(marketState.totalNoPool).to.equal(betAmount);

        const userBet = await market.bets(addr2.address);
        expect(userBet.noAmount).to.equal(betAmount);
    });

    it("Should resolve the market correctly by owner", async function () {
        await time.increase(duration + 1);
        await market.resolveMarket(true);

        const marketState = await market.market();
        expect(marketState.resolved).to.be.true;
        expect(marketState.outcome).to.be.true;
    });

    it("Should allow winners to claim winnings", async function () {
        const betAmount = ethers.parseEther("1");
        await market.connect(addr1).placeBet(true, { value: betAmount });
        await market.connect(addr2).placeBet(false, { value: betAmount });

        await time.increase(duration + 1);
        await market.resolveMarket(true); // YES wins

        const initialBalance = await ethers.provider.getBalance(addr1.address);
        await market.connect(addr1).claimWinnings();
        const finalBalance = await ethers.provider.getBalance(addr1.address);

        expect(finalBalance).to.be.above(initialBalance + ethers.parseEther("1.9"));
    });
});
