import { useMemo, useState } from "react";
import {
  Alert as RNAlert,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Badge, Button, Card, Text } from "@/components";
import { NAV_THEME, UI_PRESETS } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

type SpaceView = "zones" | "wishlist" | "vibe";

type ZoneItem = {
  id: string;
  name: string;
  description: string;
  status: "good" | "attention" | "progress";
  progress: number;
  progressColor: string;
  accent: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  iconBackground: string;
  tags: Array<{ label: string; color: string; background: string }>;
  details: Array<[string, string]>;
  primaryAction: string;
  secondaryAction?: string;
};

type WishlistItem = {
  id: string;
  name: string;
  meta: string;
  price: string;
  priority: string;
  done?: boolean;
};

const ZONES: ZoneItem[] = [
  {
    id: "sleep",
    name: "Sleep zone",
    description: "Bed, bedside table, blackout curtain. Primary rest area - kept minimal and dark.",
    status: "good",
    progress: 80,
    progressColor: "#854F0B",
    accent: "#e8a84a",
    icon: "moon-o",
    iconBackground: "#1a1408",
    tags: [
      { label: "Clean", color: "#6fcf97", background: "#1a2a1e" },
      { label: "Minimal", color: "#e8a84a", background: "#1a1408" },
      { label: "Lamp needed", color: "#ba7517", background: "#1a1408" },
    ],
    details: [
      ["Condition", "Good - blackout curtain installed last month."],
      ["Open items", "Bedside lamp still needed - on wishlist."],
      ["Last updated", "Mar 5 - added blackout curtain note."],
    ],
    primaryAction: "Update zone",
    secondaryAction: "Wishlist",
  },
  {
    id: "work",
    name: "Work zone",
    description: "Desk, monitor, chair, task lamp. Active use zone - daily deep work sessions happen here.",
    status: "attention",
    progress: 60,
    progressColor: "#854F0B",
    accent: "#6fcf97",
    icon: "desktop",
    iconBackground: "#0e1a0e",
    tags: [
      { label: "Cable mess", color: "#ba7517", background: "#2a1e08" },
      { label: "Active", color: "#e8a84a", background: "#1a1408" },
      { label: "Lighting good", color: "#6fcf97", background: "#1a2a1e" },
    ],
    details: [
      ["Condition", "Functional but cable management is unsolved - affects focus."],
      ["Open items", "Cable box - monitor arm - desk organiser tray."],
      ["AI note", "Work zone has highest daily use. Cable issue is the top friction point."],
      ["Last updated", "Mar 10 - noted cable management issue."],
    ],
    primaryAction: "Add to wishlist",
    secondaryAction: "Get ideas",
  },
  {
    id: "eat",
    name: "Eat zone",
    description: "Small table, 2 chairs, window light. Used for meals and occasional reading. Compact and functional.",
    status: "good",
    progress: 90,
    progressColor: "#854F0B",
    accent: "#d4c080",
    icon: "cutlery",
    iconBackground: "#1a1610",
    tags: [
      { label: "Organised", color: "#6fcf97", background: "#1a2a1e" },
      { label: "Natural light", color: "#e8a84a", background: "#1a1408" },
    ],
    details: [
      ["Condition", "Good - no open items. Table plant would add warmth - low priority."],
      ["Open items", "Small plant (optional)."],
    ],
    primaryAction: "Update",
  },
  {
    id: "rest",
    name: "Rest zone",
    description: "Reading chair, small lamp, bookshelf corner. Decompression and faith devotional space.",
    status: "progress",
    progress: 40,
    progressColor: "#534AB7",
    accent: "#a0a0d0",
    icon: "book",
    iconBackground: "#141420",
    tags: [
      { label: "Faith space", color: "#b4adf5", background: "#1e1a30" },
      { label: "In progress", color: "#9b8fff", background: "#1e1a30" },
      { label: "Chair needed", color: "#ba7517", background: "#1a1408" },
    ],
    details: [
      ["Condition", "In progress - bookshelf placed, lamp acquired. Reading chair is the missing piece."],
      ["Intent", "Dedicated decompression corner. Separate visual identity from the work desk."],
      ["Open items", "Reading chair (priority 1) - small rug - devotional candle holder."],
      ["Faith link", "This zone directly affects the Faith domain experience."],
    ],
    primaryAction: "Add chair to wishlist",
    secondaryAction: "Find options",
  },
];

const WISHLIST_ITEMS: WishlistItem[] = [
  { id: "chair", name: "Reading chair", meta: "Rest zone · compact, comfortable, neutral tone", price: "GHc 400-600", priority: "Priority 1" },
  { id: "cable", name: "Cable management box", meta: "Work zone · desk cable routing solution", price: "GHc 80-120", priority: "Priority 2" },
  { id: "lamp", name: "Bedside lamp", meta: "Sleep zone · warm light, small footprint", price: "GHc 120-180", priority: "Priority 3" },
  { id: "monitor", name: "Monitor arm", meta: "Work zone · frees desk surface, better posture", price: "GHc 200-300", priority: "Priority 4" },
  { id: "bookshelf", name: "Bookshelf", meta: "Rest zone · acquired Mar 1", price: "Done", priority: "Done", done: true },
];

const VIBE_CARDS: Array<{
  id: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  title: string;
  description: string;
}> = [
  { id: "sleep", icon: "moon-o", title: "Sleep", description: "Dark, minimal, zero stimulation" },
  { id: "work", icon: "desktop", title: "Work", description: "Clean, focused, functional only" },
  { id: "eat", icon: "leaf", title: "Eat", description: "Light, simple, natural" },
  { id: "rest", icon: "book", title: "Rest + Faith", description: "Warm, still, intentional" },
];

export function SpaceDomainScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;
  const [view, setView] = useState<SpaceView>("zones");
  const [openZoneId, setOpenZoneId] = useState<string>("work");
  const [activeVibeId, setActiveVibeId] = useState("sleep");
  const [doneWishlistIds, setDoneWishlistIds] = useState<string[]>(
    WISHLIST_ITEMS.filter((item) => item.done).map((item) => item.id),
  );

  const activeZone = useMemo(
    () => ZONES.find((zone) => zone.id === openZoneId) ?? ZONES[1],
    [openZoneId],
  );

  function openStub(title: string, message: string) {
    RNAlert.alert(title, message);
  }

  function toggleWishlist(id: string) {
    setDoneWishlistIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: UI_PRESETS.spacing.section,
          paddingTop: UI_PRESETS.spacing.lg,
          paddingBottom: 40,
          gap: 14,
        }}
      >
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
              <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#854F0B" }} />
              <Text selectable style={{ color: theme.foreground, fontFamily: "Geist", fontSize: 28, fontWeight: "700" }}>
                Space
              </Text>
            </View>
            <Pressable
              onPress={() => openStub("Space update", "Adding a room note or purchase item is not live yet.")}
              style={({ pressed }) => ({
                width: 34,
                height: 34,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#1a1408",
                borderWidth: 1,
                borderColor: "#3d2a08",
                opacity: pressed ? 0.84 : 1,
              })}
            >
              <FontAwesome name="plus" size={14} color="#e8a84a" />
            </Pressable>
          </View>
          <Text selectable variant="small" style={{ color: theme.mutedForeground }}>
            Single room · 4 zones · calm + functional
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(50).duration(420)}>
          <View style={{ flexDirection: "row", borderRadius: 10, borderCurve: "continuous", padding: 3, backgroundColor: "#141418", borderWidth: 1, borderColor: theme.border }}>
            {([
              ["zones", "Zones"],
              ["wishlist", "Wishlist"],
              ["vibe", "Vibe"],
            ] as Array<[SpaceView, string]>).map(([key, label]) => {
              const active = view === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setView(key)}
                  style={({ pressed }) => ({
                    flex: 1,
                    borderRadius: 7,
                    borderCurve: "continuous",
                    paddingVertical: 8,
                    alignItems: "center",
                    backgroundColor: active ? "#1a1408" : "transparent",
                    borderWidth: active ? 1 : 0,
                    borderColor: active ? "#3d2a08" : "transparent",
                    opacity: pressed ? 0.84 : 1,
                  })}
                >
                  <Text selectable variant="small" style={{ color: active ? "#e8a84a" : theme.mutedForeground, fontFamily: "Geist", fontWeight: "700" }}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {view === "zones" ? (
          <Animated.View entering={FadeInDown.delay(100).duration(420)} style={{ gap: 12 }}>
            <Card style={{ borderRadius: 18, borderCurve: "continuous", padding: 16, borderWidth: 1, borderColor: theme.border, boxShadow: theme.shadowSm }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                  Room layout
                </Text>
                <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                  1 room · 4 functional zones
                </Text>
              </View>
              <View style={{ height: 220, borderRadius: 12, borderCurve: "continuous", backgroundColor: "#0e0e10", borderWidth: 1, borderColor: theme.border, overflow: "hidden", position: "relative" }}>
                <ZoneBox title="Sleep" subtitle="Bed · calm" color="#e8a84a" background="#1a1408" statusColor="#1d9e75" style={{ top: 8, left: 8, width: "44%", height: "44%" }} onPress={() => setOpenZoneId("sleep")} />
                <ZoneBox title="Work" subtitle="Desk · focus" color="#6fcf97" background="#0e1a0e" statusColor="#ba7517" style={{ top: 8, right: 8, width: "50%", height: "44%" }} onPress={() => setOpenZoneId("work")} />
                <ZoneBox title="Eat" subtitle="Table · light" color="#d4c080" background="#1a1610" statusColor="#1d9e75" style={{ bottom: 8, left: 8, width: "30%", height: "42%" }} onPress={() => setOpenZoneId("eat")} />
                <ZoneBox title="Rest" subtitle="Reading · decompress" color="#a0a0d0" background="#141420" statusColor="#9b8fff" style={{ bottom: 8, right: 8, width: "62%", height: "42%" }} onPress={() => setOpenZoneId("rest")} />
                <Text selectable variant="muted" style={{ position: "absolute", top: "50%", left: "50%", transform: [{ translateX: -26 }, { translateY: -6 }], color: "#2a2a2e", textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                  single room
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                {[
                  ["#1d9e75", "Good"],
                  ["#ba7517", "Needs attention"],
                  ["#9b8fff", "In progress"],
                ].map(([color, label]) => (
                  <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: color }} />
                    <Text selectable variant="muted" style={{ color: theme.mutedForeground }}>
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>

            <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
              Zone detail
            </Text>
            {ZONES.map((zone) => {
              const open = openZoneId === zone.id;
              return (
                <Card key={zone.id} style={{ borderRadius: 16, borderCurve: "continuous", padding: 14, borderWidth: 1, borderColor: open ? "#3d2a08" : theme.border, backgroundColor: open ? "#160f06" : theme.card, boxShadow: theme.shadowSm }}>
                  <Pressable onPress={() => setOpenZoneId(open ? "" : zone.id)} style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <View style={{ width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: zone.iconBackground, borderWidth: 1, borderColor: zone.status === "attention" ? "#3d2a08" : theme.border }}>
                        <FontAwesome name={zone.icon} size={14} color={zone.accent} />
                      </View>
                      <Text selectable style={{ flex: 1, color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                        {zone.name}
                      </Text>
                      <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: zone.status === "good" ? "#1d9e75" : zone.status === "attention" ? "#ba7517" : "#9b8fff" }} />
                    </View>
                    <Text selectable variant="small" style={{ color: theme.mutedForeground, lineHeight: 18, marginBottom: 8 }}>
                      {zone.description}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                      {zone.tags.map((tag) => (
                        <View key={tag.label} style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: tag.background }}>
                          <Text selectable variant="muted" style={{ color: tag.color, fontFamily: "Geist", fontWeight: "700" }}>
                            {tag.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ flex: 1, height: 4, borderRadius: 999, backgroundColor: "#1e1e22", overflow: "hidden" }}>
                        <View style={{ width: `${zone.progress}%`, height: "100%", borderRadius: 999, backgroundColor: zone.progressColor }} />
                      </View>
                      <Text selectable variant="small" style={{ color: zone.accent, fontFamily: "Geist", fontWeight: "700" }}>
                        {zone.progress}%
                      </Text>
                    </View>
                  </Pressable>
                  {open ? (
                    <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.border, gap: 8 }}>
                      {zone.details.map(([key, value]) => (
                        <View key={key} style={{ flexDirection: "row", gap: 8 }}>
                          <Text selectable variant="muted" style={{ width: 76, color: theme.mutedForeground }}>
                            {key}
                          </Text>
                          <Text selectable variant="small" style={{ color: theme.foreground, flex: 1, lineHeight: 18 }}>
                            {value}
                          </Text>
                        </View>
                      ))}
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <Button title={zone.primaryAction} onPress={() => openStub(zone.primaryAction, `${zone.name} actions are not wired yet.`)} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
                        {zone.secondaryAction ? (
                          <Button title={zone.secondaryAction} variant="outline" onPress={() => openStub(zone.secondaryAction!, `${zone.name} suggestions are not wired yet.`)} style={{ flex: 1, borderRadius: 12, borderCurve: "continuous" }} />
                        ) : null}
                      </View>
                    </View>
                  ) : null}
                </Card>
              );
            })}

            <Card style={{ borderRadius: 14, borderCurve: "continuous", padding: 14, borderWidth: 1, borderColor: "rgba(42, 42, 54, 0.9)", backgroundColor: "rgba(19, 19, 31, 0.96)", flexDirection: "row", gap: 10 }}>
              <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#9b8fff", marginTop: 5 }} />
              <View style={{ flex: 1 }}>
                <Text selectable variant="small" style={{ color: "#8888a0", lineHeight: 20, marginBottom: 8 }}>
                  Work zone and Rest zone are the two that need attention. The cable management issue on your desk is a daily friction point. The reading chair is the highest-leverage purchase right now.
                </Text>
                <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                  <MiniAction label="Update wishlist" onPress={() => setView("wishlist")} />
                  <MiniAction label="Space × Faith" onPress={() => setView("vibe")} />
                </View>
              </View>
            </Card>
          </Animated.View>
        ) : null}

        {view === "wishlist" ? (
          <Animated.View entering={FadeInDown.delay(100).duration(420)} style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
                Priority items
              </Text>
              <Pressable onPress={() => openStub("Add item", "Creating a new Space wishlist item is not live yet.")}>
                <Text selectable variant="small" style={{ color: theme.primary, fontFamily: "Geist", fontWeight: "700" }}>
                  + Add item
                </Text>
              </Pressable>
            </View>
            {WISHLIST_ITEMS.map((item) => {
              const done = doneWishlistIds.includes(item.id);
              return (
                <Card key={item.id} style={{ borderRadius: 14, borderCurve: "continuous", padding: 12, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card, boxShadow: theme.shadowSm }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Pressable
                      onPress={() => toggleWishlist(item.id)}
                      style={({ pressed }) => ({
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        borderWidth: 1.5,
                        borderColor: done ? "#854F0B" : theme.border,
                        backgroundColor: done ? "#854F0B" : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: pressed ? 0.84 : 1,
                      })}
                    >
                      {done ? <FontAwesome name="check" size={9} color="#ffffff" /> : null}
                    </Pressable>
                    <View style={{ flex: 1 }}>
                      <Text selectable style={{ color: done ? theme.mutedForeground : theme.foreground, textDecorationLine: item.id === "bookshelf" || done ? "line-through" : "none", fontFamily: "Geist", fontWeight: "700" }}>
                        {item.name}
                      </Text>
                      <Text selectable variant="muted" style={{ color: theme.mutedForeground, marginTop: 2 }}>
                        {item.meta}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700" }}>
                        {item.price}
                      </Text>
                      <Badge variant="outline" color={item.priority === "Priority 1" ? "warning" : "secondary"}>
                        {item.priority}
                      </Badge>
                    </View>
                  </View>
                </Card>
              );
            })}
            <Card style={{ borderRadius: 12, borderCurve: "continuous", padding: 12, borderWidth: 1, borderColor: "rgba(42, 42, 54, 0.9)", backgroundColor: "rgba(19, 19, 31, 0.96)", flexDirection: "row", gap: 8 }}>
              <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: "#9b8fff", marginTop: 5 }} />
              <Text selectable variant="small" style={{ color: theme.primary, flex: 1, lineHeight: 18 }}>
                Total wishlist budget: GHc 800-1,200 for all priority items. The reading chair alone would complete the Rest zone and strengthen your Faith anchor.
              </Text>
            </Card>
          </Animated.View>
        ) : null}

        {view === "vibe" ? (
          <Animated.View entering={FadeInDown.delay(100).duration(420)} style={{ gap: 12 }}>
            <Card style={{ borderRadius: 16, borderCurve: "continuous", padding: 16, borderWidth: 1, borderColor: "#3d2a08", backgroundColor: "#1a1408" }}>
              <Text selectable variant="muted" style={{ color: "#ba7517", textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700", marginBottom: 6 }}>
                Active vibe
              </Text>
              <Text selectable style={{ color: "#e8c080", fontFamily: "Geist", fontWeight: "700", fontSize: 18, marginBottom: 6 }}>
                Calm · functional · warm minimal
              </Text>
              <Text selectable variant="small" style={{ color: "#7a6030", lineHeight: 20 }}>
                Neutral tones, warm lighting, clear surfaces. Every item earns its place. Nothing decorative without function.
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {["Warm neutrals", "Wood tones", "Clear surfaces", "Low clutter", "Faith-intentional"].map((tag) => (
                  <View key={tag} style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: tag === "Faith-intentional" ? "#2a2040" : "#252010", borderWidth: 1, borderColor: tag === "Faith-intentional" ? "#3d3570" : "#3d3010" }}>
                    <Text selectable variant="muted" style={{ color: tag === "Faith-intentional" ? "#9b8fff" : "#ba7517", fontFamily: "Geist", fontWeight: "700" }}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>

            <Text selectable variant="muted" style={{ textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700" }}>
              Zone vibe
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {VIBE_CARDS.map((item) => {
                const active = item.id === activeVibeId;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setActiveVibeId(item.id)}
                    style={({ pressed }) => ({
                      width: "48.5%",
                      minWidth: 150,
                      borderRadius: 14,
                      borderCurve: "continuous",
                      padding: 12,
                      alignItems: "center",
                      backgroundColor: active ? "#1a1408" : theme.card,
                      borderWidth: 1,
                      borderColor: active ? "#3d2a08" : theme.border,
                      opacity: pressed ? 0.88 : 1,
                    })}
                  >
                    <FontAwesome name={item.icon} size={22} color={active ? "#e8a84a" : theme.foreground} />
                    <Text selectable variant="small" style={{ color: theme.foreground, fontFamily: "Geist", fontWeight: "700", marginTop: 6 }}>
                      {item.title}
                    </Text>
                    <Text selectable variant="muted" style={{ color: theme.mutedForeground, textAlign: "center", marginTop: 2 }}>
                      {item.description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Card style={{ borderRadius: 14, borderCurve: "continuous", padding: 14, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card }}>
              <Text selectable variant="muted" style={{ color: theme.mutedForeground, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Geist", fontWeight: "700", marginBottom: 8 }}>
                Principles
              </Text>
              <View style={{ gap: 8 }}>
                {[
                  "One room serves four needs - design each zone to feel distinct without physical separation.",
                  "The Rest zone anchors the Faith domain - it should feel like a sanctuary, not just a chair corner.",
                  "Buy slowly and intentionally - each item should solve a problem or serve a specific zone function.",
                ].map((rule) => (
                  <View key={rule} style={{ flexDirection: "row", gap: 8 }}>
                    <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: "#854F0B", marginTop: 6 }} />
                    <Text selectable variant="small" style={{ color: theme.foreground, flex: 1, lineHeight: 18 }}>
                      {rule}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>

            <Card style={{ borderRadius: 14, borderCurve: "continuous", padding: 14, borderWidth: 1, borderColor: "rgba(42, 42, 54, 0.9)", backgroundColor: "rgba(19, 19, 31, 0.96)", flexDirection: "row", gap: 10 }}>
              <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#9b8fff", marginTop: 5 }} />
              <View style={{ flex: 1 }}>
                <Text selectable variant="small" style={{ color: "#8888a0", lineHeight: 20, marginBottom: 8 }}>
                  Your Space direction is clear and consistent. The Rest zone is the one that is not there yet - once it is, the room works across all four functions without friction.
                </Text>
                <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                  <MiniAction label="Design Rest zone" onPress={() => openStub("Rest zone brief", "Generating a full design brief is not wired yet.")} />
                  <MiniAction label="Space ideas" onPress={() => openStub("Space ideas", "Idea generation is not wired yet.")} />
                </View>
              </View>
            </Card>
          </Animated.View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ZoneBox({
  title,
  subtitle,
  color,
  background,
  statusColor,
  style,
  onPress,
}: {
  title: string;
  subtitle: string;
  color: string;
  background: string;
  statusColor: string;
  style: object;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          position: "absolute",
          borderRadius: 8,
          borderCurve: "continuous",
          padding: 8,
          justifyContent: "flex-end",
          backgroundColor: background,
          borderWidth: 1,
          borderColor: background === "#0e1a0e" ? "#1a3a1a" : background === "#141420" ? "#1e1e30" : background === "#1a1610" ? "#2a2818" : "#3d2a08",
          opacity: pressed ? 0.84 : 1,
        },
        style,
      ]}
    >
      <View style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: 999, backgroundColor: statusColor }} />
      <Text selectable variant="muted" style={{ color, fontFamily: "Geist", fontWeight: "700" }}>
        {title}
      </Text>
      <Text selectable variant="muted" style={{ color, opacity: 0.7 }}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

function MiniAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 999,
        borderCurve: "continuous",
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: "#1e1a30",
        borderWidth: 1,
        borderColor: "#3d3570",
        opacity: pressed ? 0.84 : 1,
      })}
    >
      <Text selectable variant="small" style={{ color: "#9b8fff", fontFamily: "Geist", fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}
