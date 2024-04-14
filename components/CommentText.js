import React, { useState } from "react";
import { TextInput, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons"; // Assuming Feather is imported

const CommentText = ({ postId, sendComment }) => {
  const [commentText, setCommentText] = useState("");

  const handleCommentChange = (text) => {
    setCommentText(text);
  };

  const handleSendComment = () => {
    if (commentText.trim() !== "") {
      sendComment(postId, commentText);
      setCommentText("");
    }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TextInput
        multiline={true}
        style={{
          flex: 1, // Take up remaining space
          marginRight: 10, // Add some margin between TextInput and Pressable
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          marginBottom: 5,
        }}
        placeholder="Comment"
        value={commentText}
        onChangeText={handleCommentChange}
      />
      <Pressable onPress={handleSendComment}>
        <Feather name="send" size={20} color="black" />
      </Pressable>
    </View>
  );
};

export default CommentText;
