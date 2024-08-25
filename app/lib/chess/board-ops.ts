import assert from "assert";

/**
 * Represent a chessboard, where empty squares are 0, black pieces are negative (-1=pawn, -2=rook, -3=knight, -4=bishop, -5=queen, -6=king)
 * and white pieces are positive
 */
enum Player {
    White = 1,
    Black = -1,
}

export class ChessBoard {
    private board: number[][];
    private currentTurn: Player;
    private inCheck: Map<Player, boolean>;
    private kings: Map<Player, [number, number]>;

    constructor() {
        this.board = [
            [-2, -3, -4, -5, -6, -4, -3, -2],
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [2, 3, 4, 5, 6, 4, 3, 2],
        ];
        this.currentTurn = Player.White;
        this.inCheck = new Map<Player, boolean>([
            [Player.Black, false],
            [Player.White, false],
        ]);
        this.kings = new Map<Player, [number, number]>([
            [Player.Black, [0, 4]],
            [Player.White, [7, 4]],
        ]);
    }

    private withinBounds(pos: [number, number]) {
        return 0 <= pos[0] && pos[0] <= 7 && 0 <= pos[1] && pos[1] <= 7;
    }

    /**
     * given two points that are either on the same horizontal, vertical, or diagonal
     * @param startPos
     * @param endPos
     */
    private isPathClear(
        startPos: [number, number],
        endPos: [number, number]
    ): boolean {
        if (startPos[0] === endPos[0]) {
            const row = startPos[0];
            const start = Math.min(startPos[1], endPos[1]);
            const end = Math.max(startPos[1], endPos[1]);
            for (let i = start + 1; i < end; i++) {
                if (this.board[row][i] !== 0) {
                    return false;
                }
            }
            return true;
        } else if (startPos[1] === endPos[1]) {
            const col = startPos[1];
            const start = Math.min(startPos[0], endPos[0]);
            const end = Math.max(startPos[0], endPos[0]);
            for (let i = start + 1; i < end; i++) {
                if (this.board[i][col] !== 0) {
                    return false;
                }
            }
            return true;
        } else if (
            Math.abs(startPos[1] - endPos[1]) ===
            Math.abs(startPos[1] - endPos[1])
        ) {
            //diagonal case. Split into positive diagonal, where one point is bigger in both dims, or negative diagonal, where different
            if (
                Math.sign(startPos[0] - endPos[0]) ===
                Math.sign(startPos[1] - endPos[1])
            ) {
                const startRow = Math.min(startPos[0], endPos[0]);
                const startCol = Math.min(startPos[1], endPos[1]);
                const endRow = Math.max(startPos[0], endPos[0]);
                const spaceBetween = endRow - startRow;
                for (let i = 1; i < spaceBetween; i++) {
                    if (this.board[startRow + i][startCol + i] !== 0) {
                        return false;
                    }
                }
                return true;
            } else {
                const startRow = Math.min(startPos[0], endPos[0]);
                const startCol = Math.max(startPos[1], endPos[1]);
                const endRow = Math.max(startPos[0], endPos[0]);
                const spaceBetween = endRow - startRow;
                for (let i = 1; i < spaceBetween; i++) {
                    if (this.board[startRow + i][startCol - i] !== 0) {
                        return false;
                    }
                }
                return true;
            }
        } else {
            throw new Error(
                "isPathClear was called with points that are not horizontal, vertical, or diagonal"
            );
        }
    }

    private isKnightPath(
        startPos: [number, number],
        endPos: [number, number]
    ): boolean {
        const rowDiff = Math.abs(startPos[0] - endPos[0]);
        const colDiff = Math.abs(startPos[1] - endPos[1]);
        return (
            Math.max(rowDiff, colDiff) == 2 && Math.min(rowDiff, colDiff) == 1
        );
    }

    private isOneApart(
        startPos: [number, number],
        endPos: [number, number]
    ): boolean {
        const rowDiff = Math.abs(startPos[0] - endPos[0]);
        const colDiff = Math.abs(startPos[1] - endPos[1]);
        return Math.max(rowDiff, colDiff) === 1;
    }

    private farEnoughFromOtherKing(
        startPos: [number, number],
        endPos: [number, number]
    ): boolean {
        const otherKing = -this.board[startPos[0]][startPos[1]];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (
                    this.withinBounds([endPos[0] + i, endPos[1] + j]) &&
                    this.board[endPos[0] + i][endPos[1] + j] === otherKing
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * helper for isInCheck. Takes a function that generates a next position
     */
    private checkStraightPath(
        king: number,
        startPos: [number, number],
        func: (start: [number, number]) => [number, number]
    ): boolean {
        let pos = func(startPos);
        while (this.withinBounds(pos)) {
            const otherPiece = this.board[pos[0]][pos[1]];
            //if we run into the same color piece, break
            if (Math.sign(otherPiece) === Math.sign(king)) {
                break;
            }
            //if we run into a different color piece, check if that piece is a rook or queen. If it is, return true. else, break
            else if (
                otherPiece !== 0 &&
                Math.sign(otherPiece) !== Math.sign(king)
            ) {
                if (Math.abs(otherPiece) === 2 || Math.abs(otherPiece) === 5) {
                    return true;
                } else {
                    break;
                }
            }
            pos = func(pos);
        }
        return false;
    }

    /**
     * helper for isInCheck. Takes a function that generates a next position
     */
    private checkDiagonalPath(
        king: number,
        startPos: [number, number],
        func: (start: [number, number]) => [number, number]
    ): boolean {
        let pos = func(startPos);
        while (this.withinBounds(pos)) {
            const otherPiece = this.board[pos[0]][pos[1]];
            //if we run into the same color piece, break
            if (Math.sign(otherPiece) === Math.sign(king)) {
                break;
            }
            //if we run into a different color piece, check if that piece is a bishop or queen. If it is, return true. else if the piece is a pawn and is one away from start pos, return true. else, break
            else if (
                otherPiece !== 0 &&
                Math.sign(otherPiece) !== Math.sign(king)
            ) {
                if (Math.abs(otherPiece) === 4 || Math.abs(otherPiece) === 5) {
                    return true;
                } else if (
                    Math.abs(otherPiece) === 1 &&
                    Math.abs(pos[0] - startPos[0]) === 1
                ) {
                    return true;
                } else {
                    break;
                }
            }
            pos = func(pos);
        }
        return false;
    }

    /**
     * checks whether player is in check
     * @param player
     * @returns
     */
    private isInCheck(player: Player): boolean {
        const pos = this.kings.get(player);
        assert(pos !== undefined);
        const [row, col] = pos;
        const king = this.board[row][col];

        //check possible knight positions
        const possibleKnightDistances = [
            [1, 2],
            [2, 1],
            [1, -2],
            [-2, 1],
            [-1, 2],
            [2, -1],
            [-1, -2],
            [-2, -1],
        ];
        //check above
        for (const distance of possibleKnightDistances) {
            const knightPos: [number, number] = [
                pos[0] + distance[0],
                pos[1] + distance[1],
            ];
            if (this.withinBounds(knightPos)) {
                const knight = this.board[knightPos[0]][knightPos[1]];
                if (
                    Math.abs(knight) === 3 &&
                    Math.sign(knight) !== Math.sign(king)
                ) {
                    return true;
                }
            }
        }
        const fromAbove = this.checkStraightPath(
            king,
            pos,
            (start: [number, number]) => [start[0] - 1, start[1]]
        );
        if (fromAbove) {
            return true;
        }
        //check below
        const fromBelow = this.checkStraightPath(
            king,
            pos,
            (start: [number, number]) => [start[0] + 1, start[1]]
        );
        if (fromBelow) {
            return true;
        }
        //check to the left
        const fromLeft = this.checkStraightPath(
            king,
            pos,
            (start: [number, number]) => [start[0], start[1] - 1]
        );
        if (fromLeft) {
            return true;
        }
        //check to the right
        const fromRight = this.checkStraightPath(
            king,
            pos,
            (start: [number, number]) => [start[0], start[1] + 1]
        );
        if (fromRight) {
            return true;
        }
        //check above left
        const fromAboveLeft = this.checkDiagonalPath(
            king,
            pos,
            (start: [number, number]) => [start[0] - 1, start[1] - 1]
        );
        if (fromAboveLeft) {
            return true;
        }
        //check above right
        const fromAboveRight = this.checkDiagonalPath(
            king,
            pos,
            (start: [number, number]) => [start[0] - 1, start[1] + 1]
        );
        if (fromAboveRight) {
            return true;
        }
        //check below right
        const fromBelowRight = this.checkDiagonalPath(
            king,
            pos,
            (start: [number, number]) => [start[0] + 1, start[1] + 1]
        );
        if (fromBelowRight) {
            return true;
        }
        //check below left
        const fromBelowLeft = this.checkDiagonalPath(
            king,
            pos,
            (start: [number, number]) => [start[0] + 1, start[1] - 1]
        );
        if (fromBelowLeft) {
            return true;
        }

        return false;
    }

    /**
     * helper function that mutates the board to execute a turn and throws an error if the turn cannot be done by the rules of chess
     * @param startPos
     * @param endPos
     */
    private moveHelper(
        startPos: [number, number],
        endPos: [number, number]
    ): void {
        //TODO: impliment check logic. can do this efficiently by keeping track of both kings' positions in the rep, then after every move, looking at all 8 posible lines (start from the king, go until you hit a piece) to a king and all 8 possible knight positions.
        //TODO: impliment checkmate logic. First look if the king can move to a position where it is not in check (this should cover the case where it takes the piece putting it in check without special logic).
        //          If it can't move, determine how many pieces are putting it in check. If its more than one, declare checkmate.
        //                  if only one piece, look if another piece could take the piece putting it in check, then simulate this move and see if the king is still in check (remember to undo mutation).
        //                  If that doesn't work, determine if any pieces could move to block.
        //                  if not, declare checkmate.
        const piece = Math.abs(this.board[startPos[0]][startPos[1]]);
        const originalEnd = this.board[endPos[0]][endPos[1]];
        const originalKings = new Map(this.kings);
        const originalInCheck = new Map(this.inCheck);

        //pawn
        if (piece == 1) {
            //must move up the board
            if (this.currentTurn === Player.White) {
                if (
                    startPos[0] === endPos[0] - 1 &&
                    startPos[1] === endPos[1] &&
                    this.board[endPos[0]][endPos[1]] === 0
                ) {
                    this.board[endPos[0]][endPos[1]] =
                        this.board[startPos[0]][startPos[1]];
                    this.board[startPos[0]][startPos[1]] = 0;
                    //TODO: Implement pawn promotion logic
                } else if (
                    startPos[0] === endPos[0] - 1 &&
                    Math.abs(startPos[1] - endPos[1]) === 1
                ) {
                    this.board[endPos[0]][endPos[1]] =
                        this.board[startPos[0]][startPos[1]];
                    this.board[startPos[0]][startPos[1]] = 0;
                    //TODO: Implement pawn promotion logic
                } else {
                    throw new Error(`invalid move for pawn at ${startPos}`);
                }
            }
            //must move down the board
            else {
                if (
                    startPos[0] === endPos[0] + 1 &&
                    startPos[1] === endPos[1] &&
                    this.board[endPos[0]][endPos[1]] === 0
                ) {
                    this.board[endPos[0]][endPos[1]] =
                        this.board[startPos[0]][startPos[1]];
                    this.board[startPos[0]][startPos[1]] = 0;
                    //TODO: Implement pawn promotion logic
                } else if (
                    startPos[0] === endPos[0] + 1 &&
                    Math.abs(startPos[1] - endPos[1]) === 1
                ) {
                    this.board[endPos[0]][endPos[1]] =
                        this.board[startPos[0]][startPos[1]];
                    this.board[startPos[0]][startPos[1]] = 0;
                    //TODO: Implement pawn promotion logic
                } else {
                    throw new Error(`invalid move for pawn at ${startPos}`);
                }
            }
        }

        //rook
        else if (piece == 2) {
            if (
                (startPos[1] === endPos[1] || startPos[0] === endPos[0]) &&
                this.isPathClear(startPos, endPos)
            ) {
                this.board[endPos[0]][endPos[1]] =
                    this.board[startPos[0]][startPos[1]];
                this.board[startPos[0]][startPos[1]] = 0;
            } else {
                throw new Error(
                    `invalid move for rook at position ${startPos}`
                );
            }
        }

        //knight
        else if (piece == 3) {
            if (this.isKnightPath(startPos, endPos)) {
                this.board[endPos[0]][endPos[1]] =
                    this.board[startPos[0]][startPos[1]];
                this.board[startPos[0]][startPos[1]] = 0;
            } else {
                throw new Error(
                    `invalid move for knight at position ${startPos}`
                );
            }
        }

        //bishop
        else if (piece == 4) {
            if (
                Math.abs(startPos[1] - endPos[1]) ===
                    Math.abs(startPos[1] - endPos[1]) &&
                this.isPathClear(startPos, endPos)
            ) {
                this.board[endPos[0]][endPos[1]] =
                    this.board[startPos[0]][startPos[1]];
                this.board[startPos[0]][startPos[1]] = 0;
            } else {
                throw new Error(
                    `invalid move for bishop at position ${startPos}`
                );
            }
        }

        //queen
        else if (piece == 5) {
            if (this.isPathClear(startPos, endPos)) {
                this.board[endPos[0]][endPos[1]] =
                    this.board[startPos[0]][startPos[1]];
                this.board[startPos[0]][startPos[1]] = 0;
            } else {
                throw new Error(
                    `invalid move for queen at position ${startPos}`
                );
            }
        }

        //king
        else if (piece == 6) {
            if (
                this.isOneApart(startPos, endPos) &&
                this.farEnoughFromOtherKing(startPos, endPos)
            ) {
                this.board[endPos[0]][endPos[1]] =
                    this.board[startPos[0]][startPos[1]];
                this.board[startPos[0]][startPos[1]] = 0;
                //maintain where the kings are
                this.kings.set(this.currentTurn, endPos);
            }
        }

        //your turn put the other player in check, handled here
        let otherPlayer: Player;
        if (this.currentTurn === Player.White) {
            otherPlayer = Player.Black;
        } else {
            otherPlayer = Player.White;
        }
        const otherPlayerInCheck = this.isInCheck(otherPlayer);
        this.inCheck.set(otherPlayer, otherPlayerInCheck);

        //your turn put yourself in check, undo everything
        if (this.isInCheck(this.currentTurn)) {
            //restore board and throw error
            this.board[startPos[0]][startPos[1]] =
                this.board[endPos[0]][endPos[1]];
            this.board[endPos[0]][endPos[1]] = originalEnd;
            this.kings = originalKings;
            this.inCheck = originalInCheck;
            throw new Error("Cannot end turn in check");
        }

        //check if checkmate
        if (otherPlayerInCheck) {
            //this.isCheckmate(otherPlayer)
        }
    }

    public movePiece(
        startPos: [number, number],
        endPos: [number, number]
    ): void {
        assert(
            !(startPos[0] === endPos[0] && startPos[1] === endPos[1]),
            "No moving to same point, shouldve been handled as a deselect in frontend"
        );

        if (!this.withinBounds(startPos) || !this.withinBounds(endPos)) {
            throw new Error(
                `Implimentation error, should not be accessing out of bounds`
            );
        }
        if (this.board[startPos[0]][startPos[1]] === 0) {
            throw new Error(`Cannot move piece from empty square: ${startPos}`);
        }
        if (Math.abs(this.board[endPos[0]][endPos[1]]) === 6) {
            throw new Error(`Cannot take king at position: ${endPos}`);
        }
        if (
            Math.sign(this.board[startPos[0]][startPos[1]]) !==
            Math.sign(this.currentTurn)
        ) {
            throw new Error(`Cannot move this piece on this turn`);
        }

        this.moveHelper(startPos, endPos);

        //change turn. Note that this doesn't happen in an error is thrown (nothing should be mutated)
        if (this.currentTurn === Player.White) {
            this.currentTurn = Player.Black;
        } else {
            this.currentTurn = Player.White;
        }
    }
}
