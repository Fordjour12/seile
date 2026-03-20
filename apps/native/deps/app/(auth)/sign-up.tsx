import { useEffect, useMemo, useState } from "react";
import { Alert as RNAlert, ActivityIndicator, View } from "react-native";
import { Link, Redirect, useRouter } from "expo-router";

import { Button, Card, Text } from "@/components";
import {
   AuthBackLink,
   AuthDivider,
   AuthField,
   AuthShell,
   AuthSocialButton,
   PasswordStrengthMeter,
} from "@/components/auth/auth-shell";
import { useAuth } from "@/lib/auth-context";
import { UI_PRESETS } from "@/lib/constants";
import {
   loadOnboardingDraft,
   toOnboardingDraftSubmission,
   type OnboardingDraft,
} from "@/lib/onboarding-draft";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function SignUpScreen() {
   const { colorScheme } = useColorScheme();
   const router = useRouter();
   const {
      clearError,
      error,
      hasCompletedOnboarding,
      hasHydrated,
      isLoading,
      signUp,
      user,
   } = useAuth();
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [draft, setDraft] = useState<OnboardingDraft | null>(null);
   const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
   const busy = isLoading;

   useEffect(() => {
      let isActive = true;

      void loadOnboardingDraft().then((nextDraft) => {
         if (!isActive) {
            return;
         }

         setDraft(nextDraft);
         setName((currentName) => currentName || nextDraft.name);
         setHasLoadedDraft(true);
      });

      return () => {
         isActive = false;
      };
   }, []);

   if (hasHydrated && !isLoading && user) {
      return (
         <Redirect
            href={
               hasCompletedOnboarding ? "/(tabs)" : "/(auth)/first-run-today"
            }
         />
      );
   }

   const canSubmit =
      name.trim().length > 0 && email.trim().length > 0 && password.length >= 8;
   const isHydrating = !hasHydrated || !hasLoadedDraft;
   const draftSummary = useMemo(() => {
      if (!draft) {
         return null;
      }

      const visibleDomains = draft.domains.slice(0, 4).join(", ");
      const extraDomains =
         draft.domains.length > 4 ? ` +${draft.domains.length - 4} more` : "";

      return `${visibleDomains}${extraDomains} · ${draft.planningStyle} planning · ${draft.aiTone} tone`;
   }, [draft]);

   function resetErrors() {
      if (error) {
         clearError();
      }
   }

   function showUnavailable(provider: string) {
      RNAlert.alert(
         `${provider} unavailable`,
         `${provider} auth is in the mock, but this backend has not configured social providers yet.`,
      );
   }

   async function handleSubmit() {
      if (busy || !canSubmit) {
         return;
      }

      clearError();
      const didSignUp = await signUp(
         {
            name: name.trim(),
            email: email.trim(),
            password,
         },
         draft
            ? toOnboardingDraftSubmission({
               ...draft,
               name: name.trim() || draft.name,
            })
            : undefined,
      );

      if (didSignUp) {
         router.replace("/(auth)/first-run-today");
      }
   }

   return (
      <AuthShell minHeightOffset={0}>
         <View style={{ gap: 20, paddingTop: 16 }}>
            <AuthBackLink href="/(auth)" label="Back to onboarding" />

            <View style={{ gap: 8 }}>
               <View
                  style={{
                     flexDirection: "row",
                     alignItems: "center",
                     justifyContent: "space-between",
                     gap: 12,
                  }}
               >
                  <Text variant="small" style={{ color: "#7c7c92" }}>
                     Account setup
                  </Text>
                  <Text variant="small" style={{ color: "#7c7c92" }}>
                     After onboarding
                  </Text>
               </View>
               <Text
                  selectable
                  style={{
                     color: "#ffffff",
                     fontFamily: "Geist",
                     fontSize: 28,
                     fontWeight: "700",
                     lineHeight: 34,
                  }}
               >
                  Create your account
               </Text>
               <Text
                  selectable
                  variant="small"
                  style={{ color: "#7c7c92", lineHeight: 22 }}
               >
                  Your onboarding answers are already captured. This step just creates
                  the account that will hold them.
               </Text>
            </View>

            <View style={{ gap: 8 }}>
               <AuthSocialButton
                  title="Continue with Google"
                  icon="google"
                  onPress={() => showUnavailable("Google")}
               />
               <AuthSocialButton
                  title="Continue with Apple"
                  icon="apple"
                  onPress={() => showUnavailable("Apple")}
               />
            </View>

            <AuthDivider />

            <Card
               variant="outline"
               style={{
                  gap: 16,
                  borderRadius: 22,
                  borderWidth: 1,
                  padding: 18,
                  backgroundColor:
                     colorScheme === "dark"
                        ? "rgba(12, 15, 25, 0.84)"
                        : "rgba(255, 255, 255, 0.9)",
               }}
            >
               {isHydrating ? (
                  <View
                     style={{
                        minHeight: 180,
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                     }}
                  >
                     <ActivityIndicator color="#9b8fff" />
                     <Text selectable variant="small" style={{ color: "#7c7c92" }}>
                        Loading onboarding draft
                     </Text>
                  </View>
               ) : (
                  <>
                     {draftSummary ? (
                        <View
                           style={{
                              borderRadius: 16,
                              borderCurve: "continuous",
                              borderWidth: 1,
                              borderColor: "rgba(61, 53, 112, 0.42)",
                              backgroundColor: "rgba(30, 22, 40, 0.88)",
                              padding: 14,
                              gap: 6,
                           }}
                        >
                           <Text selectable variant="muted" style={{ color: "#9b8fff" }}>
                              ONBOARDING READY
                           </Text>
                           <Text
                              selectable
                              variant="small"
                              style={{ color: "#d8d5ec", lineHeight: 20 }}
                           >
                              {draftSummary}
                           </Text>
                        </View>
                     ) : null}

                     <AuthField
                        label="Your name"
                        autoCapitalize="words"
                        autoComplete="name"
                        placeholder="Your name"
                        value={name}
                        onChangeText={(value) => {
                           resetErrors();
                           setName(value);
                        }}
                     />

                     <AuthField
                        label="Email address"
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        placeholder="you@example.com"
                        value={email}
                        onChangeText={(value) => {
                           resetErrors();
                           setEmail(value);
                        }}
                     />

                     <View style={{ gap: 8 }}>
                        <AuthField
                           label="Password"
                           autoComplete="password"
                           placeholder="8+ characters"
                           secureTextEntry={!showPassword}
                           value={password}
                           onChangeText={(value) => {
                              resetErrors();
                              setPassword(value);
                           }}
                           rightActionLabel={showPassword ? "Hide" : "Show"}
                           onRightActionPress={() =>
                              setShowPassword((current) => !current)
                           }
                        />
                        <PasswordStrengthMeter password={password} />
                     </View>

                     {error ? (
                        <Text selectable variant="small" style={{ color: "#e24b4a" }}>
                           {error}
                        </Text>
                     ) : null}

                     <Button
                        title="Create account"
                        size="lg"
                        onPress={() => void handleSubmit()}
                        loading={busy}
                        disabled={!canSubmit || isHydrating || busy}
                        style={{ borderRadius: 14, borderCurve: "continuous" }}
                     />
                  </>
               )}
            </Card>
         </View>

         <View style={{ gap: 16 }}>
            <Text
               selectable
               variant="muted"
               style={{
                  color: "#666680",
                  textAlign: "center",
                  lineHeight: 18,
                  paddingHorizontal: UI_PRESETS.spacing.md,
               }}
            >
               We do not sell your data or show ads. Your onboarding data stays tied
               to your account.
            </Text>

            <View
               style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 6,
               }}
            >
               <Text selectable variant="small" style={{ color: "#7c7c92" }}>
                  Already have an account?
               </Text>
               <Link href="/(auth)/sign-in" asChild>
                  <Text selectable variant="small" style={{ color: "#9b8fff" }}>
                     Sign in
                  </Text>
               </Link>
            </View>
         </View>
      </AuthShell>
   );
}
