// import React, { useState } from 'react';
// import {
//     Sheet,
//     SheetTrigger,
//     SheetContent,
//     SheetDescription,
//     SheetFooter,
//     SheetHeader,
//     SheetTitle,
//  } from '@/components/ui/sheet';
// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';

// interface PayableSheetProps {
//   studentId: string;
//   firstName: string;
//   lastName: string;
//   studentNumber: string;
//   onSave: (data: any) => void;
//   onClose: () => void;
//   isOpen: boolean;
// }

// export const PayableSheet: React.FC<PayableSheetProps> = ({
//   studentId,
//   firstName,
//   lastName,
//   studentNumber,
//   onSave,
//   onClose,
//   isOpen,
// }) => {
//   const [isBlocked, setIsBlocked] = useState(false);
//   const [payableAmount, setPayableAmount] = useState('');
//   const [dueDate, setDueDate] = useState('');

//   const handleSave = () => {
//     onSave({
//       studentId,
//       isBlocked,
//       payableAmount,
//       dueDate,
//     });
//     onClose(); // Close the sheet after saving
//   };

//   return (
//     <Sheet open={isOpen} onOpenChange={onClose}>
//       <SheetContent>
//         <SheetHeader>
//           <SheetTitle>Update Fees To pay.</SheetTitle>
//           <SheetDescription>
//           <div className="mt-4">
//            Student Name: {firstName} {lastName}
//          </div>
//            <div className="mt-4">
//            Student No: {studentNumber}
//            </div>
//           </SheetDescription>
//         </SheetHeader>
//         <div className="p-4">
//           <div className="mt-4">
//             <Checkbox
//               checked={isBlocked}
//               onCheckedChange={(checked) => setIsBlocked(!!checked)}
//             />
//             <Label className="ml-2">Block Profile</Label>
//           </div>
//           <div className="mt-4">
//             <Label htmlFor="payableAmount">Payable Amount</Label>
//             <Input
//               id="payableAmount"
//               value={payableAmount}
//               onChange={(e) => setPayableAmount(e.target.value)}
//               placeholder="Enter amount"
//             />
//           </div>
//           <div className="mt-4">
//             <Label htmlFor="dueDate">Due Date</Label>
//             <Input
//               id="dueDate"
//               type="date"
//               value={dueDate}
//               onChange={(e) => setDueDate(e.target.value)}
//             />
//           </div>
//           <SheetFooter>
//           <div className="mt-4">
//             <Button onClick={handleSave}>Save</Button>
//         </div>
//           </SheetFooter>
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// };
