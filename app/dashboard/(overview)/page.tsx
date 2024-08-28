"use client";
//TODO: find out if making this a client component is actually allowed.
// import CardWrapper from "@/app/ui/dashboard/cards";
// import RevenueChart from "@/app/ui/dashboard/revenue-chart";
// import LatestInvoices from "@/app/ui/dashboard/latest-invoices";
// import { lusitana } from "@/app/ui/fonts";
// import { Suspense } from "react";
// import {
//   CardSkeleton,
//   LatestInvoicesSkeleton,
//   RevenueChartSkeleton,
// } from "@/app/ui/skeletons";
// import { Metadata } from "next";

import Chessboard from "@/app/ui/chess/chessboard";
import assert from "assert";
import { useState, useEffect } from "react";

// export const metadata: Metadata = {
//   title: "Dashboard",
// };

// export default async function Page() {
//   return (
//     <main>
//       <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
//         Dashboard
//       </h1>
//       <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//         <Suspense fallback={<CardSkeleton />}>
//           <CardWrapper />
//         </Suspense>
//       </div>
//       <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
//         <Suspense fallback={<RevenueChartSkeleton />}>
//           <RevenueChart />
//         </Suspense>
//         <Suspense fallback={<LatestInvoicesSkeleton />}>
//           <LatestInvoices />
//         </Suspense>
//       </div>
//     </main>
//   );
// }
export default async function Page() {
    // const [pieces, setPieces] = useState([]);
    // const [ws, setWs] = useState<WebSocket | null>(null);

    // useEffect(() => {
    //     const websocket = new WebSocket("ws://localhost:3000");
    //     setWs(websocket);

    //     websocket.onmessage = (event) => {
    //         const { pieces } = JSON.parse(event.data);
    //         setPieces(pieces);
    //     };

    //     return () => websocket.close();
    // }, []);
    console.log("hello world from dashboard page");
    return (
        <div>
            {/* Render Chessboard Component here and pass pieces as prop */}
            <Chessboard />
        </div>
    );
}
