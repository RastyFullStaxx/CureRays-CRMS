export const chartRoundsSyncService = {
  pushPhaseUpdate(patientId: string, phase: string, status: string) {
    // TODO: Sync master chart-rounds-style Google Sheet without manually moving rows between tabs.
    return { patientId, phase, status, syncStatus: "PENDING_CONFIGURATION" as const };
  }
};
