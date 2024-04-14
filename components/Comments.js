import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, Button } from "react-native";
import CommentText from "./CommentText";

const CommentModal = ({ postId, comments, sendComment }) => {
  const [showModal, setShowModal] = useState(true); // Set to true to always show the modal for demonstration purposes

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal by changing the state
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showModal} // Always visible when the component renders
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 10,
            width: "90%",
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 10, fontWeight: 700 }}>
            Comment Section
          </Text>
          {comments.map((comment, index) => (
            <View key={comment._id} style={{ marginBottom: 10 }}>
              <Text style={{ fontWeight: "bold" }}>{comment.name}: </Text>
              <Text>{comment.text}</Text>
            </View>
          ))}
          <CommentText postId={postId} sendComment={sendComment} />
          <Button title="Close" onPress={handleCloseModal} />
        </View>
      </View>
    </Modal>
  );
};

export default CommentModal;
