import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

const MAX_LINES = 2;
const MAX_WORDS = 25;

const SeeMore = ({ item }) => {
  const [showFullText, setShowFullText] = useState(false);

  const toggleShowFullText = () => {
    setShowFullText(!showFullText);
  };

  return (
    <View>
      <Text
        style={{ fontSize: 15 }}
        numberOfLines={showFullText ? undefined : MAX_LINES}
      >
        {item?.description}
      </Text>
      {item?.description.split(/\s+/).length > MAX_WORDS && !showFullText && (
        <Pressable onPress={toggleShowFullText}>
          <Text style={{ color: "gray" }}>See more</Text>
        </Pressable>
      )}
    </View>
  );
};

export default SeeMore;
