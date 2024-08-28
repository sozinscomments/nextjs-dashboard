"use client";
import Image from "next/image";
import * as assert from "assert";
import { useState, useEffect } from "react";
import chessboardInstance from "@/app/lib/chess/persistent-chessboard";

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
    useEffect(() => {
        if (selected.length == 2) {
            chessboardInstance.movePiece(selected[0], selected[1]);
            setSelected([]);
            setBoard(chessboardInstance.getPieces());
        }
    }, [selected]);

    const squareSize = 330;
    console.log("hello world from chessboard.tsx");
    return (
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
                                    const selection: [number, number] = [
                                        rowNum,
                                        colNum,
                                    ];
                                    console.log("selection", selection);
                                    setSelected(selected.concat([selection]));
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
    );
}
