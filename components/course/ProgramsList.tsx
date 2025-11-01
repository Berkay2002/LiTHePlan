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

  // Use accordion for 12+ items, otherwise show simple list
  const useAccordion = allItems.length >= 12;

  if (!useAccordion) {
    return (
      <ul className={`grid sm:grid-cols-2 gap-2 ${className}`}>
        {allItems.map((item, index) => (
          <li key={`${item}-${index}`} className="text-sm flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
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
            <ul className="grid sm:grid-cols-2 gap-2 pt-2">
              {chunk.map((item, index) => (
                <li key={`${item}-${index}`} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
