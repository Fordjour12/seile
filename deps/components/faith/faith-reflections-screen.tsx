import React, { useState } from "react";
import { ScrollView } from "react-native";
import { toast } from "sonner-native";

import { Badge, Button, Card, EmptyState, Input, SectionHeader, Text, View } from "@/components";
import { NAV_THEME, Typography } from "@/lib/constants";
import { todayDateKey, useCreateSpiritualReflection, useSpiritualReflections } from "@/lib/spiritual";
import { useColorScheme } from "@/lib/use-color-scheme";

import { FaithField, FaithMetricCard, faithSharedStyles } from "./faith-shared";

const REFLECTION_TYPES = ["gratitude", "weekly-review", "prayer", "examen", "lesson", "service"] as const;

export function FaithReflectionsScreen() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const reflections = useSpiritualReflections();
  const createReflection = useCreateSpiritualReflection();

  const [date, setDate] = useState(todayDateKey());
  const [reflectionType, setReflectionType] = useState<(typeof REFLECTION_TYPES)[number]>("gratitude");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [insights, setInsights] = useState("");
  const [busy, setBusy] = useState(false);

  const gratitudeCount = (reflections ?? []).filter((entry) => entry.reflectionType === "gratitude").length;
  const recentCount = (reflections ?? []).filter((entry) => isWithinLastSevenDays(entry.date)).length;

  const handleCreate = async () => {
    setBusy(true);
    try {
      await createReflection({
        date,
        reflectionType,
        content,
        mood: mood || undefined,
        insights: insights || undefined,
      });
      toast.success("Reflection saved");
      setContent("");
      setMood("");
      setInsights("");
      setDate(todayDateKey());
      setReflectionType("gratitude");
    } catch (error) {
      toast.error("Could not save reflection", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={faithSharedStyles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={faithSharedStyles.content}
    >
      <SectionHeader title="Reflections" subtitle="Turn attention inward and record what formed you" />

      <View style={faithSharedStyles.metricRow}>
        <FaithMetricCard label="This Week" value={recentCount} accent={theme.chart5} />
        <FaithMetricCard label="Gratitude Entries" value={gratitudeCount} accent={theme.chart2} />
      </View>

      <Card style={faithSharedStyles.card}>
        <Text style={[Typography.titleSM, { color: theme.foreground }]}>Write a reflection</Text>
        <FaithField label="Type">
          <View style={faithSharedStyles.chipRow}>
            {REFLECTION_TYPES.map((value) => (
              <Button
                key={value}
                title={value}
                size="sm"
                variant={reflectionType === value ? "primary" : "outline"}
                onPress={() => setReflectionType(value)}
              />
            ))}
          </View>
        </FaithField>
        <FaithField label="Date">
          <Input value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        </FaithField>
        <FaithField label="Content">
          <Input
            value={content}
            onChangeText={setContent}
            placeholder="What are you grateful for? What challenged your character? Where did you grow?"
            multiline
          />
        </FaithField>
        <View style={faithSharedStyles.metricRow}>
          <FaithField label="Mood" style={{ flex: 1 }}>
            <Input value={mood} onChangeText={setMood} placeholder="Calm, hopeful, stretched" />
          </FaithField>
          <FaithField label="Insight" style={{ flex: 1 }}>
            <Input value={insights} onChangeText={setInsights} placeholder="Optional takeaway" />
          </FaithField>
        </View>
        <Button title="Save reflection" loading={busy} onPress={handleCreate} />
      </Card>

      {reflections && reflections.length === 0 ? (
        <EmptyState
          title="No reflections yet"
          message="Even short notes work. This module is designed for consistency, not polished journaling."
        />
      ) : null}

      {reflections && reflections.length > 0 ? (
        <View style={faithSharedStyles.section}>
          <SectionHeader title="Recent Reflections" subtitle="JOURNAL" />
          <View style={faithSharedStyles.list}>
            {reflections.map((entry) => (
              <Card key={entry.id} variant="outline" style={faithSharedStyles.card}>
                <View style={faithSharedStyles.rowBetween}>
                  <Text style={[Typography.titleSM, { color: theme.foreground }]}>{entry.reflectionType}</Text>
                  <Badge variant="outline" color="secondary">{entry.date}</Badge>
                </View>
                {entry.mood ? (
                  <Text style={[Typography.captionLG, { color: theme.mutedForeground }]}>Mood: {entry.mood}</Text>
                ) : null}
                <Text style={[Typography.bodySM, { color: theme.foreground }]}>{entry.content}</Text>
                {entry.insights ? (
                  <Text style={[Typography.captionLG, { color: theme.chart4 }]}>{entry.insights}</Text>
                ) : null}
              </Card>
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function isWithinLastSevenDays(dateKey: string) {
  const target = Date.parse(`${dateKey}T00:00:00.000Z`);
  if (Number.isNaN(target)) return false;
  const delta = Date.parse(`${todayDateKey()}T00:00:00.000Z`) - target;
  return delta >= 0 && delta <= 7 * 24 * 60 * 60 * 1000;
}
