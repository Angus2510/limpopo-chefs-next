// "use client";

// import React, { useState } from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { testFormSchema } from "@/schemas/assignment/testFormSchema";
// import { Card } from "@/components/ui/card";
// import { useToast } from "@/components/ui/use-toast";
// import TestDetails from "./TestDetails";
// import AddQuestion from "./AddQuestion";
// import QuestionsList from "./QuestionsList";
// import { Button } from "@/components/ui/button";
// import { Form } from "@/components/ui/form";

// const TestCreationForm: React.FC = () => {
//   const form = useForm({
//     resolver: zodResolver(testFormSchema),
//     defaultValues: {
//       title: "",
//       description: "",
//       type: "",
//       questions: [],
//     },
//   });

//   const { toast } = useToast();
//   const { control, handleSubmit, reset } = form;
//   const {
//     fields: questionFields,
//     append: addQuestion,
//     remove: removeQuestion,
//   } = useFieldArray({
//     control,
//     name: "questions",
//   });

//   const [newQuestion, setNewQuestion] = useState({
//     questionText: "",
//     questionType: "short-answer",
//     correctAnswer: "",
//   });

//   const onSubmit = async (data: any) => {
//     console.log("Form data:", data);
//     try {
//       toast({
//         title: "Test created successfully",
//         description: "The test data has been logged to the console.",
//       });
//       reset();
//       setNewQuestion({
//         questionText: "",
//         questionType: "short-answer",
//         correctAnswer: "",
//       });
//     } catch (error) {
//       console.error("Error during form submission:", error);
//       toast({
//         title: "Failed to create test",
//         description: "There was an error processing your request.",
//       });
//     }
//   };

//   return (
//     <Card>
//       <Form {...form}>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           <TestDetails control={control} />
//           <AddQuestion
//             newQuestion={newQuestion}
//             setNewQuestion={setNewQuestion}
//             addQuestion={addQuestion}
//             toast={toast}
//           />
//           <QuestionsList
//             questionFields={questionFields}
//             removeQuestion={removeQuestion}
//           />
//           <div className="flex justify-end px-5 py-5">
//             <Button type="submit" className="w-auto">
//               Save Test
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </Card>
//   );
// };

// export default TestCreationForm;
