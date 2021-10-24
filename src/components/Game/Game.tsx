import React, { useState } from 'react';
import { allEqual, getIndicesArr } from '../../common/utils';
import { SquareType, Board } from '../Board';
import { AuthorDetails } from './Author';
import { MoveHistory } from './type';

/**
 * A helper function that calculate the winner by looping through the board (brute-force)
 * @dev Check winning condition of an element in 4 direction: | (vertical), — (horizontal),  / (diagnonal right) ,  \ (diagonal left)
 * @param board  board state at the moment
 * @param boardWitdth width of the board
 * @param numToWin Number consecutive 'O' or 'X' to win the game
 * @returns {[SquareType, number[]]} returns the array: [winner, winningMoves]. Null if the game is not finished
 */
const calculateWinner = (board: SquareType[], boardWitdth: number, numToWin: number): [SquareType, number[]] | null => {
  const temp = Array(numToWin).fill(null);
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) continue;
    // Check in Horizontal direction: [i, i+1, i+2, i+3, ...] AND they are on the same row
    const horizontalLine = temp.map((_, offset) => board[i + offset]);
    const rowNumbers = temp.map((_, offset) => Math.floor((i + offset) / boardWitdth));
    if (allEqual(rowNumbers) && allEqual(horizontalLine)) return [horizontalLine[0], temp.map((_, offset) => i + offset)];

    // Check in Vertical direction: [i, i+1*width, i+2*width, i+3*width, ...]
    const verticalLine = temp.map((_, offset) => board[i + offset * boardWitdth]);
    if (allEqual(verticalLine)) return [verticalLine[0], temp.map((_, offset) => i + offset * boardWitdth)];

    // Check in Left diagon direction ("\"): [i, i+1*(width+1), i+2*(width+1), i+3*(width+1), ...]
    const diagonalLeft = temp.map((_, offset) => board[i + offset * (boardWitdth + 1)]);
    if (allEqual(diagonalLeft)) return [diagonalLeft[0], temp.map((_, offset) => i + offset * (boardWitdth + 1))];

    // Check in Right diagon direction ("/"): [i, i+1*(width-1), i+2*(width-1), i+3*(width-1), ...] AND if they can form "/" direction
    const diagonalRight = temp.map((_, offset) => board[i + offset * (boardWitdth - 1)]);
    if (i % boardWitdth >= numToWin - 1 && allEqual(diagonalRight)) return [diagonalRight[0], temp.map((_, offset) => i + offset * (boardWitdth - 1))];
  }
  return null;
};

export const Game = () => {
  const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([null]);
  const [boardHistory, setBoardHistory] = useState<SquareType[][]>([Array(9).fill(null)]);
  const [stepNumber, setStepNumber] = useState<number>(0);
  const [isXTurn, setIsXTurn] = useState<boolean>(true);
  const [winner, setWinner] = useState<SquareType>(null);
  const [winningMoves, setWinningMoves] = useState<number[] | null>(null);
  const [isSortAsc, setSortAsc] = useState<boolean>(true);

  //EXTENSION:
  const [width, setwidth] = useState<number>(5);
  const [numToWin, setNumToWin] = useState<number>(5);

  /**
   * A callback whenever a player click on an square
   * @param i square index in the boardState
   */
  const handleClick = (i: number): void => {
    const newMoveHistory = moveHistory.slice(0, stepNumber + 1);
    const history = boardHistory.slice(0, stepNumber + 1);
    const squares = history[history.length - 1].slice();

    if (squares[i] || winner) return;
    squares[i] = isXTurn ? 'X' : 'O';

    const curWinner = calculateWinner(squares, width, numToWin);
    if (curWinner) {
      setWinner(curWinner[0]);
      setWinningMoves(curWinner[1]);
    }

    setMoveHistory([...newMoveHistory, { row: Math.floor(i / width), col: i % width }]);
    setBoardHistory([...history, [...squares]]);
    setStepNumber(history.length);
    setIsXTurn((xTurn) => !xTurn);
  };

  /**
   * Jump to step number
   * @param step Targeted step
   */
  const jumpTo = (step: number): void => {
    setStepNumber(step);
    setIsXTurn(step % 2 === 0);
    const curWinner = calculateWinner(boardHistory[step], width, numToWin);
    if (curWinner) {
      setWinner(curWinner[0]);
      setWinningMoves(curWinner[1]);
    } else {
      setWinner(null);
      setWinningMoves(null);
    }
  };

  /**
   * Reset the board state to the initial state
   */
  const resetBoard = () => {
    setMoveHistory([null]);
    setBoardHistory([Array(9).fill(null)]);
    setStepNumber(0);
    setIsXTurn(true);
    setWinner(null);
    setWinningMoves(null);
    setSortAsc(true);
  };

  /**
   * Render status text depending on internal state
   * @dev If the winner has been decided => return status text with the winner
   *      If the stepNumber reach maximum => Draw
   *      Otherwise return whose turn is next
   * @returns {JSX.Element}
   */
  const statusText = (): JSX.Element => {
    if (winner) return <p className={`status ${winner}`}>Winner: {winner}</p>;
    if (stepNumber === width * width) return <p className="status">DRAW!</p>;
    return <p className={`status ${isXTurn ? 'X' : 'O'}`}>Next player: {isXTurn ? 'X' : 'O'}</p>;
  };

  return (
    <div className="game">
      <div className="game-info">
        <AuthorDetails />
        <div className="config">
          <label htmlFor="gamesize">
            Board: ({width}x{width})
          </label>
          <input
            type="range"
            min="3"
            max="25"
            value={width}
            onChange={(ev) => {
              const value = Number(ev.target.value);
              setwidth(value);
              if (value < numToWin) setNumToWin(value);
              resetBoard();
            }}
          />
        </div>
        <div className="config">
          <label htmlFor="gamesize">Moves to win: {numToWin} </label>
          <input
            type="range"
            min="3"
            max={width > 5 ? 5 : width}
            value={numToWin}
            onChange={(ev) => {
              setNumToWin(Number(ev.target.value));
              resetBoard();
            }}
          />
        </div>

        <button onClick={() => setSortAsc((prev) => !prev)}>Sort: {isSortAsc ? 'DESC' : 'ASC'}</button>
        <button onClick={() => resetBoard()}>Reset</button>
        <ol>
          {getIndicesArr(moveHistory.length, isSortAsc) /** [1,2,3,4...] if isAsc==true */
            .map((index) => {
              return (
                <li key={index}>
                  <button className={`move-history ${index % 2 === 0 ? 'X' : 'O'} ${index === stepNumber && 'active'}`} onClick={() => jumpTo(index)}>
                    {index === 0 ? 'Go to game start' : `Go to move #${index} (col: ${moveHistory[index]?.col}, row: ${moveHistory[index]?.row})`}
                  </button>
                </li>
              );
            })}
        </ol>
      </div>

      <div className="game-board">
        {statusText()}
        <Board boardState={boardHistory[stepNumber]} width={width} height={width} onSquareClicked={handleClick} winningMoves={winningMoves} />
      </div>
    </div>
  );
};
