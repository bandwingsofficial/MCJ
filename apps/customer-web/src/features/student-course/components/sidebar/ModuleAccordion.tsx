"use client";

import {
  ChevronDown,
  Layers3,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/shared/components/ui/accordion";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";

import { LessonItem } from "@/src/features/student-course/components/sidebar/LessonItem";

import type {
  Lesson,
} from "@/src/features/student-course/types/lesson.types";

import type {
  CourseModule,
} from "@/src/features/student-course/types/module.types";

interface ModuleAccordionProps {
  modules: CourseModule[];

  selectedLessonId?: string;

  onLessonSelect: (
    lesson: Lesson,
  ) => void;
}

export function ModuleAccordion({
  modules,
  selectedLessonId,
  onLessonSelect,
}: ModuleAccordionProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b p-5">
        <h2 className="text-lg font-semibold">
          Course Content
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {modules.length} Modules
        </p>
      </div>

      <Accordion
        type="multiple"
        className="w-full"
      >
        {modules.map(
          (module) => (
            <AccordionItem
              key={module.id}
              value={module.id}
            >
              <AccordionTrigger className="px-5">
                <div className="flex w-full items-center justify-between pr-3">
                  <div className="flex items-center gap-3">
                    <Layers3 className="h-5 w-5 text-primary" />

                    <div className="text-left">
                      <p className="font-medium">
                        {module.title}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {
                          module.lessons
                            .length
                        }{" "}
                        Lessons
                      </p>
                    </div>
                  </div>

                  <Badge variant="info">
                    {
                      module.lessons
                        .length
                    }
                  </Badge>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="space-y-4 px-5 pb-5">
                  {module.description && (
                    <p className="text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  )}

                  {module.keySkills.length >
                    0 && (
                    <div className="flex flex-wrap gap-2">
                      {module.keySkills.map(
                        (
                          skill,
                        ) => (
                          <Badge
                            key={
                              skill
                            }
                            variant="default"
                          >
                            {skill}
                          </Badge>
                        ),
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    {module.lessons.map(
                      (
                        lesson,
                      ) => (
                        <LessonItem
                          key={
                            lesson.id
                          }
                          lesson={
                            lesson
                          }
                          isActive={
                            lesson.id ===
                            selectedLessonId
                          }
                          onSelect={
                            onLessonSelect
                          }
                        />
                      ),
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ),
        )}
      </Accordion>
    </Card>
  );
}