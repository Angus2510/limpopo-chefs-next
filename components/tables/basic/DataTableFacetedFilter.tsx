import * as React from 'react';
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import type { Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Option } from "@/types/tables/basic/options";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title: string;
  options: Option[];
  selectedValues: string[];
  setSelectedValues: (values: string[]) => void;
  filterKey: string;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  selectedValues,
  setSelectedValues,
  filterKey,
}: DataTableFacetedFilterProps<TData, TValue>) {
  
  console.log(`Selected Values for ${filterKey}:`, selectedValues);

  const handleSelect = (optionTitle: string) => {
    const updatedSelectedValues = selectedValues.includes(optionTitle)
      ? selectedValues.filter(value => value !== optionTitle)
      : [...selectedValues, optionTitle];
  
    console.log('Updated selected values:', updatedSelectedValues);
    setSelectedValues(updatedSelectedValues);
    column?.setFilterValue(updatedSelectedValues.length ? updatedSelectedValues : undefined);
  };

  const handleClearFilters = () => {
    setSelectedValues([]);
    column?.setFilterValue(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <PlusCircledIcon className="mr-2 size-4" />
          {title}
          {selectedValues.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.length > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.length} selected
                  </Badge>
                ) : (
                  options
                    .filter(option => selectedValues.includes(option.title))
                    .map(option => (
                      <Badge
                        variant="secondary"
                        key={option.title}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.title}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[12.5rem] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${title}`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(option => {
                const isSelected = selectedValues.includes(option.title);

                return (
                  <CommandItem
                    key={option.title}
                    onSelect={() => handleSelect(option.title)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="size-4" aria-hidden="true" />
                    </div>
                    <span>{option.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClearFilters}
                    className="justify-center text-center cursor-pointer hover:bg-gray-100"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
