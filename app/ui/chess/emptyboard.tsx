import Image from "next/image";

export default function EmptyBoard() {
    return (
        <Image
            src="/chess_pieces_png/chessboard.png"
            width={2640}
            height={2640}
            alt="Empty chessboard"
        />
    );
}
