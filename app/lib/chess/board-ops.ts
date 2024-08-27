import * as assert from "assert";

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
    private checkmate: boolean;

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
        this.checkmate = false;
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
    ): [number, number] | undefined {
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
                    return pos;
                } else {
                    break;
                }
            }
            pos = func(pos);
        }
        return undefined;
    }

    /**
     * helper for isInCheck. Takes a function that generates a next position
     */
    private checkDiagonalPath(
        piece: number,
        startPos: [number, number],
        func: (start: [number, number]) => [number, number]
    ): [number, number] | undefined {
        let pos = func(startPos);
        while (this.withinBounds(pos)) {
            const otherPiece = this.board[pos[0]][pos[1]];
            //if we run into the same color piece, break
            if (Math.sign(otherPiece) === Math.sign(piece)) {
                break;
            }
            //if we run into a different color piece, check if that piece is a bishop or queen. If it is, return true. else if the piece is a pawn and is one away from start pos, return true. else, break
            else if (
                otherPiece !== 0 &&
                Math.sign(otherPiece) !== Math.sign(piece)
            ) {
                if (Math.abs(otherPiece) === 4 || Math.abs(otherPiece) === 5) {
                    return pos;
                } else if (
                    Math.abs(otherPiece) === 1 &&
                    Math.abs(pos[0] - startPos[0]) === 1
                ) {
                    return pos;
                } else {
                    break;
                }
            }
            pos = func(pos);
        }
        return undefined;
    }

    /**
     * logic used to determine if a piece can be taken by an enemy piece in one move, used to determine if a king is in check or if a piece isn't causing checkmate
     * @param pos
     */
    private isInDangerFrom(pos: [number, number]): [number, number][] {
        const [row, col] = pos;
        const piece = this.board[row][col];

        const ans = [];

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
        let fromKnight: [number, number] | undefined;
        for (const distance of possibleKnightDistances) {
            const knightPos: [number, number] = [
                pos[0] + distance[0],
                pos[1] + distance[1],
            ];
            if (this.withinBounds(knightPos)) {
                const knight = this.board[knightPos[0]][knightPos[1]];
                if (
                    Math.abs(knight) === 3 &&
                    Math.sign(knight) !== Math.sign(piece)
                ) {
                    fromKnight = knightPos;
                    break;
                }
            }
        }
        if (fromKnight) {
            ans.push(fromKnight);
        }

        //check above
        const fromAbove = this.checkStraightPath(
            piece,
            pos,
            (start: [number, number]) => [start[0] - 1, start[1]]
        );
        if (fromAbove) {
            ans.push(fromAbove);
        }
        //check below
        const fromBelow = this.checkStraightPath(
            piece,
            pos,
            (start: [number, number]) => [start[0] + 1, start[1]]
        );
        if (fromBelow) {
            ans.push(fromBelow);
        }
        //check to the left
        const fromLeft = this.checkStraightPath(
            piece,
            pos,
            (start: [number, number]) => [start[0], start[1] - 1]
        );
        if (fromLeft) {
            ans.push(fromLeft);
        }
        //check to the right
        const fromRight = this.checkStraightPath(
            piece,
            pos,
            (start: [number, number]) => [start[0], start[1] + 1]
        );
        if (fromRight) {
            ans.push(fromRight);
        }
        //check above left
        const fromAboveLeft = this.checkDiagonalPath(
            piece,
            pos,
            (start: [number, number]) => [start[0] - 1, start[1] - 1]
        );
        if (fromAboveLeft) {
            ans.push(fromAboveLeft);
        }
        //check above right
        const fromAboveRight = this.checkDiagonalPath(
            piece,
            pos,
            (start: [number, number]) => [start[0] - 1, start[1] + 1]
        );
        if (fromAboveRight) {
            ans.push(fromAboveRight);
        }
        //check below right
        const fromBelowRight = this.checkDiagonalPath(
            piece,
            pos,
            (start: [number, number]) => [start[0] + 1, start[1] + 1]
        );
        if (fromBelowRight) {
            ans.push(fromBelowRight);
        }
        //check below left
        const fromBelowLeft = this.checkDiagonalPath(
            piece,
            pos,
            (start: [number, number]) => [start[0] + 1, start[1] - 1]
        );
        if (fromBelowLeft) {
            ans.push(fromBelowLeft);
        }
        assert.ok(
            ans.length <= 2,
            "Cannot be in check from more than two pieces at once"
        );
        return ans;
    }

    private checkmateHelper(
        otherPlayer: Player,
        otherPlayerInCheckFrom: [number, number][]
    ): void {
        if (otherPlayerInCheckFrom.length > 0) {
            //save the original king positions
            const originalKingsForCheckmate = new Map(this.kings);
            let checkmate = true;
            //simulate all 8 possible king movements.
            const movements = [
                [0, 1],
                [1, 0],
                [0, -1],
                [-1, 0],
                [1, 1],
                [1, -1],
                [-1, 1],
                [-1, -1],
            ];
            const kingPosition = this.kings.get(otherPlayer);
            assert.ok(kingPosition !== undefined);
            const king = this.board[kingPosition[0]][kingPosition[1]];
            for (const movement of movements) {
                const newKingPosition: [number, number] = [
                    kingPosition[0] + movement[0],
                    kingPosition[1] + movement[1],
                ];
                if (this.withinBounds(newKingPosition)) {
                    const currentPiece =
                        this.board[newKingPosition[0]][newKingPosition[1]];
                    //if we are within the board bounds, and either we're moving to an empty square or taking an enemy piece
                    if (
                        currentPiece === 0 ||
                        Math.sign(king) !== Math.sign(currentPiece)
                    ) {
                        //make the change, then check if its in check.
                        this.board[newKingPosition[0]][newKingPosition[1]] =
                            king;
                        this.board[kingPosition[0]][kingPosition[1]] = 0;
                        this.kings.set(otherPlayer, newKingPosition);
                        const stillInCheck: boolean =
                            this.isInCheckFrom(otherPlayer).length > 0;
                        //undo mutation
                        this.board[kingPosition[0]][kingPosition[1]] = king;
                        this.board[newKingPosition[0]][newKingPosition[1]] =
                            currentPiece;
                        this.kings = originalKingsForCheckmate;

                        if (!stillInCheck) {
                            checkmate = false;
                            break;
                        }
                    }
                }
            }
            //if we still haven't ruled out checkmate and not in check from multiple pieces, find the piece that it's in check from.
            if (checkmate && otherPlayerInCheckFrom.length === 1) {
                const offendingPiecePosition = otherPlayerInCheckFrom[0];
                //using the same logic we use to determine if a king is in check, see if you can take the offending piece
                //Note that we can use the same logic (not care about the king taking it) because if the king could take it we would've discovered in the previous check.
                if (this.isInDangerFrom(offendingPiecePosition).length > 0) {
                    //TODO: Potential optimization, don't actually need to get a full list (don't care if its in danger from several pieces), just need true or false. Can have optimized function that breaks.
                    checkmate = false;
                }
                //if the offending piece is not a knight, try to block its path
                const offendingPiece =
                    this.board[offendingPiecePosition[0]][
                        offendingPiecePosition[1]
                    ];
                if (!checkmate && Math.abs(offendingPiece) !== 3) {
                    if (kingPosition[0] === offendingPiecePosition[0]) {
                        //TODO: try to refacor this into a helper, since shares a lot of logic with isPathClear
                        //straight line
                        const row = kingPosition[0];
                        const start = Math.min(
                            kingPosition[1],
                            offendingPiecePosition[1]
                        );
                        const end = Math.max(
                            kingPosition[1],
                            offendingPiecePosition[1]
                        );
                        for (let i = start + 1; i < end; i++) {
                            //insert a piece in between of the same type as the offending piece, check if its in danger, if it is the other team can block the path
                            const originalVal = this.board[row][i];
                            this.board[row][i] = offendingPiece;
                            if (this.isInDangerFrom([row, i]).length > 0) {
                                //note that this works because we do not consider the king as being able to endanger a piece
                                checkmate = false;
                                //undo mutation and break
                                this.board[row][i] = originalVal;
                                break;
                            }
                            //undo mutation
                            this.board[row][i] = originalVal;
                        }
                    } else if (kingPosition[1] === offendingPiecePosition[1]) {
                        const col = kingPosition[1];
                        const start = Math.min(
                            kingPosition[0],
                            offendingPiecePosition[0]
                        );
                        const end = Math.max(
                            kingPosition[0],
                            offendingPiecePosition[0]
                        );
                        for (let i = start + 1; i < end; i++) {
                            const originalVal = this.board[i][col];
                            this.board[i][col] = offendingPiece;
                            if (this.isInDangerFrom([i, col]).length > 0) {
                                checkmate = false;
                                //undo mutation and break
                                this.board[i][col] = originalVal;
                                break;
                            }
                            //undo mutation
                            this.board[i][col] = originalVal;
                        }
                    } else {
                        assert.ok(
                            Math.abs(
                                kingPosition[0] - offendingPiecePosition[0]
                            ) ===
                                Math.abs(
                                    kingPosition[1] - offendingPiecePosition[1]
                                ),
                            "cannot be in check from a piece that isn't horizontal, vertical, or diagonal"
                        );
                        if (
                            Math.sign(
                                kingPosition[0] - offendingPiecePosition[0]
                            ) ===
                            Math.sign(
                                kingPosition[1] - offendingPiecePosition[1]
                            )
                        ) {
                            const startRow = Math.min(
                                kingPosition[0],
                                offendingPiecePosition[0]
                            );
                            const startCol = Math.min(
                                kingPosition[1],
                                offendingPiecePosition[1]
                            );
                            const endRow = Math.max(
                                kingPosition[0],
                                offendingPiecePosition[0]
                            );
                            const spaceBetween = endRow - startRow;
                            for (let i = 1; i < spaceBetween; i++) {
                                const originalVal =
                                    this.board[startRow + i][startCol + i];
                                this.board[startRow + i][startCol + i] =
                                    offendingPiece;
                                if (
                                    this.isInDangerFrom([
                                        startRow + i,
                                        startCol + i,
                                    ]).length > 0
                                ) {
                                    checkmate = false;
                                    //undo mutation and break
                                    this.board[startRow + i][startCol + i] =
                                        originalVal;
                                    break;
                                }
                                //undo mutation
                                this.board[startRow + i][startCol + i] =
                                    originalVal;
                            }
                        } else {
                            const startRow = Math.min(
                                kingPosition[0],
                                offendingPiecePosition[0]
                            );
                            const startCol = Math.max(
                                kingPosition[1],
                                offendingPiecePosition[1]
                            );
                            const endRow = Math.max(
                                kingPosition[0],
                                offendingPiecePosition[0]
                            );
                            const spaceBetween = endRow - startRow;
                            for (let i = 1; i < spaceBetween; i++) {
                                const originalVal =
                                    this.board[startRow + i][startCol - i];
                                this.board[startRow + i][startCol - i] =
                                    offendingPiece;
                                if (
                                    this.board[startRow + i][startCol - i] !== 0
                                ) {
                                    checkmate = false;
                                    //undo mutation and break
                                    this.board[startRow + i][startCol - i] =
                                        originalVal;
                                    break;
                                }
                                //undo mutation
                                this.board[startRow + i][startCol - i] =
                                    originalVal;
                            }
                        }
                    }
                }
            }

            this.checkmate = checkmate;
        }
    }

    /**
     * checks whether player is in check and returns an array of all the avenues through which it is in check
     * @param player
     * @returns
     */
    private isInCheckFrom(player: Player): [number, number][] {
        const pos = this.kings.get(player);
        assert.ok(pos !== undefined);
        return this.isInDangerFrom(pos);
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
        //TODO: Logic for stalemate. Maybe just give them an option to declare stalemate.
        const piece = Math.abs(this.board[startPos[0]][startPos[1]]);
        const originalEnd = this.board[endPos[0]][endPos[1]];
        const originalKings = new Map(this.kings);
        const originalInCheck = new Map(this.inCheck);

        //pawn
        if (piece === 1) {
            //must move up the board
            if (this.currentTurn === Player.White) {
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
                    Math.abs(startPos[1] - endPos[1]) === 1 &&
                    this.board[endPos[0]][endPos[1]] < 0
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
                    Math.abs(startPos[1] - endPos[1]) === 1 &&
                    this.board[endPos[0]][endPos[1]] > 0
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
        else if (piece === 2) {
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
        else if (piece === 3) {
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
        else if (piece === 4) {
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
        else if (piece === 5) {
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
        else if (piece === 6) {
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
        const otherPlayerInCheckFrom = this.isInCheckFrom(otherPlayer);
        const otherPlayerInCheck = otherPlayerInCheckFrom.length > 0;
        this.inCheck.set(otherPlayer, otherPlayerInCheck);
        console.log("\n incheck ", this.inCheck);
        //your turn put yourself in check, undo everything
        if (this.isInCheckFrom(this.currentTurn).length > 0) {
            //restore board and throw error
            this.board[startPos[0]][startPos[1]] =
                this.board[endPos[0]][endPos[1]];
            this.board[endPos[0]][endPos[1]] = originalEnd;
            this.kings = originalKings;
            this.inCheck = originalInCheck;
            throw new Error("Cannot end turn in check");
        }

        //check if checkmate
        this.checkmateHelper(otherPlayer, otherPlayerInCheckFrom); //mutates this.checkmate if checkmate is now true.
    }

    public movePiece(
        startPos: [number, number],
        endPos: [number, number]
    ): void {
        assert.ok(
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

        //change turn. Note that this doesn't happen in the case that an error is thrown (nothing should be mutated)
        if (this.currentTurn === Player.White) {
            this.currentTurn = Player.Black;
        } else {
            this.currentTurn = Player.White;
        }
    }

    public toString(): string {
        let ans = "";
        for (const arr of this.board) {
            const line = arr.join("\t") + "\n";
            ans += line;
        }

        return ans;
    }
}

const readline = require("readline");

// Create an interface for readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(query, (answer: string) => {
            resolve(answer);
        });
    });
}

async function main() {
    const chess = new ChessBoard();
    while (true) {
        console.log(chess.toString());

        // Wait for user input
        const startRow = await askQuestion("Please enter start row: ");
        const startCol = await askQuestion("Please enter start col: ");
        const startPos: [number, number] = [Number(startRow), Number(startCol)];
        const endRow = await askQuestion("Please enter end row: ");
        const endCol = await askQuestion("Please enter end col: ");
        const endPos: [number, number] = [Number(endRow), Number(endCol)];
        try {
            chess.movePiece(startPos, endPos);
        } catch (e) {
            console.log(e);
        }
    }

    rl.close(); // Close the readline interface when done
}

main();
