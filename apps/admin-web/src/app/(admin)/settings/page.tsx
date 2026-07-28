export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">System Settings</h1>

      <p className="mt-2 text-gray-600">
        Configure institute-wide settings, user roles, permissions, academic
        preferences, notifications, integrations, security, and system
        configurations.
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-lg font-medium text-gray-700">
          Institute Settings
        </p>

        <p className="mt-2 text-gray-500">
          This module will allow administrators to manage institute details,
          branches, academic years, notification preferences, user roles,
          permissions, payment gateways, email & SMS settings, integrations,
          backup options, and other global configurations.
        </p>
      </div>
    </div>
  );
}