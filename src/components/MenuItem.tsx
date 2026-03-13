import { ChevronRight } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MenuItem = ({ icon, label, onPress, showBorder = true, textColor, c }: any) => (
  <TouchableOpacity
    style={[styles.menuItem, showBorder && { borderBottomColor: c.divider, borderBottomWidth: 1 }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuLeft}>
      <View style={[styles.iconWrapper, { backgroundColor: c.inputBg }]}>
        {icon}
      </View>
      <Text style={[styles.menuLabel, { color: textColor || c.text }]}>{label}</Text>
    </View>
    <ChevronRight size={18} color={c.muted} />
  </TouchableOpacity>
);

export default MenuItem;


const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
  }
});