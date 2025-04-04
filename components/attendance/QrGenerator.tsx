"use client";

import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DatePicker from "@/components/common/DatePicker";
import { MultiSelect } from "@/components/common/multiselect";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllIntakeGroups } from "@/lib/actions/intakegroup/intakeGroups";
import { getAllCampuses } from "@/lib/actions/campus/campuses";
import { useForm, FormProvider } from "react-hook-form";
import { getAllOutcomes } from "@/lib/actions/intakegroup/outcome/outcomeQuery";
import { toast } from "@/components/ui/use-toast";
import {
  createAttendanceQR,
  type AttendanceQRCode,
} from "@/lib/actions/attendance/attendanceCrud";

interface FormData {
  date: string;
  campusId: string;
  intakeGroupIds: string[];
  outcomeId: string;
}

const QRGenerator = () => {
  const [intakeGroups, setIntakeGroups] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [campuses, setCampuses] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [outcomes, setOutcomes] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const methods = useForm<FormData>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      campusId: "",
      intakeGroupIds: [],
      outcomeId: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsData, campusesData, outcomesData] = await Promise.all([
          getAllIntakeGroups(),
          getAllCampuses(),
          getAllOutcomes(),
        ]);
        setIntakeGroups(groupsData);
        setCampuses(campusesData);
        setOutcomes(outcomesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Failed to load required data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateQRCode = async (data: FormData) => {
    const now = new Date();
    const selectedCampus = campuses.find(
      (campus) => campus.id === data.campusId
    );
    const selectedGroups = intakeGroups.filter((group) =>
      data.intakeGroupIds.includes(group.id)
    );
    const selectedOutcome = outcomes.find(
      (outcome) => outcome.id === data.outcomeId
    );

    if (!selectedCampus || selectedGroups.length === 0 || !selectedOutcome)
      return;

    const qrData = {
      data: {
        campusId: selectedCampus.id,
        campusTitle: selectedCampus.title,
        intakeGroups: selectedGroups,
        outcome: {
          id: selectedOutcome.id,
          title: selectedOutcome.title,
        },
        date: data.date,
        timestamp: now.toISOString(),
      },
    };

    try {
      const result = await createAttendanceQR(qrData);
      if (result.success) {
        setGeneratedQR(JSON.stringify(qrData.data));
        toast({
          title: "Success",
          description: "QR code generated successfully",
        });
        methods.reset();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Generate Attendance QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(generateQRCode)}
            className="space-y-6"
          >
            <FormField
              control={methods.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <DatePicker control={methods.control} name="date" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="campusId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campus</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campus" />
                    </SelectTrigger>
                    <SelectContent>
                      {campuses.map((campus) => (
                        <SelectItem key={campus.id} value={campus.id}>
                          {campus.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="intakeGroupIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intake Groups</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={intakeGroups.map((group) => ({
                        label: group.title,
                        value: group.id,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select intake groups"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="outcomeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outcome</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={outcomes.map((outcome) => ({
                        label: outcome.title,
                        value: outcome.id,
                      }))}
                      value={field.value ? [field.value] : []}
                      onValueChange={(values) =>
                        field.onChange(values[0] || "")
                      }
                      placeholder="Select outcome"
                      maxSelected={1}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={
                !methods.watch("campusId") ||
                methods.watch("intakeGroupIds").length === 0 ||
                !methods.watch("outcomeId")
              }
            >
              Generate QR Code
            </Button>
          </form>
        </FormProvider>

        {generatedQR && (
          <div className="mt-6 flex flex-col items-center space-y-4">
            <QRCodeCanvas
              value={generatedQR}
              size={200}
              level="H"
              includeMargin
              className="border p-2"
            />
            <p className="text-sm text-muted-foreground">
              Scan this QR code to mark attendance
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRGenerator;
