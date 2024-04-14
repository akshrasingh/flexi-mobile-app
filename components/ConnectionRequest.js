import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const ConnectionRequest = ({ item, friends, setFriends, userId }) => {
  return (
    <View style={{ marginHorizontal: 15, marginVertical: 5 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
        <Text>{item.name}</Text>
        <Text style={{ width: 200 }}>
          {item?.name} is Inviting you to Connect
        </Text>
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: 7 }}
        ></View>
      </View>
    </View>
  );
};

export default ConnectionRequest;

const styles = StyleSheet.create({});
