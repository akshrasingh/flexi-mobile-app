import React, { useState, useEffect } from "react";
import { Pressable, Text } from "react-native";
import { Entypo, Feather } from "@expo/vector-icons";
import axios from "axios";

const Bookmark = ({ userId, post }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // Check if the post is already bookmarked when the component mounts
    checkBookmarkStatus();
  }, []);

  const checkBookmarkStatus = async () => {
    try {
      const response = await axios.get(
        `http:// 192.168.153.80:3000/checkBookmark/${userId}/${post._id}`
      );
      setIsBookmarked(response.data.isBookmarked);
    } catch (error) {
      console.log("Error checking bookmark status:", error);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      if (isBookmarked) {
        // If post is already bookmarked, remove it from bookmarks
        await axios.post(`http://192.168.153.80:3000/bookmark/${post._id}`, {
          post: {
            id: post._id,
            userId: post.userId,
            image: post.imageUrl,

            description: post.description,
            createdAt: post.createdAt,
          },
          userId: userId,
        });
        setIsBookmarked(false);
      } else {
        // If post is not already bookmarked, add it to bookmarks
        await axios.post(`http://192.168.153.80:3000/bookmark/${userId}`, {
          post: {
            id: post._id,
            userId: post.userId,
            description: post.description,
            image: post.imageUrl,
            createdAt: post.createdAt,
          },
          userId: userId,
        });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.log("Error toggling bookmark:", error);
    }
  };

  return (
    <Pressable onPress={handleToggleBookmark}>
      {isBookmarked ? (
        <>
          <Entypo name="bookmark" size={24} color="gray" />
          <Text>Bookmark</Text>
        </>
      ) : (
        <>
          <Feather name="bookmark" size={24} color="gray" />
          <Text>Bookmark</Text>
        </>
      )}
    </Pressable>
  );
};

export default Bookmark;
