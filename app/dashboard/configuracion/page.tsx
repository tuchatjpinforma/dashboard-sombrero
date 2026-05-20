import ProfileCard from "@/components/configuracion/ProfileCard";
import PreferencesCard from "@/components/configuracion/PreferencesCard";
import PasswordForm from "@/components/configuracion/PasswordForm";
import DangerZoneCard from "@/components/configuracion/DangerZoneCard";

export default function ConfiguracionPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2 space-y-6">
        <ProfileCard />
        <PreferencesCard />
      </div>
      <div className="lg:col-span-3 space-y-6">
        <PasswordForm />
        <DangerZoneCard />
      </div>
    </div>
  );
}

