export const fileStorageService = {
  getCourseFolderPath(patientFolderName: string, courseFolderName: string) {
    return `Patients/${patientFolderName}/${courseFolderName}`;
  },
  createCourseFolders(courseId: string) {
    // TODO: Create patient/course folders in HIPAA-approved storage once storage provider is configured.
    return {
      courseId,
      folders: ["01_ChartPrep", "02_Simulation", "03_Planning", "04_OnTreatment", "05_PostTx", "06_Audit", "Images"]
    };
  }
};
