"use client";

interface InfoFieldProps {
  label: string;
  value?: string | null;
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <p>{value || "N/A"}</p>
    </div>
  );
}

interface InfoGridProps {
  fields: Array<{
    label: string;
    value?: string | null;
  }>;
  columns?: number;
}

export function InfoGrid({ fields, columns = 2 }: InfoGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {fields.map((field, index) => (
        <InfoField key={index} label={field.label} value={field.value} />
      ))}
    </div>
  );
}
