import { getDocumentInstances } from "@/lib/module-data";

export const documentGenerationService = {
  listDocuments() {
    return getDocumentInstances();
  },
  generateFromTemplate(templateId: string, courseId: string) {
    // TODO: Integrate Google Docs/DOCX/PPTX/PDF generation with template field mapping.
    return { templateId, courseId, status: "QUEUED_FOR_GENERATION" };
  }
};
