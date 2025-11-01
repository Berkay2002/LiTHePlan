import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProgramsListProps {
  programs: string[];
  orientations?: string[];
  className?: string;
}

export function ProgramsList({ programs, orientations = [], className = "" }: ProgramsListProps) {
  const allItems = [...programs, ...orientations];
  
  if (allItems.length === 0) return null;

  // Use accordion for 12+ items, otherwise show simple grid
  const useAccordion = allItems.length >= 12;

  if (!useAccordion) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {allItems.map((item, index) => (
          <Badge
            key={`${item}-${index}`}
            variant="secondary"
            className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 hover:border-primary/30 transition-all duration-200 px-3 py-1.5 text-sm font-medium"
          >
            {item}
          </Badge>
        ))}
      </div>
    );
  }

  // Split into chunks for accordion
  const chunkSize = Math.ceil(allItems.length / 3);
  const chunks = [
    allItems.slice(0, chunkSize),
    allItems.slice(chunkSize, chunkSize * 2),
    allItems.slice(chunkSize * 2),
  ].filter(chunk => chunk.length > 0);

  return (
    <Accordion
      type="single"
      collapsible
      className={`w-full ${className}`}
      defaultValue="programs-0"
    >
      {chunks.map((chunk, chunkIndex) => (
        <AccordionItem key={`chunk-${chunkIndex}`} value={`programs-${chunkIndex}`}>
          <AccordionTrigger>
            {chunkIndex === 0 ? "Programs" : `More Programs`} ({chunk.length})
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-2">
              {chunk.map((item, index) => (
                <Badge
                  key={`${item}-${index}`}
                  variant="secondary"
                  className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 hover:border-primary/30 transition-all duration-200 px-3 py-1.5 text-sm font-medium"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
