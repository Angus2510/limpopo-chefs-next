"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/formatDate";
import { GROUP_SUBJECTS_CONFIG, getIntakeCategory } from "@/utils/resultsSetup";

interface Result {
  id: string;
  dateTaken: Date;
  assignments?: {
    title: string;
    type: string;
  };
  outcome?: {
    title: string;
  };
  scores: number;
  percent: number;
  taskScore: number | null;
  testScore: number | null;
  status: string;
}

interface ResultsTabProps {
  results: Result[];
  intakeGroup: string;
}

export function ResultsTab({ results = [], intakeGroup }: ResultsTabProps) {
  const intakeCategory = getIntakeCategory(intakeGroup);
  const subjects = GROUP_SUBJECTS_CONFIG[intakeCategory]?.subjects || [];

  // Create a map of the latest results for each subject
  const latestResults = new Map();
  results.forEach((result) => {
    if (!result) return;

    const title = result.assignments?.title || result.outcome?.title;
    if (!title) return;

    const existing = latestResults.get(title);
    if (
      !existing ||
      new Date(result.dateTaken) > new Date(existing.dateTaken)
    ) {
      latestResults.set(title, result);
    }
  });

  const getCompetencyStatus = (percent: number) => {
    return percent >= 40 ? "Competent" : "Not Competent";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Results - {intakeCategory}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Mark
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Mark
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outcome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjects.map((subject) => {
                const result = latestResults.get(subject.title);
                return (
                  <tr
                    key={subject.title}
                    className={!result ? "bg-gray-50" : undefined}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {subject.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {subject.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result?.dateTaken ? formatDate(result.dateTaken) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result?.testScore ?? "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result?.taskScore ?? "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result ? (
                        <span
                          className={`font-bold ${
                            (result.percent || 0) >= 40
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {result.percent ?? result.scores ?? "-"}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            getCompetencyStatus(result.percent || 0) ===
                            "Competent"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getCompetencyStatus(result.percent || 0)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            result.status === "marked"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {result.status || "Pending"}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
