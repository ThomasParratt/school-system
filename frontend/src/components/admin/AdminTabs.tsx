import { ADMIN_TABS, useAdminTab } from "./adminTabs";

// The admin dashboard's tabs, shown in the page header.
export default function AdminTabs() {
  const [tab, openTab] = useAdminTab();

  return (
    <nav className="flex gap-1" role="tablist">
      {ADMIN_TABS.map(t => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={tab === t.id}
          onClick={() => openTab(t.id)}
          className={`px-3 py-1.5 rounded-md cursor-pointer transition ${
            tab === t.id
              ? "bg-indigo-50 text-indigo-600 font-semibold"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
