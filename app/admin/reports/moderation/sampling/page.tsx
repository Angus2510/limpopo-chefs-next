"use client";
import { useState } from "react";
import BackButton from "@/components/common/BackButton";
import { ContentLayout } from "@/components/layout/content-layout";

export default function SamplingPlan() {
  const [searchTerm, setSearchTerm] = useState("");

  const samplingData = [
    {
      date: "15/04/2024",
      assessor: "Breyton Hannam",
      learner: "Mamogale Junecah Mmediwane",
      unit: "03:01 (306)",
    },
    {
      date: "22/04/2024",
      assessor: "Raiyen Chetty",
      learner: "Shirley Takatso Maepa",
      unit: "03:02 (302)",
    },
    {
      date: "29/04/2024",
      assessor: "Raiyen Chetty",
      learner: "Tshegofatso Rachel Nkgweng",
      unit: "03:03 (303)",
    },
    {
      date: "06/05/2024",
      assessor: "Nadine Engelbrecht",
      learner: "Lesetja Jeaniffer Teffo",
      unit: "03:04 (304)",
    },
    {
      date: "13/05/2024",
      assessor: "Breyton Hannam",
      learner: "Ntokozo Charmaine Banda",
      unit: "03:05 (301)",
    },
    {
      date: "03/06/2024",
      assessor: "Raiyen Chetty",
      learner: "Diarora Ngoanamosadi Mashoene",
      unit: "03:06",
    },
    {
      date: "20/08/2024",
      assessor: "Raiyen Chetty",
      learner: "Tshegofatso Boshego",
      unit: "03:07",
    },
    {
      date: "01/07/2024",
      assessor: "Nadine Engelbrecht",
      learner: "Padima Alfred Ramaano",
      unit: "3rd Year Task",
    },
    {
      date: "01/05/2024",
      assessor: "Breyton Hannam",
      learner: "Tumisho Moshohli Shai",
      unit: "C1",
    },
    {
      date: "08/05/2024",
      assessor: "Nadine Engelbrecht",
      learner: "Phomelelo Antonette Mahlatji",
      unit: "C2",
    },
    {
      date: "28/02/2024",
      assessor: "Breyton Hannam",
      learner: "Masilo Prince Sani",
      unit: "C3",
    },
    {
      date: "29/02/2024",
      assessor: "Nadine Engelbrecht",
      learner: "Mamogale Junecah Mmediwane",
      unit: "C4",
    },
    {
      date: "13/05/2024",
      assessor: "Breyton Hannam",
      learner: "Shirley Takatso Maepa",
      unit: "C5",
    },
  ];

  const filteredData = samplingData.filter(
    (item) =>
      item.learner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assessor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.includes(searchTerm)
  );

  return (
    <ContentLayout title="Sampling Plan">
      <BackButton />
      <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Sampling Plan 8064-06
          </h1>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Qualification Title and Number:
            </h2>
            <p className="text-lg">
              8064-06 Advance Diploma in Culinary Arts & Supervision
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Campus:</h2>
            <p className="text-lg">Limpopo Chefs Academy Polokwane</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by learner, assessor, unit..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                onClick={() => setSearchTerm("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Assessor
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Learner
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Unit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.assessor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.learner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No results found for &quot;{searchTerm}&quot;
          </div>
        )}

        <div className="mt-6 text-right text-sm text-gray-500">
          Last updated: Jan 2022
        </div>
      </div>
    </ContentLayout>
  );
}
