import React from "react";
import { Redirect, useLocalSearchParams } from "expo-router";

export default function SubscriptionDetailRedirectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return <Redirect href="/(tabs)/finance/recurring" />;
  }

  return <Redirect href={`/(tabs)/finance/recurring/subscriptions/${id}`} />;
}
