import { useLocalSearchParams } from "expo-router";

import { DomainSetupScreen } from "@/components/domains/domain-setup-screen";

export default function DomainRoute() {
  const { domain } = useLocalSearchParams<{ domain: string }>();
  return <DomainSetupScreen domainKey={domain ?? ""} />;
}
