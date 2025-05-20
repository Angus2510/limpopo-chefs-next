"use client";
import React, { useState, useEffect } from "react";
import { getWels } from "@/lib/actions/wels/establishments"; // Assuming this action fetches all WELs
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { WELDetailDialog } from "@/components/wels/WELDetailDialog"; // Assuming this component is reusable
import { ContentLayout } from "@/components/layout/content-layout";
import { Button } from "@/components/ui/button"; // For a "View Details" button if needed, or remove if card click is enough

// Define the WEL interface (can be moved to a shared types file if used elsewhere)
export interface WEL {
  id: string;
  title: string;
  location: string;
  description?: string;
  accommodation: boolean;
  note?: string;
  photoPath: string[];
  dateUploaded: Date; // Assuming this is part of your WEL data
  // Removed 'available' and 'v' if not needed for display
}

export default function StudentWelLocationsPage() {
  const { toast } = useToast();
  const [wels, setWels] = useState<WEL[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWel, setSelectedWel] = useState<WEL | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchWelLocations();
  }, []);

  const fetchWelLocations = async () => {
    setLoading(true);
    try {
      const data = await getWels();
      if (data) {
        // Sort data alphabetically by title before setting state
        const sortedData = [...data].sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        setWels(sortedData as WEL[]); // Adjust casting if your getWels returns a slightly different type
      }
    } catch (error) {
      console.error("Error fetching WEL locations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch WEL locations. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (wel: WEL) => {
    setSelectedWel(wel);
    setIsDetailOpen(true);
  };

  if (loading) {
    return (
      <ContentLayout title="W.E.L Locations">
        <div className="container mx-auto py-6 text-center">
          <p>Loading W.E.L locations...</p>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="W.E.L Locations">
      <div className="container mx-auto py-6 space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Work Experience Learning Locations
        </h1>

        {wels.length === 0 && !loading && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No W.E.L locations are currently listed.
              </p>
            </CardContent>
          </Card>
        )}

        {wels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wels.map((wel) => (
              <Card
                key={wel.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 ease-in-out flex flex-col"
                onClick={() => handleCardClick(wel)}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{wel.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground mb-2">{wel.location}</p>
                  {wel.description && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                      {wel.description}
                    </p>
                  )}
                  <div className="mt-auto">
                    {/* Accommodation badge removed */}
                  </div>
                </CardContent>
                {/* Optional: Add a footer or a specific "View Details" button if card click isn't obvious enough */}
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleCardClick(wel)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <WELDetailDialog
        wel={selectedWel}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedWel(null);
        }}
      />
    </ContentLayout>
  );
}
