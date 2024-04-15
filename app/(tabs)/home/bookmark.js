import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  RefreshControl,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import base64 from "base-64";
import { Ionicons, Entypo, Feather, FontAwesome } from "@expo/vector-icons";
import { SimpleLineIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
let store = [];
const Bookmark = () => {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState();
  const [store, setStore] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

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
  useEffect(() => {
    // Log the store array whenever it changes
  }, [store]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `http://192.168.153.80:3000/profile/${userId}`
      );
      const userData = response.data.user;

      setUser(userData);
      if (userData && userData.bookmarks) {
        setStore(userData.bookmarks);
      }
    } catch (error) {
      console.log("error fetching user profile", error);
    }
  };

  return (
    <ScrollView>
      {store.map((post) => (
        <View key={post.id} style={styles.postContainer}>
          <View style={styles.userInfo}>
            <Image
              style={{ width: 30, height: 30, borderRadius: 15 }}
              source={{
                uri:
                  post.userId && post.userId.profileImage
                    ? post.userId.profileImage
                    : "https://i.pinimg.com/564x/63/cf/71/63cf712306660342b65226e3fa2f257e.jpg",
              }}
            />
            {console.log("fadf----", post)}
            <Text style={styles.username}>{user && user.username}</Text>
          </View>
          <Text style={styles.description}>{post.description}</Text>
          {post.image && (
            <Image
              source={{ uri: post.image }} // Assuming post image URL is stored in the 'image' field of the post object
              style={styles.postImage}
            />
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default Bookmark;

const styles = StyleSheet.create({
  postContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontWeight: "bold",
  },
  description: {
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    marginBottom: 10,
  },
});
