"use client";
import BackButton from "@/components/common/BackButton";
import { ContentLayout } from "@/components/layout/content-layout";
import { useState } from "react";

export default function StudentSelectionReport() {
  const [activeTab, setActiveTab] = useState("verification");

  // Student selection data
  const students = [
    {
      date: "15/04/2024",
      assessor: "Breyton Hannam",
      learner: "Mamogale Junecah Mmediwane",
      outcome: "03:01 (306)",
    },
    {
      date: "22/04/2024",
      assessor: "Raiyen Chetty",
      learner: "Shirley Takatso Maepa",
      outcome: "03:02 (302)",
    },
    {
      date: "29/04/2024",
      assessor: "Raiyen Chetty",
      learner: "Tshegofatso Rachel Nkgweng",
      outcome: "03:03 (303)",
    },
    {
      date: "06/05/2024",
      assessor: "Nadine Engelbrecht",
      learner: "Lesetja Jeaniffer Teffo",
      outcome: "03:04 (304)",
    },
    {
      date: "13/05/2024",
      assessor: "Breyton Hannam",
      learner: "Ntokozo Charmaine Banda",
      outcome: "03:05 (301)",
    },
    {
      date: "03/06/2024",
      assessor: "Raiyen Chetty",
      learner: "Diarora Ngoanamosadi Mashoene",
      outcome: "03:06",
    },
    {
      date: "20/08/2024",
      assessor: "Raiyen Chetty",
      learner: "Tshegofatso Boshego",
      outcome: "03:07",
    },
    {
      date: "01/07/2024",
      assessor: "Nadine Engelbrecht",
      learner: "Padima Alfred Ramaano",
      outcome: "3rd Year Task",
    },
    {
      date: "01/05/2024",
      assessor: "Breyton Hannam",
      learner: "Tumisho Moshohli Shai",
      outcome: "C1",
    },
    {
      date: "08/05/2024",
      assessor: "Nadine Engelbrecht",
      learner: "Phomelelo Antonette Mahlatji",
      outcome: "C2",
    },
    {
      date: "28/02/2024",
      assessor: "Breyton Hannam",
      learner: "Masilo Prince Sani",
      outcome: "C3",
    },
    {
      date: "29/02/2024",
      assessor: "Nadine Engelbrecht",
      learner: "Mamogale Junecah Mmediwane",
      outcome: "C4",
    },
    {
      date: "13/05/2024",
      assessor: "Breyton Hannam",
      learner: "Shirley Takatso Maepa",
      outcome: "C5",
    },
  ];

  return (
    <ContentLayout title="Internal Verification Report">
      <BackButton />
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex mb-6 border-b">
          <button
            className={`px-4 py-2 ${
              activeTab === "verification"
                ? "font-bold border-b-2 border-blue-500"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("verification")}
          >
            Verification Report
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            LIMPOPO CHEFS ACADEMY
            <br />
            Internal Verification Report - Student Selection
          </h1>

          <div className="border rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="border-r p-3 bg-gray-50 font-medium w-1/3">
                    Registered Training Provider:
                  </td>
                  <td className="p-3">
                    LIMPOPO CHEFS ACADEMY
                    <div className="flex mt-2 space-x-4">
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full border border-gray-500 flex items-center justify-center mr-1">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        </div>
                        <span>Mokopane Campus</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full border border-gray-500 flex items-center justify-center mr-1">
                          <div className="h-2 w-2 rounded-full"></div>
                        </div>
                        <span>Polokwane Campus</span>
                      </div>
                    </div>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="border-r p-3 bg-gray-50 font-medium">
                    Accreditation Numbers:
                  </td>
                  <td className="p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div>
                        <p className="font-medium">City & Guilds Centre No:</p>
                        <p>848490</p>
                        <p>848490A</p>
                      </div>
                      <div>
                        <p className="font-medium">QCTO Accreditation No:</p>
                        <p>QCTO: SDP/16/0080</p>
                        <p>QCTO SDP01191205-1879</p>
                      </div>
                    </div>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="border-r p-3 bg-gray-50 font-medium">
                    Internal Qualification Code:
                  </td>
                  <td className="p-3">8064-06</td>
                </tr>

                <tr className="border-b">
                  <td className="border-r p-3 bg-gray-50 font-medium">
                    Assessment Type:
                  </td>
                  <td className="p-3">
                    <p className="font-medium">Formative & Summative:</p>
                    <p>
                      Test, Task, Final Theory Exam, Final Practical Exam,
                      Practical Menus
                    </p>
                  </td>
                </tr>

                <tr>
                  <td className="border-r p-3 bg-gray-50 font-medium">
                    Date of internal verification:
                  </td>
                  <td className="p-3">14/10/2024</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="my-8">
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Date</th>
                  <th className="border p-2 text-left">Assessor</th>
                  <th className="border p-2 text-left">Learner</th>
                  <th className="border p-2 text-left">
                    Learning Outcome/ Internal Assessment Criteria
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 1 ? "bg-gray-50" : ""}
                  >
                    <td className="border p-2">{student.date}</td>
                    <td className="border p-2">{student.assessor}</td>
                    <td className="border p-2">{student.learner}</td>
                    <td className="border p-2">{student.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 border rounded-lg p-4">
            <h3 className="font-bold mb-4">Internal verifier(s)</h3>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <p className="font-medium">Name:</p>
                <p>Chef Kelly Fowlds</p>
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
                <p>14/10/2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
