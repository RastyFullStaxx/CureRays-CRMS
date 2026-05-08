import { getCourses } from "@/lib/module-data";

export const courseService = {
  listCourses() {
    return getCourses();
  }
};
