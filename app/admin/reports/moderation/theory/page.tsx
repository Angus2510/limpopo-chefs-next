"use client";
import { useState } from "react";
import { ContentLayout } from "@/components/layout/content-layout";
import BackButton from "@/components/common/BackButton";

export default function TheoryModerationReport() {
  const [activeTab, setActiveTab] = useState(0);

  // Report data for each tab
  const reports = [
    {
      date: "01/05/2024",
      students: [
        {
          no: "1.",
          name: "Mamogale Junecah Mmediwane",
          unit: "03:01",
          mark: "92",
          moderatedMark: "92",
        },
        {
          no: "2.",
          name: "Shirley Takatso Maepa",
          unit: "03:01",
          mark: "88",
          moderatedMark: "88",
        },
        {
          no: "3.",
          name: "Tshegofatso Rachel Nkgweng",
          unit: "03:02",
          mark: "85",
          moderatedMark: "85",
        },
        {
          no: "4.",
          name: "Lesetja Jeaniffer Teffo",
          unit: "03:02",
          mark: "93",
          moderatedMark: "93",
        },
      ],
    },
    {
      date: "22/05/2024",
      students: [
        {
          no: "1.",
          name: "Ntokozo Charmaine Banda",
          unit: "03:03",
          mark: "80",
          moderatedMark: "80",
        },
        {
          no: "2.",
          name: "Diarora Ngoanamosadi Mashoene",
          unit: "03:03",
          mark: "85",
          moderatedMark: "85",
        },
        {
          no: "3.",
          name: "Tshegofatso Boshego",
          unit: "03:04",
          mark: "65",
          moderatedMark: "65",
        },
        {
          no: "4.",
          name: "Padima Alfred Ramaano",
          unit: "03:04",
          mark: "72",
          moderatedMark: "72",
        },
      ],
    },
    {
      date: "21/06/2024",
      students: [
        {
          no: "1.",
          name: "Tumisho Moshohli Shai",
          unit: "03:05",
          mark: "92",
          moderatedMark: "92",
        },
        {
          no: "2.",
          name: "Phomelelo Antonette Mahlatji",
          unit: "03:05",
          mark: "88",
          moderatedMark: "88",
        },
        {
          no: "3.",
          name: "Masilo Prince Sani",
          unit: "03:06",
          mark: "71",
          moderatedMark: "71",
        },
        {
          no: "4.",
          name: "Mamogale Junecah Mmediwane",
          unit: "03:06",
          mark: "71",
          moderatedMark: "71",
        },
      ],
    },
    {
      date: "03/09/2024",
      students: [
        {
          no: "1.",
          name: "Mamogale Junecah Mmediwane",
          unit: "03:07",
          mark: "79",
          moderatedMark: "79",
        },
        {
          no: "2.",
          name: "Shirley Takatso Maepa",
          unit: "03:07",
          mark: "72",
          moderatedMark: "72",
        },
        {
          no: "3.",
          name: "Tshegofatso Rachel Nkgweng",
          unit: "3rd Year Task",
          mark: "75",
          moderatedMark: "75",
        },
        {
          no: "4.",
          name: "Lesetja Jeaniffer Teffo",
          unit: "3rd Year Task",
          mark: "80",
          moderatedMark: "80",
        },
      ],
    },
  ];

  // Report header component - reused across all tabs
  const ReportHeader = ({ date }) => (
    <div className="border rounded-lg overflow-hidden mb-6">
      <table className="w-full">
        <tbody>
          <tr className="border-b">
            <td
              colSpan={2}
              className="p-3 bg-blue-50 text-center font-bold text-lg"
            >
              LIMPOPO CHEFS ACADEMY Internal Moderation Report
            </td>
          </tr>
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
              <div className="flex space-x-6">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full border border-gray-500 flex items-center justify-center mr-1">
                    <div className="h-2 w-2 rounded-full"></div>
                  </div>
                  <span>FORMATIVE</span>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full border border-gray-500 flex items-center justify-center mr-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  </div>
                  <span>SUMMATIVE</span>
                </div>
              </div>
            </td>
          </tr>

          <tr className="border-b">
            <td className="border-r p-3 bg-gray-50 font-medium">
              Date of internal verification:
            </td>
            <td className="p-3">{date}</td>
          </tr>

          <tr>
            <td className="border-r p-3 bg-gray-50 font-medium">
              Moderated by -- Name & Surname:
              <br />
              Moderator Registration Number:
            </td>
            <td className="p-3">
              Kelly Fowlds
              <br />
              613/A/00525/2020
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // Student table component
  const StudentTable = ({ students }) => (
    <div className="mb-6">
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left w-12">No.</th>
            <th className="border p-2 text-left">Student Name & Surname</th>
            <th className="border p-2 text-center">Unit No:</th>
            <th className="border p-2 text-center">Combined Mark Obtained</th>
            <th className="border p-2 text-center">Combined Moderated Mark</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={index} className={index % 2 === 1 ? "bg-gray-50" : ""}>
              <td className="border p-2">{student.no}</td>
              <td className="border p-2">{student.name}</td>
              <td className="border p-2 text-center">{student.unit}</td>
              <td className="border p-2 text-center">{student.mark}</td>
              <td className="border p-2 text-center">
                {student.moderatedMark}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Internal moderator signature section
  const ModeratorSignature = ({ date }) => (
    <div className="border rounded-lg p-4 mb-8">
      <h3 className="font-bold mb-4">Internal Moderator</h3>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <p className="font-medium">Name:</p>
          <p>Kelly Fowlds</p>
        </div>
        <div>
          <p className="font-medium">Signature:</p>
          <div className="bg-gray-100 p-4 rounded-lg h-16 w-32 flex items-center justify-center">
            <p className="text-gray-500 italic text-sm">Digital Signature</p>
          </div>
        </div>
        <div>
          <p className="font-medium">Date:</p>
          <p>{date}</p>
        </div>
      </div>
    </div>
  );

  return (
    <ContentLayout title="Theory Moderation Reports">
      <BackButton />
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          Theory Moderation Reports
        </h1>

        {/* Tab navigation */}
        <div className="flex flex-wrap mb-6 border-b">
          {reports.map((report, index) => (
            <button
              key={index}
              className={`px-4 py-2 mb-2 ${
                activeTab === index
                  ? "font-bold border-b-2 border-blue-500"
                  : "text-gray-600"
              }`}
              onClick={() => setActiveTab(index)}
            >
              Report {index + 1} - {report.date}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          <ReportHeader date={reports[activeTab].date} />
          <StudentTable students={reports[activeTab].students} />
          <ModeratorSignature date={reports[activeTab].date} />
        </div>
      </div>
    </ContentLayout>
  );
}
