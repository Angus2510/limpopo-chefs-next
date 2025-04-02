"use client";

import { useEffect, useState } from "react";
import { getWels } from "@/lib/actions/wels/establishments";

interface WelLocation {
  id: string;
  title: string;
  location: string;
}

interface WelLocationSelectProps {
  onSelect: (welId: string) => void;
  selectedWel?: string;
}

const WelLocationSelect = ({
  onSelect,
  selectedWel,
}: WelLocationSelectProps) => {
  const [wels, setWels] = useState<WelLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWels = async () => {
      try {
        const welData = await getWels();
        setWels(welData);
      } catch (error) {
        console.error("Error fetching WEL locations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWels();
  }, []);

  if (loading) return <div>Loading WEL locations...</div>;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select WEL Location
      </label>
      <select
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        onChange={(e) => onSelect(e.target.value)}
        value={selectedWel}
      >
        <option value="">Select a WEL location</option>
        {wels.map((wel) => (
          <option key={wel.id} value={wel.id}>
            {wel.title} - {wel.location}
          </option>
        ))}
      </select>
    </div>
  );
};

export default WelLocationSelect;
