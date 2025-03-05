"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AddressInfoProps {
  address: {
    street1?: string;
    street2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
}

export function AddressInfo({ address = {} }: AddressInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Information</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{address?.street1 || "N/A"}</p>
        {address?.street2 && <p>{address.street2}</p>}
        <p>
          {[address?.city, address?.province, address?.postalCode]
            .filter(Boolean)
            .join(", ")}
        </p>
        <p>{address?.country || "N/A"}</p>
      </CardContent>
    </Card>
  );
}
