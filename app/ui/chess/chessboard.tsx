"use client";
import Image from "next/image";
import * as assert from "assert";
import { useState, useEffect } from "react";
import chessboardInstance from "@/app/lib/chess/persistent-chessboard";
import { Player } from "@/app/lib/chess/board-ops";
import { lusitana } from "../fonts";

let pieces = chessboardInstance.getPieces();

const piecesMap: Map<number, string> = new Map([
    [-6, "/chess_pieces_png/black_k.png"],
    [-5, "/chess_pieces_png/black_q.png"],
    [-4, "/chess_pieces_png/black_b.png"],
    [-3, "/chess_pieces_png/black_kn.png"],
    [-2, "/chess_pieces_png/black_r.png"],
    [-1, "/chess_pieces_png/black_p.png"],
    [6, "/chess_pieces_png/white_k.png"],
    [5, "/chess_pieces_png/white_q.png"],
    [4, "/chess_pieces_png/white_b.png"],
    [3, "/chess_pieces_png/white_kn.png"],
    [2, "/chess_pieces_png/white_r.png"],
    [1, "/chess_pieces_png/white_p.png"],
    [0, "/chess_pieces_png/empty.png"],
]);

/**
 *
 * @param piecesToRender a map of the non empty positions to the piece they contain
 * @returns
 */
export default function Chessboard() {
    const [board, setBoard] = useState<number[][]>(pieces);
    // const [ws, setWs] = useState<WebSocket | null>(null);
    // useEffect(() => {
    //     const websocket = new WebSocket("ws://localhost:3000");

    //     websocket.onopen = () => {
    //         setWs(websocket);
    //         websocket.send(JSON.stringify({ action: "getBoard" }));
    //     };

    //     websocket.onmessage = (event) => {
    //         const data = JSON.parse(event.data);

    //         if (data.action === "boardUpdate") {
    //             setBoard(data.board);
    //         }
    //     };

    //     return () => {
    //         websocket.close();
    //     };
    // }, []);

    const [selected, setSelected] = useState<[number, number][]>([]);
    const [err, setErr] = useState<string | undefined>();
    const [turn, setTurn] = useState<Player>(Player.White);
    const [inCheck, setInCheck] = useState<boolean>(false);
    const [checkmate, setCheckmate] = useState<boolean>(false);
    useEffect(() => {
        if (selected.length == 2) {
            //TODO: try catch here
            try {
                chessboardInstance.movePiece(selected[0], selected[1]);
                setCheckmate(chessboardInstance.getCheckmate());
                setTurn(chessboardInstance.getWhoseTurn());
                setInCheck(chessboardInstance.getInCheck());
                setErr(undefined);
            } catch (e: any) {
                //should only be in an error state from movePiece
                setErr(e.message);
            }
            setSelected([]);
            setBoard(chessboardInstance.getPieces());
        }
    }, [selected]);

    const squareSize = 90;
    console.log("hello world from chessboard.tsx");
    return (
        <>
            <div
                style={{
                    position: "relative",
                    width: `${8 * squareSize}px`,
                    height: `${8 * squareSize}px`,
                }}
            >
                <Image
                    src="/chess_pieces_png/chessboard.png"
                    alt="Chessboard"
                    layout="fill"
                    objectFit="contain"
                    // priority={true} // Ensures the background loads first
                />

                {board.map((row: number[], rowNum: number) => (
                    <>
                        {row.map((piece: number, colNum: number) => {
                            const imageSrc = piecesMap.get(piece);
                            assert.ok(imageSrc !== undefined);
                            return (
                                <div
                                    key={(rowNum + 1) * (colNum + 1)}
                                    style={{
                                        position: "absolute",
                                        top: `${rowNum * squareSize}px`,
                                        left: `${colNum * squareSize}px`,
                                        width: `${squareSize}px`,
                                        height: `${squareSize}px`,
                                    }}
                                    onClick={() => {
                                        if (!checkmate) {
                                            const selection: [number, number] =
                                                [rowNum, colNum];
                                            console.log("selection", selection);
                                            setSelected(
                                                selected.concat([selection])
                                            );
                                        }
                                    }}
                                >
                                    <Image
                                        src={imageSrc}
                                        alt={`Chess piece at ${rowNum}, ${colNum}`}
                                        layout="responsive"
                                        width={squareSize}
                                        height={squareSize}
                                    />
                                </div>
                            );
                        })}
                    </>
                ))}
            </div>
            {!checkmate && (
                <h1
                    className={`${lusitana.className} mb-8 text-xl md:text-2xl`}
                >
                    {Player[turn]}'s Turn
                    {inCheck && ", Get Out of Check!"}
                </h1>
            )}
            {checkmate && (
                <h1
                    className={`${lusitana.className} mb-8 text-xl md:text-2xl`}
                >
                    {Player[-1 * turn]} Won!
                </h1>
            )}
            {err && (
                <h1
                    className={`${lusitana.className} mb-8 text-xl md:text-2xl`}
                >
                    {err}
                </h1>
            )}
        </>
    );
}
