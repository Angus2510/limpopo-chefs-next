"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

export default function InternalModerationReport() {
  const [students, setStudents] = useState([
    { id: 1, name: "", marksObtained: "", moderatedMark: "" },
    { id: 2, name: "", marksObtained: "", moderatedMark: "" },
    { id: 3, name: "", marksObtained: "", moderatedMark: "" },
    { id: 4, name: "", marksObtained: "", moderatedMark: "" },
    { id: 5, name: "", marksObtained: "", moderatedMark: "" },
    { id: 6, name: "", marksObtained: "", moderatedMark: "" },
  ]);

  const [campus, setCampus] = useState(null);

  const updateStudent = (id, field, value) => {
    setStudents(
      students.map((student) =>
        student.id === id ? { ...student, [field]: value } : student
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          LIMPOPO CHEFS ACADEMY
        </h1>
        <h2 className="text-xl font-semibold text-gray-700">
          Internal Moderation Report
        </h2>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            Registered Training Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <span className="font-medium">LIMPOPO CHEFS ACADEMY</span>
          </div>

          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mokopane"
                checked={campus === "mokopane"}
                onCheckedChange={() => setCampus("mokopane")}
              />
              <Label htmlFor="mokopane">Mokopane Campus</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="polokwane"
                checked={campus === "polokwane"}
                onCheckedChange={() => setCampus("polokwane")}
              />
              <Label htmlFor="polokwane">Polokwane Campus</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Accreditation Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cityGuildsNo" className="block mb-2">
                City & Guilds Centre No:
              </Label>
              <Input id="cityGuildsNo" placeholder="848490 / 848490A" />
            </div>
            <div>
              <Label htmlFor="qctoNo" className="block mb-2">
                QCTO Accreditation No:
              </Label>
              <Input
                id="qctoNo"
                placeholder="QCTO: SDP/16/0080 / QCTOSDP01191205-1879"
              />
            </div>
            <div>
              <Label htmlFor="qualCode" className="block mb-2">
                Internal Qualification Code:
              </Label>
              <Input id="qualCode" />
            </div>
            <div>
              <Label htmlFor="assessmentType" className="block mb-2">
                Assessment Type:
              </Label>
              <Input id="assessmentType" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Verification Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="verificationDate" className="block mb-2">
                Date of internal verification:
              </Label>
              <Input id="verificationDate" type="date" />
            </div>
            <div>
              <Label htmlFor="moderatorName" className="block mb-2">
                Moderated by – Name & Surname:
              </Label>
              <Input id="moderatorName" />
            </div>
            <div>
              <Label htmlFor="moderatorRegNo" className="block mb-2">
                Moderator Registration Number:
              </Label>
              <Input id="moderatorRegNo" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Student Moderation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left w-12 font-medium">No.</th>
                  <th className="py-2 px-4 text-left font-medium">
                    Student Name & Surname
                  </th>
                  <th className="py-2 px-4 text-left font-medium">
                    Marks Obtained
                  </th>
                  <th className="py-2 px-4 text-left font-medium">
                    Moderated Mark
                  </th>
                  <th className="py-2 px-4 text-left font-medium">
                    Moderator Signature
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b">
                    <td className="py-2 px-4">{student.id}.</td>
                    <td className="py-2 px-4">
                      <Input
                        value={student.name}
                        onChange={(e) =>
                          updateStudent(student.id, "name", e.target.value)
                        }
                      />
                    </td>
                    <td className="py-2 px-4">
                      <Input
                        value={student.marksObtained}
                        onChange={(e) =>
                          updateStudent(
                            student.id,
                            "marksObtained",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="py-2 px-4">
                      <Input
                        value={student.moderatedMark}
                        onChange={(e) =>
                          updateStudent(
                            student.id,
                            "moderatedMark",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="py-2 px-4">
                      <div className="h-10 border border-gray-300 rounded-md bg-gray-50"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Internal Moderator(s)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="modName" className="block mb-2">
                Name
              </Label>
              <Input id="modName" />
            </div>
            <div>
              <Label className="block mb-2">Signature</Label>
              <div className="h-10 border border-gray-300 rounded-md bg-gray-50"></div>
            </div>
            <div>
              <Label htmlFor="modDate" className="block mb-2">
                Date
              </Label>
              <Input id="modDate" type="date" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4 mt-6">
          <Button variant="outline">Reset</Button>
          <Button>Submit</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
