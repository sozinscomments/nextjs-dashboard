"use client";
//can make this a client component and use the useActionState to do form validation for the server actions.
//This uses a hook and a new type to handle the validation issue and prevent the form from being sent
import { useActionState } from "react";
import { CustomerField } from "@/app/lib/definitions";
import Link from "next/link";
import {
    CheckIcon,
    ClockIcon,
    CurrencyDollarIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
// import { sendNewTasks, TaskState } from "@/app/lib/actions";

//use this in the overall form. This is the part that actually uses the server action. The Form should have a button to create more of these.
// function IndividualTaskForm() {
//   const initialState: TaskState = { message: null, errors: {} };
//   const [state, formAction] = useActionState(sendNewTasks, initialState);
//   return (
//     <form action={formAction}>
//       <div className="rounded-md bg-gray-50 p-4 md:p-6">
//         {/**name */}
//         <label htmlFor="customer" className="mb-2 block text-sm font-medium">
//           Choose name
//         </label>
//         <div className="relative">
//           <div className="relative mt-2 rounded-md">
//             <input
//               id="name"
//               name="name"
//               type="string"
//               placeholder="Enter task name"
//               className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
//               aria-describedby="name-error"
//             />
//           </div>
//         </div>
//         {/**name errors */}
//         {/**continuous */}
//         <fieldset>
//           <legend className="mb-2 block text-sm font-medium">
//             Decide whether this task can be broken up over days or done in one
//             sitting
//           </legend>
//           <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
//             <div className="flex gap-4">
//               <div className="flex items-center">
//                 <input
//                   id="continuous"
//                   name="continuous"
//                   type="radio"
//                   value="true"
//                   className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
//                   aria-describedby="continuous-error"
//                 />
//                 <label
//                   htmlFor="pending"
//                   className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
//                 >
//                   Continuous {/**<ClockIcon className="h-4 w-4" />*/}
//                 </label>
//               </div>
//               <div className="flex items-center">
//                 <input
//                   id="noncontinuous"
//                   name="continuous"
//                   type="radio"
//                   value="false"
//                   className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
//                   aria-describedby="continuous-error"
//                 />
//                 <label
//                   htmlFor="paid"
//                   className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
//                 >
//                   Noncontinuous {/**<CheckIcon className="h-4 w-4" />*/}
//                 </label>
//               </div>
//             </div>
//           </div>
//         </fieldset>
//         {/**continuous errors */}
//         {/**duration */}
//         <div className="mb-4">
//           <label htmlFor="amount" className="mb-2 block text-sm font-medium">
//             Enter task duration (hours)
//           </label>
//           <div className="relative mt-2 rounded-md">
//             <div className="relative">
//               <input
//                 id="duration"
//                 name="duration"
//                 type="number"
//                 step="0.1"
//                 placeholder="Enter time in hours"
//                 className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
//                 aria-describedby="amount-error"
//               />
//             </div>
//           </div>
//         </div>
//         {/**duration errors*/}
//       </div>
//     </form>
//   );
// }

// export default function Form() {
//   const initialState: TaskState = { message: null, errors: {} };
//   const [state, formAction] = useActionState(createInvoice, initialState);
//   return (
//     <form action={formAction}>
//       <div className="rounded-md bg-gray-50 p-4 md:p-6">
//         {/* Customer Name */}
//         <div className="mb-4">
//           <label htmlFor="customer" className="mb-2 block text-sm font-medium">
//             Choose customer
//           </label>
//           <div className="relative">
//             <select
//               id="customer"
//               name="customerId"
//               className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
//               defaultValue=""
//               aria-describedby="customer-error"
//             >
//               <option value="" disabled>
//                 Select a customer
//               </option>
//               {customers.map((customer) => (
//                 <option key={customer.id} value={customer.id}>
//                   {customer.name}
//                 </option>
//               ))}
//             </select>
//             <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
//           </div>
//         </div>
//         <div id="customer-error" aria-live="polite" aria-atomic="true">
//           {state.errors?.customerId &&
//             state.errors.customerId.map((error: string) => (
//               <p className="mt-2 text-sm text-red-500" key={error}>
//                 {error}
//               </p>
//             ))}
//         </div>

//         {/* Invoice Amount */}
//         <div className="mb-4">
//           <label htmlFor="amount" className="mb-2 block text-sm font-medium">
//             Choose an amount
//           </label>
//           <div className="relative mt-2 rounded-md">
//             <div className="relative">
//               <input
//                 id="amount"
//                 name="amount"
//                 type="number"
//                 step="0.01"
//                 placeholder="Enter USD amount"
//                 className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
//                 aria-describedby="amount-error"
//               />
//               <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
//             </div>
//           </div>
//         </div>
//         <div id="amount-error" aria-live="polite" aria-atomic="true">
//           {state.errors?.amount &&
//             state.errors.amount.map((error: string) => (
//               <p className="mt-2 text-sm text-red-500" key={error}>
//                 {error}
//               </p>
//             ))}
//         </div>

//         {/* Invoice Status */}
//         <fieldset>
//           <legend className="mb-2 block text-sm font-medium">
//             Set the invoice status
//           </legend>
//           <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
//             <div className="flex gap-4">
//               <div className="flex items-center">
//                 <input
//                   id="pending"
//                   name="status"
//                   type="radio"
//                   value="pending"
//                   className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
//                   aria-describedby="customer-error"
//                 />
//                 <label
//                   htmlFor="pending"
//                   className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
//                 >
//                   Pending <ClockIcon className="h-4 w-4" />
//                 </label>
//               </div>
//               <div className="flex items-center">
//                 <input
//                   id="paid"
//                   name="status"
//                   type="radio"
//                   value="paid"
//                   className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
//                   aria-describedby="status-error"
//                 />
//                 <label
//                   htmlFor="paid"
//                   className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
//                 >
//                   Paid <CheckIcon className="h-4 w-4" />
//                 </label>
//               </div>
//             </div>
//           </div>
//         </fieldset>
//         <div id="status-error" aria-live="polite" aria-atomic="true">
//           {state.errors?.status &&
//             state.errors.status.map((error: string) => (
//               <p className="mt-2 text-sm text-red-500" key={error}>
//                 {error}
//               </p>
//             ))}
//         </div>
//         <div id="error" aria-live="polite" aria-atomic="true">
//           {state.errors && state.message && (
//             <p className="mt-2 text-sm text-red-500" key={state.message}>
//               {state.message}
//             </p>
//           )}
//         </div>
//       </div>
//       <div className="mt-6 flex justify-end gap-4">
//         <Link
//           href="/dashboard/invoices"
//           className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
//         >
//           Cancel
//         </Link>
//         <Button type="submit">Create Invoice</Button>
//       </div>
//     </form>
//   );
// }
