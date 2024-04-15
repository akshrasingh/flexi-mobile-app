import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const ConnectionRequest = ({ item, userId }) => {
  return (
    <View style={{ marginHorizontal: 15, marginVertical: 5 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
        <Image
          style={{ width: 30, height: 30, borderRadius: 15 }}
          source={{
            uri:
              item && item.profileImage
                ? item.profileImage
                : "https://i.pinimg.com/564x/63/cf/71/63cf712306660342b65226e3fa2f257e.jpg",
          }}
        />
        {console.log("ihihi", item)}

        <Text style={{ fontWeight: 700 }}>{item?.name} </Text>
        <Text>Follows you</Text>
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: 7 }}
        ></View>
      </View>
    </View>
  );
};

export default ConnectionRequest;

const styles = StyleSheet.create({});
