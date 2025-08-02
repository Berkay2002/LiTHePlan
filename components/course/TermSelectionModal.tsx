import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, GraduationCap } from "lucide-react";
import { Course } from "@/types/course";

interface TermSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  availableTerms: (7 | 8 | 9)[];
  onTermSelected: (course: Course, selectedTerm: 7 | 8 | 9) => void;
}

export function TermSelectionModal({
  isOpen,
  onClose,
  course,
  availableTerms,
  onTermSelected
}: TermSelectionModalProps) {
  const [selectedTerm, setSelectedTerm] = useState<7 | 8 | 9 | null>(null);

  const handleConfirm = () => {
    if (course && selectedTerm) {
      onTermSelected(course, selectedTerm);
      onClose();
      setSelectedTerm(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedTerm(null);
  };

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Select Term for Course
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Course Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{course.name}</h3>
                <p className="text-sm text-muted-foreground">{course.id}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    <span>{course.credits} credits</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{course.campus}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Term Selection */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              This course is available in multiple terms. Which term would you like to add it to?
            </h4>
            
            <div className="grid gap-2">
              {availableTerms.map((term) => (
                <Button
                  key={term}
                  variant={selectedTerm === term ? "default" : "outline"}
                  className="justify-start h-auto p-4"
                  onClick={() => setSelectedTerm(term)}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Term {term}</div>
                      <div className="text-sm text-muted-foreground">
                        {term === 7 ? "First Year" : term === 8 ? "Second Year" : "Third Year"}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              className="flex-1"
              disabled={!selectedTerm}
            >
              Add to Term {selectedTerm}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 