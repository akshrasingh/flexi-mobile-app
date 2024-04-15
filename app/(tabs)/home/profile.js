import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Button,
  TextInput,
} from "react-native";
import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { firebase } from "../../../firebase";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import base64 from "base-64";
import {
  Ionicons,
  Entypo,
  Feather,
  FontAwesome,
  AntDesign,
} from "@expo/vector-icons";
const profile = () => {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState();
  const [image, setImage] = useState("");
  const router = useRouter();
  const [userDescription, setUserDescription] = useState("");
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
        `http://192.168.153.80:3000/profile/${userId}`
      );
      const userData = response.data.user;

      setUser(userData);
    } catch (error) {
      console.log("error fetching user profile", error);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const handleSaveDescription = async () => {
    try {
      const response = await axios.put(
        `http://192.168.153.80:3000/profile/${userId}`,
        {
          userDescription,
        }
      );

      if (response.status === 200) {
        await fetchUserProfile();

        setIsEditing(false);
      }
    } catch (error) {
      console.log("Error saving user description", error);
    }
  };
  const logout = () => {
    clearAuthToken();
  };
  const clearAuthToken = async () => {
    await AsyncStorage.removeItem("authToken");
    console.log("auth token cleared");
    router.replace("/(authenticate)/login");
  };
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  const setDp = async () => {
    try {
      const uploadedUrl = await uploadFile();

      const postData = {
        profileImage: uploadedUrl,
        userId: userId,
      };

      const response = await axios.post(
        "http://192.168.153.80:3000/setprofile",
        postData
      );

      console.log("Profile Pic uploaded", response.data);
      if (response.status === 201) {
        router.replace("/(tabs)/home/index");
      }
    } catch (error) {
      console.log("error creating post", error);
    }
  };
  const uploadFile = async () => {
    try {
      // Ensure that 'image' contains a valid file URI
      console.log("Image URI:", image);

      const { uri } = await FileSystem.getInfoAsync(image);

      if (!uri) {
        throw new Error("Invalid file URI");
      }

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = (e) => {
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      const filename = image.substring(image.lastIndexOf("/") + 1);

      const ref = firebase.storage().ref().child(filename);
      await ref.put(blob);

      const downloadURL = await ref.getDownloadURL();
      // setUrl(downloadURL);
      return downloadURL;
      // Alert.alert("Photo uploaded");
    } catch (error) {
      console.log("Error:", error);
      // Handle the error or display a user-friendly message
    }
  };

  return (
    <View>
      <View
        style={{
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Pressable>
          <Image
            style={{ width: 35, height: 35, borderRadius: 15 }}
            source={{
              uri:
                user && user.profileImage
                  ? user.profileImage
                  : "https://i.pinimg.com/564x/63/cf/71/63cf712306660342b65226e3fa2f257e.jpg",
            }}
          />
        </Pressable>

        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 7,
            gap: 10,
            backgroundColor: "white",
            borderRadius: 3,
            height: 30,
            flex: 1,
          }}
        >
          <AntDesign
            style={{ marginLeft: 10 }}
            name="search1"
            size={20}
            color="black"
          />
          <TextInput placeholder="Search" />
        </Pressable>

        <Ionicons name="chatbox-ellipses-outline" size={24} color="black" />
      </View>

      <Image
        style={{ width: "100%", height: 130 }}
        source={{
          uri: "https://media.istockphoto.com/id/937025430/photo/abstract-defocused-blue-soft-background.jpg?b=1&s=612x612&w=0&k=20&c=FwJnRNxkX_lZKImOoJbo5VsgZPCMNiODdsRsggJqejA=",
        }}
      />

      <Pressable
        onPress={pickImage}
        style={{ position: "absolute", top: 130, left: 10 }}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: 120, height: 120, borderRadius: 20 }}
          />
        ) : (
          <View>
            <Image
              style={{ width: 120, height: 120, borderRadius: 20 }}
              source={{
                uri:
                  user && user.profileImage
                    ? user.profileImage
                    : "https://i.pinimg.com/564x/63/cf/71/63cf712306660342b65226e3fa2f257e.jpg",
              }}
            />
          </View>
        )}
      </Pressable>

      <View style={{ marginTop: 80, marginHorizontal: 10 }}>
        <Text style={{ fontSize: 17, fontWeight: "bold" }}>{user?.name}</Text>
        <Pressable onPress={() => setIsEditing(!isEditing)}>
          <Text>{user?.userDescription ? "Edit" : "Add Bio"}</Text>
        </Pressable>

        <View>
          {isEditing ? (
            <>
              <TextInput
                placeholder="enter your description"
                value={userDescription}
                onChangeText={(text) => setUserDescription(text)}
              />

              <Button onPress={handleSaveDescription} title="Save" />
            </>
          ) : (
            <Text>{user?.userDescription}</Text>
          )}
        </View>

        <Text style={{ marginTop: 12, fontWeight: "500", fontSize: 15 }}>
          Youtube • JobNest Member
        </Text>
        <Text style={{ fontSize: 15, color: "gray" }}>
          Bengaluru, Karnataka, India
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginTop: 12,
          marginHorizontal: 10,
        }}
      >
        <Pressable
          onPress={setDp}
          style={{
            backgroundColor: "#0072b1",
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 25,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Upload DP</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/home/bookmark")}
          style={{
            backgroundColor: "#0072b1",
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 25,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>Bookmarks</Text>
        </Pressable>
      </View>

      <View style={{ marginHorizontal: 10, marginTop: 10 }}>
        <Text style={{ fontSize: 17, fontWeight: "bold" }}>Analytics</Text>
        <Text style={{ fontSize: 15, color: "gray", marginTop: 2 }}>
          Private to you
        </Text>

        <View style={{ flexDirection: "row", gap: 7, marginTop: 10 }}>
          <Ionicons name="people" size={28} color="black" />
          <View style={{ marginLeft: 7 }}>
            <Text style={{ fontSize: 15, fontWeight: "600" }}>
              350 profile views
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "500",
                color: "gray",
                marginTop: 1,
              }}
            >
              Discover who's viewed your profile
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 7, marginTop: 10 }}>
          <Entypo name="bar-graph" size={24} color="black" />
          <View style={{ marginLeft: 7 }}>
            <Text style={{ fontSize: 15, fontWeight: "600" }}>
              1242 post Impressions
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "500",
                color: "gray",
                marginTop: 1,
              }}
            >
              Checkout who's engaing with your posts
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 7, marginTop: 10 }}>
          <Feather name="search" size={24} color="black" />
          <View style={{ marginLeft: 7 }}>
            <Text style={{ fontSize: 15, fontWeight: "600" }}>
              45 post appearenced
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "500",
                color: "gray",
                marginTop: 1,
              }}
            >
              see how often you appear in search results
            </Text>
          </View>
        </View>
      </View>

      <Pressable onPress={logout} style={styles.button}>
        <Text>Logout</Text>
      </Pressable>
    </View>
  );
};

export default profile;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007bff", // Blue color, you can change it to any color you want
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
