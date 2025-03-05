"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Guardian {
  id: string;
  firstName?: string;
  lastName?: string;
  relation?: string;
  email?: string;
  mobileNumber?: string;
}

interface GuardianInfoProps {
  guardians: Guardian[];
}

export function GuardianInfo({ guardians = [] }: GuardianInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Guardian Information</CardTitle>
      </CardHeader>
      <CardContent>
        {guardians && guardians.length > 0 ? (
          <div className="space-y-6">
            {guardians.map((guardian, index) => (
              <div
                key={guardian.id || index}
                className="border-t pt-4 first:border-0 first:pt-0"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p>
                      {guardian.firstName || ""} {guardian.lastName || ""}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Relationship
                    </h3>
                    <p>{guardian.relation || "N/A"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p>{guardian.email || "N/A"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p>{guardian.mobileNumber || "N/A"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No guardians listed</p>
        )}
      </CardContent>
    </Card>
  );
}
