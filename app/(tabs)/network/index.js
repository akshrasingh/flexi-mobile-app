import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import base64 from "base-64";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import UserProfile from "../../../components/UserProfile";
import ConnectionRequest from "../../../components/ConnectionRequest";

const index = () => {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState();
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const [, payloadEncoded] = token.split(".");
          const payload = JSON.parse(base64.decode(payloadEncoded));
          const userId = payload.userId;
          setUserId(userId);
        } else {
          console.log("No token found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.3:3000/profile/${userId}`
      );
      const userData = response.data.user;

      setUser(userData);
    } catch (error) {
      console.log("error fetching user profile", error);
    }
  };
  useEffect(() => {
    if (userId) {
      fetchUsers();
    }
  }, [userId]);
  const fetchUsers = async () => {
    axios
      .get(`http://192.168.1.3:3000/users/${userId}`)
      .then((response) => {
        setUsers(response.data);
        // Log the fetched users here
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    if (userId) {
      fetchFollower();
    }
  }, [userId]);
  const fetchFollower = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.3:3000/follow/${userId}`
      );

      if (response.status === 200) {
        const followerIds = response.data;
        // Fetch user details for each follower ID
        const followersDetails = await Promise.all(
          followerIds.map(async (followerId) => {
            try {
              const followerResponse = await axios.get(
                `http://192.168.1.3:3000/profile/${followerId}`
              );

              if (followerResponse.status === 200) {
                const followerData = followerResponse.data.user;
                return {
                  _id: followerData._id,
                  name: followerData.name,
                  email: followerData.email,
                };
              }
            } catch (error) {
              console.log("Error fetching follower details:", error);
              return null;
            }
          })
        );
        // Filter out null values (in case of errors)
        const validFollowersDetails = followersDetails.filter(
          (follower) => follower !== null
        );

        // Update state with follower details
        setFriends(validFollowersDetails);
      }
    } catch (error) {
      console.log("Error fetching followers:", error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <Pressable
        style={{
          marginTop: 10,
          marginHorizontal: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>
          Manage My Network
        </Text>
        <AntDesign name="arrowright" size={22} color="black" />
      </Pressable>

      <View
        style={{ borderColor: "#E0E0E0", borderWidth: 2, marginVertical: 10 }}
      />

      <View
        style={{
          marginTop: 10,
          marginHorizontal: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>Invitations (0)</Text>
        <AntDesign name="arrowright" size={22} color="black" />
      </View>

      <View
        style={{ borderColor: "#E0E0E0", borderWidth: 2, marginVertical: 10 }}
      />

      <View>
        {friends?.map((item, index) => (
          <ConnectionRequest
            item={item}
            key={index}
            friends={friends}
            setFriends={setFriends}
            userId={userId}
          />
        ))}
      </View>

      <View style={{ marginHorizontal: 15 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text>Grow your network faster</Text>
          <Entypo name="cross" size={24} color="black" />
        </View>

        <Text>
          Find and contact the right people. Plus see who's viewed your profile
        </Text>
        <View
          style={{
            backgroundColor: "#FFC72C",
            width: 140,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 25,
            marginTop: 8,
          }}
        >
          <Text
            style={{ textAlign: "center", color: "white", fontWeight: "600" }}
          >
            Try Premium
          </Text>
        </View>
      </View>
      <FlatList
        data={users}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        numColumns={2}
        keyExtractor={(item) => item._id}
        renderItem={({ item, key }) => (
          <UserProfile userId={userId} item={item} key={index} />
        )}
      />
    </ScrollView>
  );
};

export default index;

const styles = StyleSheet.create({});
