"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/formatDate";

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
}

export function ResultsTab({ results }: ResultsTabProps) {
  const getCompetencyStatus = (percent: number) => {
    return percent >= 40 ? "Competent" : "Not Competent";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Results</CardTitle>
      </CardHeader>
      <CardContent>
        {results && results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessment
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
                {results.map((result, index) => (
                  <tr key={result.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(result.dateTaken)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {result.assignments?.title ||
                        result.outcome?.title ||
                        "Unknown Assessment"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result.testScore !== null ? result.testScore : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result.taskScore !== null ? result.taskScore : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`font-bold ${
                          (result.percent || 0) >= 40
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {result.percent
                          ? `${result.percent}%`
                          : result.scores
                          ? `${result.scores}%`
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          result.status === "marked"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {result.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No results available</p>
        )}
      </CardContent>
    </Card>
  );
}
