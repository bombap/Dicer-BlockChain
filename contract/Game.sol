// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Banker.sol";
import "./SafeMath.sol";

contract Game is Banking {
    using SafeMath for *;
    
    uint private gameRange = 14;
    uint private gameNonce;
    uint[] private gameList;
    
    constructor() {
        gameNonce = 1;
    }
    
    struct GameTransaction {
        address player;
        uint point;
        uint seed;
        uint spin;
        bool won;
    }
    
    event PlayGame(address _from, uint _point, uint _seed, bool _won);
    
    mapping (uint => GameTransaction) private gameHistories;
    
    modifier checkLottery(uint _lottery) {
        require(_lottery >= 0 && _lottery <= gameRange, "Wrong format of lottery ticket");
        _;
    }
    
    modifier ruleBet(uint _point, uint _seed) {
        require(_seed == 0 || _seed == 1 || _seed == 2, "Wrong Bet Type");
        require(_point > 0, "Required greater than 0");
        _;
    }
    
    function gameHistory(uint _gameId) public view returns (GameTransaction memory) {
        return gameHistories[_gameId];
    }
    
    function last20Game() public view returns (GameTransaction[] memory) {
        uint count = 0;
        GameTransaction[] memory listGameId = new GameTransaction[](20);
        for (uint i = gameList.length; i > 0; i--) {
            if(count == 20) {
                break;
            }
            listGameId[count] = gameHistories[gameList[i - 1]];
            count++;
        }
        return listGameId;
    }
    
    // Just for fun ! No security required.
    // @author: Thank for JUST.BET.
    function getRandom(uint _gameRange) public view returns (uint) {
        uint randNum = uint(
                keccak256(
                    abi.encodePacked(
                        gameNonce + 
                        block.timestamp +
                            block.difficulty +
                            uint256(keccak256(abi.encodePacked(block.coinbase)))
                    )
                )
            ) % _gameRange;
        return randNum;
    }
    
    function _createGameId() private view returns (uint) {
        return uint(gameNonce * 1e6 + getRandom(1e5));
    }
    
    function _processGame(uint _seed) private view returns (bool, uint) {
        uint lottery = getRandom(gameRange);
        if(_seed == lottery) return (true, lottery);
        else if (_seed == 1 && lottery <= 7) return (true, lottery);
        else if (_seed == 2 && lottery >= 8) return (true, lottery);
        else return (false, lottery);
    }
    
    function _payStation(bool _won, uint _point) private {
        if(_won) {
            totalPoint = totalPoint.sub(_point);
            players[msg.sender].point = players[msg.sender].point.add(_point);
            players[msg.sender].totalWon = players[msg.sender].totalWon.add(1);
        } else {
            totalPoint = totalPoint.add(_point);
            players[msg.sender].point = players[msg.sender].point.sub(_point);
        }
    }
    
    function betGame(uint _point, uint _seed) public ruleBet(_point, _seed) {
        gameNonce = gameNonce.add(1);
        uint gameId = _createGameId();
        (bool won, uint lottery) = _processGame(_seed);
        if(won && _seed == 0) {
            _payStation(won, _point * 13);
        } else {
            _payStation(won, _point);
        }
        players[msg.sender].lastGameId = gameId;
        players[msg.sender].totalPlayed = players[msg.sender].totalPlayed.add(1);
        gameList.push(gameId);
        gameHistories[gameId] = GameTransaction({player: msg.sender, point: _point, seed: _seed, spin: lottery, won: won});
        emit PlayGame(msg.sender, _point, _seed, won);
    }
}