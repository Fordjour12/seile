import { Check, Iconoir, IconoirProvider } from "iconoir-react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export const TabBarIcon = (props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) => {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
};

export const TabBarIcon2 = (props: {
  children: React.ReactNode;
  color: string;
  width?: number;
}) => {
  const { children, color, width = 24 } = props;
  return (
    <IconoirProvider
      iconProps={{
        color: color,
        strokeWidth: 1,
        width: width,
        height: width,
      }}
    >
      {children}
    </IconoirProvider>
  );
};
