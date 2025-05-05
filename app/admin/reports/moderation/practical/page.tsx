"use client";
import { useState } from "react";
import { ContentLayout } from "@/components/layout/content-layout";
import BackButton from "@/components/common/BackButton";

export default function ModerationReport() {
  const [activeTab, setActiveTab] = useState("report");

  return (
    <ContentLayout title="Moderation Report">
      <BackButton />
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex mb-6 border-b">
          <button
            className={`px-4 py-2 ${
              activeTab === "report"
                ? "font-bold border-b-2 border-blue-500"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("report")}
          >
            Moderation Report
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            LIMPOPO CHEFS ACADEMY Internal Moderation Report
          </h1>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="border-r p-3 bg-gray-50 font-medium w-1/3">
                    Registered Training Provider:
                  </td>
                  <td className="p-3">
                    LIMPOPO CHEFS ACADEMY
                    <div className="flex mt-2 space-x-2">
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
                    <div className="grid grid-cols-2">
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
                  <td className="p-3">26/07/2024</td>
                </tr>

                <tr className="border-b">
                  <td className="border-r p-3 bg-gray-50 font-medium">
                    Moderated by -- Name & Surname:
                  </td>
                  <td className="p-3">Kelly Fowlds</td>
                </tr>

                <tr>
                  <td className="border-r p-3 bg-gray-50 font-medium">
                    Moderator Registration Number:
                  </td>
                  <td className="p-3">613/A/00525/2020</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="my-8">
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left w-16">No.</th>
                  <th className="border p-2 text-left">
                    Student Name & Surname
                  </th>
                  <th className="border p-2 text-center">Unit No:</th>
                  <th className="border p-2 text-center">
                    Combined Mark Obtained
                  </th>
                  <th className="border p-2 text-center">
                    Combined Moderated Mark
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">1.</td>
                  <td className="border p-2">Mamogale Junecah Mmediwane</td>
                  <td className="border p-2 text-center">C1</td>
                  <td className="border p-2 text-center">84</td>
                  <td className="border p-2 text-center">84</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border p-2">2.</td>
                  <td className="border p-2">Shirley Takatso Maepa</td>
                  <td className="border p-2 text-center">C1</td>
                  <td className="border p-2 text-center">92</td>
                  <td className="border p-2 text-center">92</td>
                </tr>
                <tr>
                  <td className="border p-2">3.</td>
                  <td className="border p-2">Tshegofatso Rachel Nkgweng</td>
                  <td className="border p-2 text-center">C2</td>
                  <td className="border p-2 text-center">91</td>
                  <td className="border p-2 text-center">91</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border p-2">4.</td>
                  <td className="border p-2">Lesetja Jeaniffer Teffo</td>
                  <td className="border p-2 text-center">C2</td>
                  <td className="border p-2 text-center">98</td>
                  <td className="border p-2 text-center">98</td>
                </tr>
                <tr>
                  <td className="border p-2">5.</td>
                  <td className="border p-2">Ntokozo Charmaine Banda</td>
                  <td className="border p-2 text-center">C3</td>
                  <td className="border p-2 text-center">91</td>
                  <td className="border p-2 text-center">91</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border p-2">6.</td>
                  <td className="border p-2">Diarora Ngoanamosadi Mashoene</td>
                  <td className="border p-2 text-center">C3</td>
                  <td className="border p-2 text-center">95</td>
                  <td className="border p-2 text-center">95</td>
                </tr>
                <tr>
                  <td className="border p-2">7.</td>
                  <td className="border p-2">Tshegofatso Boshego</td>
                  <td className="border p-2 text-center">C4</td>
                  <td className="border p-2 text-center">89</td>
                  <td className="border p-2 text-center">89</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border p-2">8.</td>
                  <td className="border p-2">Padima Alfred Ramaano</td>
                  <td className="border p-2 text-center">C4</td>
                  <td className="border p-2 text-center">95</td>
                  <td className="border p-2 text-center">95</td>
                </tr>
                <tr>
                  <td className="border p-2">9.</td>
                  <td className="border p-2">Tumisho Moshohli Shai</td>
                  <td className="border p-2 text-center">C5</td>
                  <td className="border p-2 text-center">79</td>
                  <td className="border p-2 text-center">79</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border p-2">10.</td>
                  <td className="border p-2">Phomelelo Antonette Mahlatji</td>
                  <td className="border p-2 text-center">C5</td>
                  <td className="border p-2 text-center">77</td>
                  <td className="border p-2 text-center">77</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 border rounded-lg p-4">
            <h3 className="font-bold mb-4">Internal Moderator</h3>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <p className="font-medium">Name:</p>
                <p>Kelly Fowlds</p>
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
                <p>26/07/2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
