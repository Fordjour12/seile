import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import { ScrollView, StyleSheet, View as RNView } from "react-native";

import { Container } from "@/components/container";
import {
   Alert,
   Avatar,
   Badge,
   Banner,
   BottomSheet,
   Button,
   Card,
   Chip,
   DetachedBottomSheet,
   Dialog,
   EmptyState,
   Input,
   ListItem,
   OverviewChartCard,
   SectionHeader,
   Separator,
   Surface,
   Switch,
   ThemedBarChart,
   Text as AppText,
   Toast,
} from "@/components";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";
import { OverviewChartCard1 } from "@/components/ov-card";

export default function ComponentsScreen() {
   const { colorScheme } = useColorScheme();
   const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

   const [name, setName] = useState("");
   const [chipSelected, setChipSelected] = useState(false);
   const [enabled, setEnabled] = useState(false);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [sheetOpen, setSheetOpen] = useState(false);
   const [detachedOpen, setDetachedOpen] = useState(false);

   return (
      <Container>
         <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
            <SectionHeader
               title="Component Showcase"
               subtitle="Quick test screen for your design system"
               actionLabel="Dialog"
               onActionPress={() => setDialogOpen(true)}
            />

            <OverviewChartCard />
            <OverviewChartCard />
            <OverviewChartCard1 />




            <Card variant="outline">
               <AppText variant="h3">Themed Gifted Chart</AppText>
               <ThemedBarChart
                  data={[
                     { label: "Apr", value: 58 },
                     { label: "May", value: 30 },
                     { label: "Jun", value: 66 },
                     { label: "Jul", value: 54 },
                     { label: "Aug", value: 84 },
                     { label: "Sep", value: 52 },
                     { label: "Oct", value: 65 },
                     { label: "Nov", value: 59 },
                  ]}
                  highlightedIndex={4}
                  height={116}
                  barWidth={33}
                  spacing={8}
               />
            </Card>

            <Card variant="outline">
               <AppText variant="h3">Inputs + Actions</AppText>
               <RNView style={styles.row}>
                  <Input
                     value={name}
                     onChangeText={setName}
                     placeholder="Type your name"
                     containerStyle={styles.flex}
                  />
                  <Button title="Save" variant="primary" onPress={() => { }} />
               </RNView>
               <RNView style={styles.row}>
                  <Chip label="Active Filter" selected={chipSelected} onSelect={setChipSelected} />
                  <Switch value={enabled} onValueChange={setEnabled} />
                  <Badge variant="subtle" color={enabled ? "success" : "warning"}>
                     {enabled ? "Enabled" : "Disabled"}
                  </Badge>
               </RNView>
            </Card>

            <Card>
               <AppText variant="h3">Feedback</AppText>
               <Alert
                  variant="info"
                  title="Heads up"
                  message="This screen is intended for fast visual QA."
                  actionLabel="Open Sheet"
                  onActionPress={() => setSheetOpen(true)}
               />
               <Banner
                  variant="success"
                  title="Banner Example"
                  message="Banner styles inherit centralized presets."
                  actionLabel="Detach"
                  onActionPress={() => setDetachedOpen(true)}
               />
               <Toast
                  variant="warning"
                  title="Toast Preview"
                  message="Use this to validate message density and spacing."
                  actionLabel="Undo"
               />
            </Card>

            <Card variant="outline">
               <AppText variant="h3">Lists + Surfaces</AppText>
               <Surface tone="muted">
                  <ListItem
                     title="Profile"
                     subtitle={name || "No name entered"}
                     meta="v1"
                     left={<Avatar fallback={name || "User"} size="sm" />}
                     right={<FontAwesome name="chevron-right" size={14} color={theme.mutedForeground} />}
                     onPress={() => { }}
                  />
                  <Separator />
                  <ListItem
                     compact
                     title="Notifications"
                     subtitle="Push + Email"
                     right={<Badge color="primary">New</Badge>}
                  />
               </Surface>
            </Card>

            <EmptyState
               title="No Results"
               message="Use this section to preview empty-state spacing and CTA defaults."
               actionLabel="Open Dialog"
               onActionPress={() => setDialogOpen(true)}
            />

            <RNView style={styles.row}>
               <Button title="Open Bottom Sheet" onPress={() => setSheetOpen(true)} style={styles.flex} />
               <Button
                  title="Open Detached Sheet"
                  variant="secondary"
                  onPress={() => setDetachedOpen(true)}
                  style={styles.flex}
               />
            </RNView>
         </ScrollView>

         <Dialog
            visible={dialogOpen}
            title="Confirm Action"
            description="This dialog uses centralized dialog tokens and theme colors."
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            onConfirm={() => setDialogOpen(false)}
            onCancel={() => setDialogOpen(false)}
         />

         <BottomSheet
            visible={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title="Bottom Sheet"
            subtitle="Standard attached modal bottom sheet"
         >
            <Button title="Close" variant="ghost" onPress={() => setSheetOpen(false)} />
         </BottomSheet>

         <DetachedBottomSheet
            visible={detachedOpen}
            onClose={() => setDetachedOpen(false)}
            title="Detached Bottom Sheet"
            subtitle="Floating style with side insets"
         >
            <Button title="Dismiss" variant="ghost" onPress={() => setDetachedOpen(false)} />
         </DetachedBottomSheet>
      </Container>
   );
}

const styles = StyleSheet.create({
   content: {
      gap: 12,
      padding: 16,
      paddingBottom: 32,
   },
   row: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
   },
   flex: {
      flex: 1,
   },
});
