import React from "react";
import { Redirect } from "expo-router";

export default function CreateSubscriptionRedirectScreen() {
  return <Redirect href="/(tabs)/finance/recurring/subscriptions/create" />;
}
