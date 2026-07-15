/**
 * Resource types supported by the LMS.
 * Keep this in sync with the backend enum.
 */
export enum LessonResourceType {
  PDF = "PDF",
  DOC = "DOC",
  DOCX = "DOCX",
  PPT = "PPT",
  PPTX = "PPTX",
  XLS = "XLS",
  XLSX = "XLSX",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  ZIP = "ZIP",
  LINK = "LINK",
  OTHER = "OTHER",
}

/**
 * Represents a downloadable or external learning resource
 * attached to a lesson.
 */
export interface LessonResource {
  /**
   * Unique resource identifier.
   */
  id: string;

  /**
   * Display title shown to students.
   */
  title: string;

  /**
   * Resource type.
   */
  type: LessonResourceType;

  /**
   * Public URL or signed URL used to access the resource.
   */
  fileUrl: string;

  /**
   * Display order inside the lesson.
   */
  displayOrder: number;
}