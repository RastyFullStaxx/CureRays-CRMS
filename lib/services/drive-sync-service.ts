export const driveSyncService = {
  syncTemplateLibrary() {
    // TODO: Fetch template metadata from the configured Google Drive template folder.
    return { status: "NOT_CONFIGURED" as const };
  },
  recordManualEdit(documentId: string) {
    // TODO: Version and audit manual document edits from Drive once Drive activity integration is enabled.
    return { documentId, status: "MANUAL_EDIT_TRACKING_PENDING" as const };
  }
};
