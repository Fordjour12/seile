import { ScrollView, Text, View, StyleSheet } from "react-native";

import { Container } from "@/components/container";
import { NAV_THEME, Typography } from "@/lib/constants";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function TabOne() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Container>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[Typography.displayLG, { color: theme.text }]}>
            Tab One
          </Text>
          <Text
            style={[
              Typography.bodyMD,
              { color: theme.text, opacity: 0.7, marginTop: 8 },
            ]}
          >
            Explore the first section of your app
          </Text>
          <Text
            style={[
              { fontFamily: "Figtree", fontSize: 30, fontWeight: 400 },
              { color: theme.text, opacity: 0.7, marginTop: 8 },
            ]}
          >
            Hello World !!!
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 16,
  },
  content: {
    paddingVertical: 16,
  },
  text: {
    color: "white",
    fontSize: 30,
    fontWeight: "700",
    fontFamily: "Geist",
  },
});
