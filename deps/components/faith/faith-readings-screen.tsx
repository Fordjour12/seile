import React, { useState } from "react";
import { ScrollView } from "react-native";
import { toast } from "sonner-native";

import { Badge, Button, Card, EmptyState, Input, SectionHeader, Text, View } from "@/components";
import { NAV_THEME, Typography } from "@/lib/constants";
import { todayDateKey, useCreateSpiritualReading, useSpiritualReadings } from "@/lib/spiritual";
import { useColorScheme } from "@/lib/use-color-scheme";

import { FaithField, FaithMetricCard, faithSharedStyles } from "./faith-shared";

export function FaithReadingsScreen() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const readings = useSpiritualReadings();
  const createReading = useCreateSpiritualReading();

  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [passage, setPassage] = useState("");
  const [date, setDate] = useState(todayDateKey());
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const thisWeekCount = (readings ?? []).filter((entry) => isWithinLastSevenDays(entry.date)).length;
  const sourceCount = new Set((readings ?? []).map((entry) => entry.source).filter(Boolean)).size;

  const handleCreate = async () => {
    setBusy(true);
    try {
      await createReading({
        title,
        source: source || undefined,
        passage: passage || undefined,
        date,
        notes: notes || undefined,
      });
      toast.success("Reading logged");
      setTitle("");
      setSource("");
      setPassage("");
      setNotes("");
      setDate(todayDateKey());
    } catch (error) {
      toast.error("Could not log reading", {
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
      <SectionHeader title="Readings" subtitle="Capture devotional reading, study, and scripture notes" />

      <View style={faithSharedStyles.metricRow}>
        <FaithMetricCard label="This Week" value={thisWeekCount} accent={theme.chart3} />
        <FaithMetricCard label="Sources" value={sourceCount} accent={theme.chart4} />
      </View>

      <Card style={faithSharedStyles.card}>
        <Text style={[Typography.titleSM, { color: theme.foreground }]}>Log a reading</Text>
        <FaithField label="Title">
          <Input value={title} onChangeText={setTitle} placeholder="Sermon on the Mount" />
        </FaithField>
        <View style={faithSharedStyles.metricRow}>
          <FaithField label="Source" style={{ flex: 1 }}>
            <Input value={source} onChangeText={setSource} placeholder="Bible, devotional, book" />
          </FaithField>
          <FaithField label="Passage" style={{ flex: 1 }}>
            <Input value={passage} onChangeText={setPassage} placeholder="Matthew 5-7" />
          </FaithField>
        </View>
        <FaithField label="Date">
          <Input value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        </FaithField>
        <FaithField label="Notes">
          <Input value={notes} onChangeText={setNotes} placeholder="What stood out?" multiline />
        </FaithField>
        <Button title="Log reading" loading={busy} onPress={handleCreate} />
      </Card>

      {readings && readings.length === 0 ? (
        <EmptyState
          title="No devotional readings yet"
          message="Use this space for scripture, books, or meditative texts. Short notes are enough."
        />
      ) : null}

      {readings && readings.length > 0 ? (
        <View style={faithSharedStyles.section}>
          <SectionHeader title="Recent Readings" subtitle="STUDY LOG" />
          <View style={faithSharedStyles.list}>
            {readings.map((entry) => (
              <Card key={entry.id} variant="outline" style={faithSharedStyles.card}>
                <View style={faithSharedStyles.rowBetween}>
                  <Text style={[Typography.titleSM, { color: theme.foreground }]}>{entry.title}</Text>
                  <Badge variant="outline" color="secondary">{entry.date}</Badge>
                </View>
                <Text style={[Typography.captionLG, { color: theme.mutedForeground }]}>
                  {entry.source || "Reading"}{entry.passage ? ` · ${entry.passage}` : ""}
                </Text>
                {entry.notes ? (
                  <Text style={[Typography.bodySM, { color: theme.foreground }]}>{entry.notes}</Text>
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
