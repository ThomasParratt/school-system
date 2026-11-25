import { useSearchParams } from "react-router-dom";

export const ADMIN_TABS = [
  { id: "overview", label: "Overview" },
  { id: "instructors", label: "Instructors" },
  { id: "students", label: "Students" },
  { id: "courses", label: "Courses" },
] as const;

export type AdminTab = (typeof ADMIN_TABS)[number]["id"];

function isAdminTab(value: string | null): value is AdminTab {
  return ADMIN_TABS.some(t => t.id === value);
}

// The tab lives in the URL (?tab=students), so a refresh or the back button keeps it,
// and the header's tabs and the dashboard's panels read the same value.
export function useAdminTab(): [AdminTab, (next: AdminTab) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: AdminTab = isAdminTab(tabParam) ? tabParam : "overview";

  const openTab = (next: AdminTab) => {
    setSearchParams(next === "overview" ? {} : { tab: next });
  };

  return [tab, openTab];
}
