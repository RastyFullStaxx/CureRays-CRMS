import { imagingAssets, imagingCategories } from "@/lib/module-data";

export const imagingService = {
  listCategories() {
    return imagingCategories;
  },
  listAssets() {
    return imagingAssets;
  }
};
