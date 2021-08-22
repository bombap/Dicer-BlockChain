// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Ownable.sol";
import "./SafeMath.sol";

contract Banking is Ownable {
    using SafeMath for *;
    
    uint public totalPoint; // Actual number of points between player and banking
    uint public pricePerPoint; // for 1 eth | using finney
    uint private Treasury; // Liquidity of points
    uint private profitStake; // profit rate when staking
    // uint private countStake;
    
    event Deposit(address _from, uint _point);
    event Stake(address _from, uint _point);
    event Withdraw(address _from, uint _point, uint _eth);
    event Transfer(address _from, address _to, uint _point);
    
    constructor() {
        Treasury = 0;
        totalPoint = 0;
        pricePerPoint = 1000; // using finney
        // profitStake = 80;
    }
    
    struct Player {
        uint point;
        uint totalWon;
        uint totalPlayed;
        uint lastGameId;
    }
    
    
    mapping (address => Player) internal players;
    mapping (address => uint) private shareholder;
    
    // Check Balance Point
    modifier checkPoint(uint _point) {
        require(_point <= players[msg.sender].point, "Insufficient Point");
        _;
    }
    
    modifier checkBudget(uint _point) {
        require(_point <= Treasury, "The Bank Insufficient Point");
        _;
    }
    
    
    // update profitStake
    // only Owner
    function updateProfitStake(uint _profit) public onlyOwner {
        require(_profit >= 20 && _profit <= 100);
        profitStake = _profit;
    }
    
    // get Player
    function getPlayer(address _player) public view returns (Player memory) {
        return players[_player];
    }
    
    // get balance ETH of contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
    
    // Deposit ETH get Point
    // Minimum 0.001 ETH = 1 Point
    function deposit() public payable {
        require(msg.value >= 0.001 ether, "Minium Deposit 0.001 ETH");
        uint point = msg.value.mul(pricePerPoint).div(1 ether);
        Treasury = Treasury.add(point);
        totalPoint = totalPoint.add(point * 2);
        players[msg.sender].point = players[msg.sender].point.add(point);
        emit Deposit(msg.sender, point);
    }
    
    
    // function stake() public payable {
    //     require(msg.value >= 0.001 ether, "Minium Stake 0.001 ETH");
    //     uint point = msg.value.mul(pricePerPoint).div(1 ether);
    //     Treasury = Treasury.add(point);
    //     shareholder[msg.sender] = shareholder[msg.sender].add(point);
    //     countStake++;
    // }
    
    // Using Point get ETH
    // Minimum withdraw = 100 Points
    // 
    function withdraw(uint _point) public checkPoint(_point) checkBudget(_point) {
        require(_point >= 100, "Minimum Withdraw 100 Points");
        uint amount = _point.mul(1 ether).div(pricePerPoint); // compute real ETH amount
        require(getBalance() >= amount, "Insufficient Liquidity");
        Treasury = Treasury.sub(_point);
        totalPoint = totalPoint.sub(_point / 2);
        players[msg.sender].point = players[msg.sender].point.sub(_point);
        payable(msg.sender).transfer(amount);
        emit Withdraw(msg.sender, _point, amount);
    }
    
    // Send Point From Address to Address
    function sendPoint(address _to, uint _point) public checkPoint(_point) {
        require(_point >= 1, "Minimum Transfer 1 Point");
        players[msg.sender].point = players[msg.sender].point.sub(_point);
        players[_to].point = players[_to].point.add(_point);
        emit Transfer(msg.sender, _to, _point);
    }
    
}
