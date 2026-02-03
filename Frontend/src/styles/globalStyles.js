import { StyleSheet } from "react-native";
import colors from "./colors";


export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c7fdc9",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primaryGreen,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primaryGreen,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  button: {
    backgroundColor: colors.primaryGreen,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});
