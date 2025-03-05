"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/formatDate";

interface ResultsTabProps {
  results: any[];
}

export function ResultsTab({ results }: ResultsTabProps) {
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
                    Score
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
                      {result.assignments?.title || "Unknown Assignment"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result.percent !== null &&
                      result.percent !== undefined &&
                      result.percent !== 0
                        ? `${result.percent}%`
                        : result.scores !== null && result.scores !== undefined
                        ? `${result.scores}%`
                        : "No score"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result.status || "Pending"}
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
