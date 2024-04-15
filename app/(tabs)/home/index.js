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
import SeeMore from "../../../components/SeeMore";
import Bookmark from "../../../components/Bookmark";
let likes = {};
const fetchAllPosts = async (userId, setPosts) => {
  try {
    const response = await axios.get(`http://192.168.153.80:3000/all`);
    const fetchedPosts = response.data.posts.map((post) => ({
      ...post,
      isLiked: post.like.includes(userId), // Initialize liked state based on whether the user has liked the post
    }));
    const counts = {};
    fetchedPosts.forEach((post) => {
      counts[post._id] = post.like.length;
    });

    setPosts(fetchedPosts);
    likes = counts;
  } catch (error) {
    console.log("error fetching posts", error);
    return {};
  }
};
const index = () => {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showBox, setBox] = useState(false); // Set to true to always show the modal for demonstration purposes
  const [postId, setPostId] = useState(null); // Store the postId in this variable
  const [likeCounts, setLikeCounts] = useState({});
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
  useEffect(() => {
    const likes = fetchAllPosts(userId, setPosts);
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

  const handleLikePost = async (post, userId, isliked) => {
    try {
      if (!isliked) {
        likes[post._id] = likes[post._id] + 1;
      } else {
        likes[post._id] = likes[post._id] - 1;
      }
      const response = await axios.post(
        `http://192.168.153.80:3000/tweet/${post._id}/likeOrDislike`,
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

  // Function to send a comment
  const sendComment = async (postId, commentText) => {
    try {
      // Send comment to server
      const response = await axios.post(
        `http://192.168.153.80:3000/tweet/${postId}/comment`,
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

  const handleDeletePost = async (postId) => {
    try {
      // Send a request to delete the post by its ID
      const response = await axios.delete(
        `http://192.168.153.80:3000/delete/${postId}`
      );

      // Remove the deleted post from the local state
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));

      console.log(response.data.message); // Log success message
    } catch (error) {
      console.log("Error deleting the post", error);
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

        <Text
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 90,
            fontSize: 19,
            fontWeight: 800,
            gap: 10,
            borderRadius: 3,
            borderColor: "gray",
            height: 30,
            flex: 1,
          }}
        >
          Lets JobNest
        </Text>

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
                    Engineer Graduate | JobNest Member
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
                    marginLeft: 30,
                  }}
                >
                  <Pressable onPress={() => handleDeletePost(item._id)}>
                    <Feather name="x" size={20} color="black" />
                  </Pressable>
                </View>
              </View>
            </View>
            <View
              style={{ marginTop: 10, marginHorizontal: 10, marginBottom: 12 }}
            >
              <SeeMore item={item} />
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
              <Pressable
                onPress={() => handleLikePost(item, userId, item.isLiked)}
              >
                <AntDesign
                  style={{ textAlign: "center" }}
                  name="like2"
                  size={25}
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
                  {likes[item._id] || 0} Likes
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
                  size={25}
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

              <Bookmark userId={userId} post={item} />
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
