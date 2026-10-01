"use client";



import type { ReactNode } from "react";

import { BookOpen, ChevronDown, Radio } from "lucide-react";



import { SyllabusModuleAccordion } from "@/src/features/learning/components/syllabus/syllabus-module-accordion";

import type {

  LearningContentMode,

  ModuleTreeDto,

  StudentLearningAccessDto,

} from "@/src/features/learning/types/learning.types";

import type {

  ModeModuleExpansionState,

  ModeNavigationState,

} from "@/src/features/learning/utils/learning-mode-navigation.utils";

import type { ProgressMap } from "@/src/features/learning/utils/progress.utils";

import { cn } from "@/src/shared/lib/cn";



interface Props {

  courseId: string;

  courseTitle: string;

  modules: ModuleTreeDto[];

  progressMap: ProgressMap;

  learningAccess: StudentLearningAccessDto;

  activeMode: LearningContentMode;

  openMode: LearningContentMode | null;

  selectedLessonByMode: ModeNavigationState;

  expandedModuleByMode: ModeModuleExpansionState;

  onToggleOpenMode: (mode: LearningContentMode) => void;

  onToggleModule: (mode: LearningContentMode, moduleId: string) => void;

  onSelectLesson: (

    mode: LearningContentMode,

    lessonId: string,

    moduleId: string,

  ) => void;

}



interface ModeSectionProps {

  title: string;

  subtitle: string;

  icon: typeof Radio;

  isAvailable: boolean;

  isOpen: boolean;

  isActive: boolean;

  onHeaderClick: () => void;

  children: ReactNode;

}



function ModeSection({

  title,

  subtitle,

  icon: Icon,

  isAvailable,

  isOpen,

  isActive,

  onHeaderClick,

  children,

}: ModeSectionProps) {

  if (!isAvailable) {

    return null;

  }



  return (

    <div

      className={cn(

        "overflow-hidden rounded-lg border transition-colors",

        isOpen

          ? "border-violet-200/80 bg-gradient-to-b from-violet-50/80 to-white shadow-sm"

          : "border-slate-200/80 bg-slate-50/40 hover:border-slate-300",

      )}

    >

      <button

        type="button"

        onClick={onHeaderClick}

        className={cn(

          "flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors",

          isActive && isOpen && "bg-violet-50/50",

        )}

      >

        <span

          className={cn(

            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",

            isOpen

              ? "border-violet-200 bg-white text-violet-600"

              : "border-slate-200 bg-white text-slate-500",

          )}

        >

          <Icon className="h-3.5 w-3.5" />

        </span>

        <span className="min-w-0 flex-1">

          <span className="flex items-center justify-between gap-2">

            <span

              className={cn(

                "text-sm font-semibold leading-tight",

                isOpen ? "text-[#0B1F3A]" : "text-slate-800",

              )}

            >

              {title}

            </span>

            <ChevronDown

              className={cn(

                "h-4 w-4 shrink-0 text-slate-400 transition-transform",

                isOpen && "rotate-180 text-violet-500",

              )}

            />

          </span>

          <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">

            {subtitle}

          </span>

        </span>

      </button>



      {isOpen ? (

        <div className="border-t border-violet-100/80 px-2 pb-2 pt-1">

          {children}

        </div>

      ) : null}

    </div>

  );

}



export function LearningCourseSidebar({

  courseId,

  courseTitle,

  modules,

  progressMap,

  learningAccess,

  activeMode,

  openMode,

  selectedLessonByMode,

  expandedModuleByMode,

  onToggleOpenMode,

  onToggleModule,

  onSelectLesson,

}: Props) {

  const showRecorded = learningAccess.canAccessLiveRecorded;



  const renderModeTree = (mode: LearningContentMode) => {

    if (modules.length === 0) {

      return (

        <p className="px-2 py-3 text-center text-[11px] text-slate-500">

          No modules in this course yet.

        </p>

      );

    }



    return (

      <SyllabusModuleAccordion

        key={`learning-sidebar-${mode}`}

        courseId={courseId}

        modules={modules}

        progressMap={progressMap}

        selectedLessonId={selectedLessonByMode[mode] ?? undefined}

        expandedModuleId={expandedModuleByMode[mode]}

        onToggleModule={(moduleId) => onToggleModule(mode, moduleId)}

        onSelectLesson={(lessonId, moduleId) =>

          onSelectLesson(mode, lessonId, moduleId)

        }

        variant="sidebar"

      />

    );

  };



  return (

    <aside className="flex max-h-[calc(100vh-12rem)] min-h-[420px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24">

      <div className="border-b border-slate-100 px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Course Content
          </p>
          <p className="min-w-0 text-right text-xs font-semibold leading-snug text-[#0B1F3A]">
            {courseTitle}
          </p>
        </div>
      </div>



      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5">

        <ModeSection

          title="Recorded Videos"

          subtitle="Live sessions for your batch"

          icon={Radio}

          isAvailable={showRecorded}

          isOpen={openMode === "live_recorded"}

          isActive={activeMode === "live_recorded"}

          onHeaderClick={() => onToggleOpenMode("live_recorded")}

        >

          {renderModeTree("live_recorded")}

        </ModeSection>



        <ModeSection

          title="Self-Paced Videos"

          subtitle="Learn at your own pace"

          icon={BookOpen}

          isAvailable

          isOpen={openMode === "self_paced"}

          isActive={activeMode === "self_paced"}

          onHeaderClick={() => onToggleOpenMode("self_paced")}

        >

          {renderModeTree("self_paced")}

        </ModeSection>

      </div>

    </aside>

  );

}


