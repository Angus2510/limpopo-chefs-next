"use client";

import { useState, useEffect } from "react";
import { ContentLayout } from "@/components/layout/content-layout";
import BackButton from "@/components/common/BackButton";
import DatePicker from "@/components/common/DatePicker";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MultiSelect } from "@/components/common/multiselect";
import { Button } from "@/components/ui/button";
import { getStudentsByIntakeAndCampus } from "@/lib/actions/student/getStudentsByIntakeAndCampus";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";

// Define types
type Student = {
  id: string;
  name: string;
  surname: string;
  unitNo: string;
  markObtained: number;
  moderatedMark: number;
};

type IntakeGroup = {
  id: string;
  title: string;
};

type Campus = {
  id: string;
  name: string;
};

type Moderator = {
  name: string;
  campus: string;
  nambA: string;
  nambM: string;
};

type FormData = {
  campus: string;
  assessmentType: "FORMATIVE" | "SUMMATIVE";
  verificationDate: Date;
  moderator: string;
  intakeGroups: string[];
};

// Define constants
const MODERATORS: Moderator[] = [
  {
    name: "Tommie Hurter",
    campus: "mokopane",
    nambA: "NAMB-A/2018/2329",
    nambM: "NAMB-M/2018/1390",
  },
  {
    name: "Kelly Fowlds",
    campus: "polokwane",
    nambA: "NAMB-A/2020/2794",
    nambM: "NAMB-M/2022/2010",
  },
  {
    name: "Breyton Hannam",
    campus: "polokwane",
    nambA: "NAMB-A/2022/3456",
    nambM: "NAMB-M/2024/2356",
  },
  {
    name: "Adriaan Jacobs",
    campus: "mokopane",
    nambA: "NAMB-A/2022/3457",
    nambM: "NAMB-M/2024/2357",
  },
  {
    name: "Jim Thobakgale",
    campus: "mokopane",
    nambA: "NAMB-A/2023/4193",
    nambM: "",
  },
  {
    name: "Kopano Mothogoane",
    campus: "polokwane",
    nambA: "NAMB-A/2024/4646",
    nambM: "",
  },
  {
    name: "Thakgalo Masemola",
    campus: "mokopane",
    nambA: "NAMB-A/2025/4872",
    nambM: "",
  },
];

const CAMPUSES: Campus[] = [
  { id: "mokopane", name: "Mokopane Campus" },
  { id: "polokwane", name: "Polokwane Campus" },
];

export default function ModerationReport() {
  const [students, setStudents] = useState<Student[]>([]);
  const [intakeGroups, setIntakeGroups] = useState<IntakeGroup[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      campus: "",
      assessmentType: "SUMMATIVE",
      verificationDate: new Date(),
      moderator: "",
      intakeGroups: [],
    },
  });

  const { watch } = form;
  const selectedCampus = watch("campus");
  const selectedIntakeGroups = watch("intakeGroups");
  const selectedModerator = MODERATORS.find(
    (m) => m.name === watch("moderator")
  );

  useEffect(() => {
    const fetchIntakeGroups = async () => {
      try {
        const groups = await getAllIntakeGroups();
        setIntakeGroups(groups);
      } catch (error) {
        console.error("Failed to fetch intake groups:", error);
      }
    };
    fetchIntakeGroups();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCampus || !selectedIntakeGroups?.length) return;

      setIsLoadingStudents(true);
      try {
        const allStudents = await getStudentsByIntakeAndCampus(
          selectedIntakeGroups,
          selectedCampus
        );

        const moderatedStudents = allStudents.filter(
          (student) => student.moderatedMark !== undefined
        );
        const randomStudents = moderatedStudents
          .sort(() => 0.5 - Math.random())
          .slice(0, 10);

        setStudents(randomStudents);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedCampus, selectedIntakeGroups]);

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted:", data);
  };

  return (
    <ContentLayout title="Moderation Report">
      <BackButton />
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          LIMPOPO CHEFS ACADEMY Internal Moderation Report
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="border-r bg-gray-50 font-medium w-1/3">
                      Registered Training Provider:
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name="campus"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Campus" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CAMPUSES.map((campus) => (
                                    <SelectItem
                                      key={campus.id}
                                      value={campus.id}
                                    >
                                      {campus.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="border-r bg-gray-50 font-medium">
                      Assessment Type:
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name="assessmentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="FORMATIVE">
                                    FORMATIVE
                                  </SelectItem>
                                  <SelectItem value="SUMMATIVE">
                                    SUMMATIVE
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="border-r bg-gray-50 font-medium">
                      Date of internal verification:
                    </TableCell>
                    <TableCell>
                      <DatePicker
                        control={form.control}
                        name="verificationDate"
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="border-r bg-gray-50 font-medium">
                      Moderated by -- Name & Surname:
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name="moderator"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Moderator" />
                                </SelectTrigger>
                                <SelectContent>
                                  {MODERATORS.filter(
                                    (m) => m.campus === selectedCampus
                                  ).map((mod) => (
                                    <SelectItem key={mod.name} value={mod.name}>
                                      {mod.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="border-r bg-gray-50 font-medium">
                      Moderator Registration Number:
                    </TableCell>
                    <TableCell>
                      {selectedModerator?.nambM ||
                        selectedModerator?.nambA ||
                        ""}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {selectedCampus && (
              <div className="border rounded-lg p-4">
                <FormField
                  control={form.control}
                  name="intakeGroups"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MultiSelect
                          label="Select Intake Groups"
                          options={intakeGroups.map((group) => ({
                            label: group.title,
                            value: group.id,
                          }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select intake groups..."
                          defaultValue={[]}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <p className="text-sm text-gray-500 mt-2">
                  10 random moderated students will be selected
                </p>
              </div>
            )}

            {isLoadingStudents ? (
              <div className="text-center py-4">Loading students...</div>
            ) : (
              students.length > 0 && (
                <div className="my-8">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">No.</TableHead>
                        <TableHead>Student Name & Surname</TableHead>
                        <TableHead className="text-center">Unit No:</TableHead>
                        <TableHead className="text-center">
                          Mark Obtained
                        </TableHead>
                        <TableHead className="text-center">
                          Moderated Mark
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student, index) => (
                        <TableRow key={student.id}>
                          <TableCell>{index + 1}.</TableCell>
                          <TableCell>{`${student.name} ${student.surname}`}</TableCell>
                          <TableCell className="text-center">
                            {student.unitNo}
                          </TableCell>
                          <TableCell className="text-center">
                            {student.markObtained}
                          </TableCell>
                          <TableCell className="text-center">
                            {student.moderatedMark}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            )}

            <div className="mt-8 border rounded-lg p-4">
              <h3 className="font-bold mb-4">Internal Moderator</h3>
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <p className="font-medium">Name:</p>
                  <p>{selectedModerator?.name || ""}</p>
                </div>
                <div>
                  <p className="font-medium">Signature:</p>
                  <div className="bg-gray-100 p-4 rounded-lg h-16 w-32 flex items-center justify-center">
                    <p className="text-gray-500 italic text-sm">
                      Digital Signature
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Date:</p>
                  <p>{watch("verificationDate")?.toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Submit Report</Button>
            </div>
          </form>
        </Form>
      </div>
    </ContentLayout>
  );
}
