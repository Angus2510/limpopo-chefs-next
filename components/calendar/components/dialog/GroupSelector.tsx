import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IntakeGroup } from "../../types";

interface GroupSelectorProps {
  intakeGroups: IntakeGroup[];
  selectedGroups: string[];
  onChange: (groups: string[]) => void;
}

export function GroupSelector({
  intakeGroups,
  selectedGroups,
  onChange,
}: GroupSelectorProps) {
  const toggleGroup = (groupId: string) => {
    onChange(
      selectedGroups.includes(groupId)
        ? selectedGroups.filter((id) => id !== groupId)
        : [...selectedGroups, groupId]
    );
  };

  return (
    <div className="grid gap-2">
      <Label>Groups</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="justify-between w-full"
          >
            {selectedGroups.length > 0
              ? `${selectedGroups.length} selected`
              : "Select groups"}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search groups..." />
            <CommandEmpty>No group found.</CommandEmpty>
            <ScrollArea className="h-[200px]">
              <CommandGroup>
                {intakeGroups.map((group) => (
                  <CommandItem
                    key={group.id}
                    onSelect={() => toggleGroup(group.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedGroups.includes(group.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {group.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-1">
        {selectedGroups.map((groupId) => {
          const group = intakeGroups.find((g) => g.id === groupId);
          return group ? (
            <Badge
              key={groupId}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleGroup(groupId)}
            >
              {group.title}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ) : null;
        })}
      </div>
    </div>
  );
}
