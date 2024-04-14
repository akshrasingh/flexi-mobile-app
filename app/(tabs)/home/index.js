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
import moment from "moment";
import CommentText from "../../../components/CommentText";

import CommentModal from "../../../components/Comments";

const fetchAllPosts = async (userId, setPosts) => {
  try {
    const response = await axios.get(`http://192.168.1.3:3000/all`);
    const fetchedPosts = response.data.posts.map((post) => ({
      ...post,
      isLiked: post.like.includes(userId), // Initialize liked state based on whether the user has liked the post
    }));
    setPosts(fetchedPosts);
  } catch (error) {
    console.log("error fetching posts", error);
  }
};
const index = () => {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showBox, setBox] = useState(false); // Set to true to always show the modal for demonstration purposes
  const [postId, setPostId] = useState(null); // Store the postId in this variable

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
    fetchAllPosts(userId, setPosts);
  }, [userId]);
  const handleCommentIconClick = (postId) => {
    setBox((prevBox) => !prevBox); // Toggle the showBox state
    setPostId(postId); // Set the postId in the variable
  };
  const targetPost = posts.find((post) => post._id === postId);
  const MAX_LINES = 2;
  const MAX_WORDS = 25;
  const [showfullText, setShowfullText] = useState(false);
  const toggleShowFullText = () => {
    setShowfullText(!showfullText);
  };

  const handleLikePost = async (post, userId) => {
    try {
      const response = await axios.post(
        `http://192.168.1.3:3000/tweet/${post._id}/likeOrDislike`,
        { userId }
      );
      if (response.status === 200) {
        const message = response.data.message;
        if (
          message === "User liked the tweet" ||
          message === "User disliked the tweet"
        ) {
          // Toggle the isLiked state
          setPosts((prevPosts) =>
            prevPosts.map((prevPost) =>
              prevPost._id === post._id
                ? { ...prevPost, isLiked: !prevPost.isLiked }
                : prevPost
            )
          );
        }
      }
    } catch (error) {
      console.log("Error liking/unliking the post", error);
    }
  };
  console.log("popo", user);
  // Function to send a comment
  const sendComment = async (postId, commentText) => {
    try {
      // Send comment to server
      const response = await axios.post(
        `http://192.168.1.3:3000/tweet/${postId}/comment`,
        { comments: { name: user.name, text: commentText } }
      );

      console.log("Comment sent successfully:", response.data);

      // Refresh posts to reflect the new comment
    } catch (error) {
      console.log("Error sending comment:", error);
    }
  };

  const reversedPosts = [...posts].reverse();
  const router = useRouter();
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch the updated data or perform any necessary actions
      await fetchAllPosts(userId, setPosts);
    } catch (error) {
      console.log("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View
        style={{
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Pressable onPress={() => router.push("/home/profile")}>
          <Image
            style={{ width: 30, height: 30, borderRadius: 15 }}
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
          <TextInput placeholder="search" />
        </Pressable>

        <Ionicons name="chatbox-ellipses-outline" size={24} color="black" />
      </View>

      <View>
        {reversedPosts?.map((item, index) => (
          <View key={index}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginHorizontal: 10,
              }}
              key={index}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Image
                  style={{ width: 40, height: 45, borderRadius: 30 }}
                  source={{
                    uri: item?.userId?.profileImage
                      ? item.userId.profileImage
                      : "https://i.pinimg.com/564x/63/cf/71/63cf712306660342b65226e3fa2f257e.jpg",
                  }}
                />

                <View style={{ flexDirection: "column", gap: 2 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600" }}>
                    {item?.userId?.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      width: 230,
                      color: "gray",
                      fontSize: 15,
                      fontWeight: "400",
                    }}
                  >
                    Engineer Graduate | LinkedIn Member
                  </Text>
                  <Text style={{ color: "gray" }}>
                    {moment(item.createdAt).format("MMMM Do YYYY")}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    marginLeft: 10,
                  }}
                >
                  <Entypo name="dots-three-vertical" size={20} color="black" />

                  <Feather name="x" size={20} color="black" />
                </View>
              </View>
            </View>
            <View
              style={{ marginTop: 10, marginHorizontal: 10, marginBottom: 12 }}
            >
              <Text
                style={{ fontSize: 15 }}
                numberOfLines={showfullText ? undefined : MAX_LINES}
              >
                {item?.description}
              </Text>
              {item?.description.split(/\s+/).length > MAX_WORDS &&
                !showfullText && (
                  <Pressable onPress={toggleShowFullText}>
                    <Text>See more</Text>
                  </Pressable>
                )}
            </View>
            {item.imageUrl && (
              <Image
                style={{ width: "100%", height: 260, objectFit: "contain" }}
                source={{ uri: item.imageUrl }}
              />
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-around",
                marginVertical: 10,
              }}
            >
              <Pressable onPress={() => handleLikePost(item, userId)}>
                <AntDesign
                  style={{ textAlign: "center" }}
                  name="like2"
                  size={30}
                  color={item.isLiked ? "red" : "gray"}
                />

                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 10,
                    color: "gray",
                    marginTop: 2,
                  }}
                >
                  Like
                </Text>
              </Pressable>

              {item.comments.length > 0 && showBox && (
                <CommentModal
                  postId={postId}
                  comments={targetPost.comments}
                  sendComment={sendComment}
                />
              )}

              <Pressable onPress={() => handleCommentIconClick(item._id)}>
                <FontAwesome
                  name="comment-o"
                  size={30}
                  color="gray"
                  style={{ textAlign: "center" }}
                />
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 10,
                    color: "gray",
                    marginTop: 2,
                  }}
                >
                  Comment
                </Text>
              </Pressable>

              <Pressable>
                <Feather
                  name="repeat"
                  size={15}
                  color="gray"
                  style={{ textAlign: "center" }}
                />

                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 10,
                    color: "gray",
                    marginTop: 2,
                  }}
                >
                  Repost
                </Text>
              </Pressable>
              <Pressable>
                <Feather name="send" size={15} color="gray" />
                <Text style={{ marginTop: 2, fontSize: 10, color: "gray" }}>
                  Send
                </Text>
              </Pressable>
            </View>
            <View
              style={{
                height: 2,
                borderColor: "#E0E0E0",
                borderWidth: 1.5,
              }}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default index;

const styles = StyleSheet.create({});
