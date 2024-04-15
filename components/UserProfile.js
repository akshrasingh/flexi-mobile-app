import {
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
} from "react-native";
import React, { useState } from "react";

const UserProfile = ({ item, userId }) => {
  const [followStatus, setFollowStatus] = useState(
    item?.followers?.includes(userId)
  );

  const followFunc = async (currentUserId, selectedUserId) => {
    if (followStatus) {
      return; // Do nothing if already following
    }

    try {
      const response = await fetch("http://192.168.153.80:3000/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentUserId, selectedUserId }),
      });

      if (response.ok) {
        setFollowStatus(true);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        borderRadius: 9,
        marginHorizontal: 16,
        borderColor: "#E0E0E0",
        borderWidth: 1,
        marginVertical: 10,
        justifyContent: "center",
        height: Dimensions.get("window").height / 3,
        width: (Dimensions.get("window").width - 80) / 2,
      }}
    >
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Image
          style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            resizeMode: "cover",
          }}
          source={{
            uri: item?.profileImage
              ? item.profileImage
              : "https://i.pinimg.com/564x/63/cf/71/63cf712306660342b65226e3fa2f257e.jpg",
          }}
        />
      </View>

      <View style={{ marginTop: 10 }}>
        <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "600" }}>
          {item?.name}
        </Text>
        <Text
          style={{
            textAlign: "center",
            marginLeft: 1,
            marginTop: 2,
            marginBottom: 7,
          }}
        >
          Engineer Graduate | Linkedin member
        </Text>
      </View>
      {followStatus ? (
        <Text
          style={{
            fontWeight: "600",
            textAlign: "center",
            color: "black",
            marginTop: 7,
          }}
        >
          Following
        </Text>
      ) : (
        <Pressable
          onPress={() => followFunc(userId, item._id)}
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            borderColor: "#1A1148",
            borderWidth: 1.5,
            borderRadius: 25,
            marginTop: 7,
            paddingHorizontal: 15,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{ fontWeight: "600", color: "#1A1148", textAlign: "center" }}
          >
            Connect
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default UserProfile;

const styles = StyleSheet.create({});
