export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Branch Settings</h1>

      <p className="mt-2 text-gray-600">
        Configure branch preferences, institute information, user roles,
        notifications, integrations, attendance rules, and other operational
        settings.
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-lg font-medium text-gray-700">
          Branch Settings
        </p>

        <p className="mt-2 text-gray-500">
          This module will provide centralized configuration for branch operations,
          academic settings, communication preferences, security, and system
          integrations.
        </p>
      </div>
    </div>
  );
}