import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";

import { api } from "@seile/backend/convexApi";

import { Container } from "@/components/container";
import {
  buildFirstRunViewModel,
  type FirstRunReflectionOptionViewModel,
  type FirstRunSuggestionVerdict,
} from "@/components/first-run/data";
import {
  ActivityCard,
  CheckInCard,
  ConfidenceCard,
  DomainSetupCard,
  EmptyStateCard,
  ErrorState,
  ExperienceStage,
  FirstRunScroll,
  InsightCard,
  LoadingState,
  ProfileSummaryCard,
  ProgressCard,
  ScreenHeader,
  SectionTitle,
  SnapshotCard,
  SuggestionCard,
  WeekTwoPlanCard,
} from "@/components/first-run/shared";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/v1-auth-context";

export function FirstRunJourneyScreen() {
  const { user, completeFirstRun } = useAuth();
  const router = useRouter();
  const dashboard = useQuery(api.onboarding.getFirstRunDashboard, {});
  const syncFirstRunDay = useMutation(api.onboarding.syncFirstRunDay);
  const generateDailySuggestions = useMutation(api.onboarding.generateDailySuggestions);
  const recordActivityEvent = useMutation(api.onboarding.recordActivityEvent);
  const recordActivityReflection = useMutation(api.onboarding.recordActivityReflection);
  const submitSuggestionFeedback = useMutation(api.onboarding.submitSuggestionFeedback);

  const hasSynced = useRef(false);
  const hasRequestedSuggestions = useRef(false);

  const [busyAssignmentId, setBusyAssignmentId] = useState<string | null>(null);
  const [busySuggestionId, setBusySuggestionId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshingSuggestions, setIsRefreshingSuggestions] = useState(false);
  const [isCompletingFirstRun, setIsCompletingFirstRun] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [readiness, setReadiness] = useState(3);

  useEffect(() => {
    if (hasSynced.current) {
      return;
    }

    hasSynced.current = true;
    void handleSyncFirstRun();
  }, []);

  useEffect(() => {
    if (!dashboard || hasRequestedSuggestions.current) {
      return;
    }
    if (dashboard.state.dayNumber < 3 || dashboard.suggestions.length > 0) {
      return;
    }

    hasRequestedSuggestions.current = true;
    void handleRefreshSuggestions();
  }, [dashboard]);

  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "there";
  const viewModel = useMemo(
    () => (dashboard ? buildFirstRunViewModel(dashboard, displayName) : null),
    [dashboard, displayName],
  );

  async function runGuarded<T>(
    fn: () => Promise<T>,
    failureMessage: string,
  ) {
    try {
      setErrorMessage(null);
      return await fn();
    } catch (error) {
      console.error("[FirstRunJourneyScreen]", failureMessage, error);
      setErrorMessage(failureMessage);
      return null;
    }
  }

  async function handleSyncFirstRun() {
    setIsSyncing(true);
    try {
      await runGuarded(
        () => syncFirstRunDay({}),
        "Couldn't refresh first-run context.",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleRefreshSuggestions() {
    setIsRefreshingSuggestions(true);
    try {
      await runGuarded(
        () => generateDailySuggestions({}),
        "Couldn't refresh first-run suggestions.",
      );
    } finally {
      setIsRefreshingSuggestions(false);
    }
  }

  async function handleActivityAction(
    assignmentId: string,
    action: "start" | "done" | "skip",
  ) {
    const actionMap = {
      start: {
        backendAction: "started" as const,
        errorMessage: "Couldn't mark this activity as started.",
      },
      done: {
        backendAction: "completed" as const,
        errorMessage: "Couldn't mark this activity complete.",
      },
      skip: {
        backendAction: "skipped" as const,
        errorMessage: "Couldn't skip this activity.",
      },
    };

    setBusyAssignmentId(assignmentId);
    try {
      await runGuarded(
        () =>
          recordActivityEvent({
            assignmentId: assignmentId as any,
            action: actionMap[action].backendAction,
          }),
        actionMap[action].errorMessage,
      );
    } finally {
      setBusyAssignmentId(null);
    }
  }

  async function handleReflection(
    assignmentId: string,
    option: FirstRunReflectionOptionViewModel,
  ) {
    setBusyAssignmentId(assignmentId);
    try {
      await runGuarded(
        () =>
          recordActivityReflection({
            assignmentId: assignmentId as any,
            usefulnessRating: option.usefulnessRating,
            difficultyRating: option.difficultyRating,
          }),
        "Couldn't save this reflection.",
      );
    } finally {
      setBusyAssignmentId(null);
    }
  }

  async function handleCheckInSubmit() {
    if (!viewModel?.checkIn) {
      setErrorMessage("Couldn't find a check-in assignment for today.");
      return;
    }

    setBusyAssignmentId(viewModel.checkIn.assignmentId);
    try {
      await runGuarded(
        () =>
          recordActivityEvent({
            assignmentId: viewModel.checkIn!.assignmentId as any,
            action: "completed",
            metadata: {
              mood,
              energy,
              readiness,
              source: "first-run-check-in",
            },
          }),
        "Couldn't save today's check-in.",
      );
    } finally {
      setBusyAssignmentId(null);
    }
  }

  async function handleSuggestionAction(
    suggestionId: string,
    verdict: FirstRunSuggestionVerdict,
  ) {
    const errorByVerdict: Record<FirstRunSuggestionVerdict, string> = {
      accepted: "Couldn't send acceptance feedback for this suggestion.",
      dismissed: "Couldn't dismiss this suggestion.",
      snoozed: "Couldn't snooze this suggestion.",
    };

    setBusySuggestionId(suggestionId);
    try {
      await runGuarded(
        () =>
          submitSuggestionFeedback({
            suggestionId: suggestionId as any,
            verdict,
          }),
        errorByVerdict[verdict],
      );
    } finally {
      setBusySuggestionId(null);
    }
  }

  async function handleCompleteFirstRun() {
    setIsCompletingFirstRun(true);
    try {
      await runGuarded(
        () => completeFirstRun(),
        "Couldn't finish the first-run onboarding flow.",
      );
    } finally {
      setIsCompletingFirstRun(false);
    }
  }

  if (!viewModel) {
    return (
      <Container>
        <FirstRunScroll>
          <LoadingState />
        </FirstRunScroll>
      </Container>
    );
  }

  return (
    <Container>
      <FirstRunScroll>
        <ExperienceStage stageKey={viewModel.stageKey}>
          <ScreenHeader header={viewModel.header} />

          {errorMessage ? (
            <ErrorState message={errorMessage} onRetry={handleSyncFirstRun} busy={isSyncing} />
          ) : null}

          <InsightCard insight={viewModel.insight} />
          <ProgressCard progress={viewModel.progress} />
          <SnapshotCard snapshot={viewModel.snapshot} />
          <ProfileSummaryCard profile={viewModel.profile} />

          {viewModel.checkIn ? (
            <CheckInCard
              checkIn={viewModel.checkIn}
              mood={mood}
              energy={energy}
              readiness={readiness}
              busy={busyAssignmentId === viewModel.checkIn.assignmentId}
              onSetMood={setMood}
              onSetEnergy={setEnergy}
              onSetReadiness={setReadiness}
              onSubmit={() => void handleCheckInSubmit()}
            />
          ) : null}

          <View style={{ gap: 10 }}>
            <SectionTitle
              label={viewModel.header.badge === "Seed" ? "Suggested to start" : "Today's activities"}
              subtitle={
                viewModel.header.badge === "Seed"
                  ? "From your setup and the domains you want the app to learn first."
                  : "Real assignments for today's first-run learning loop."
              }
              action={
                viewModel.activitiesEmpty?.ctaLabel ? (
                  <Button
                    title={viewModel.activitiesEmpty.ctaLabel}
                    size="sm"
                    variant="outline"
                    disabled={isSyncing}
                    onPress={handleSyncFirstRun}
                  />
                ) : undefined
              }
            />
            {viewModel.activitiesEmpty ? (
              <EmptyStateCard
                state={viewModel.activitiesEmpty}
                busy={isSyncing}
                onPressCta={handleSyncFirstRun}
              />
            ) : (
              viewModel.activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  busy={busyAssignmentId === activity.id}
                  onAction={(actionId) => void handleActivityAction(activity.id, actionId)}
                  onReflection={(option) => void handleReflection(activity.id, option)}
                />
              ))
            )}
          </View>

          <View style={{ gap: 10 }}>
            <SectionTitle
              label="Activate domains"
              subtitle="The app is domain-shaped. Early actions determine where the AI earns confidence first."
            />
            {viewModel.domains.map((domain) => (
              <DomainSetupCard
                key={domain.id}
                domain={domain}
                onPress={() => router.push(domain.href as never)}
              />
            ))}
          </View>

          <View style={{ gap: 10 }}>
            <SectionTitle
              label="Suggestions"
              action={
                <Button
                  title="Refresh"
                  size="sm"
                  variant="outline"
                  disabled={isRefreshingSuggestions}
                  onPress={handleRefreshSuggestions}
                />
              }
            />
            {viewModel.suggestionsEmpty ? (
              <EmptyStateCard
                state={viewModel.suggestionsEmpty}
                busy={isRefreshingSuggestions}
                onPressCta={
                  viewModel.suggestionsEmpty.ctaLabel
                    ? handleRefreshSuggestions
                    : undefined
                }
              />
            ) : (
              viewModel.suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  busy={busySuggestionId === suggestion.id}
                  onAction={(actionId) =>
                    void handleSuggestionAction(suggestion.id, actionId)
                  }
                />
              ))
            )}
          </View>

          <View style={{ gap: 10 }}>
            <SectionTitle label="Confidence" />
            {viewModel.confidenceEmpty ? (
              <EmptyStateCard state={viewModel.confidenceEmpty} />
            ) : (
              <ConfidenceCard items={viewModel.confidence} />
            )}
          </View>

          {viewModel.weekTwo ? <WeekTwoPlanCard plan={viewModel.weekTwo} /> : null}

          {viewModel.completeCtaLabel ? (
            <Button
              title={viewModel.completeCtaLabel}
              disabled={isCompletingFirstRun}
              onPress={handleCompleteFirstRun}
            />
          ) : null}
        </ExperienceStage>
      </FirstRunScroll>
    </Container>
  );
}
