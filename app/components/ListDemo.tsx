import React from "react";
import { View, TouchableOpacity } from "react-native";
import PoppinsText from "./PoppinsText";
import ContainerCol from "./ContainerCol";
import { useUserList } from "../../hooks/useUserList";
import { useUserListGet } from "../../hooks/useUserListGet";
import { useUserListSet } from "../../hooks/useUserListSet";
import { useUserListRemove } from "../../hooks/useUserListRemove";
import { useUserListPrivacy } from "../../hooks/useUserListPrivacy";

type Post = {
  title: string;
  body: string;
  rank: number;
};

export default function ListDemo() {
  const setListItem = useUserListSet<Post>();
  const removeListItem = useUserListRemove();
  const setListPrivacy = useUserListPrivacy();

  const [postA, setPostA] = useUserList<Post>({
    key: "posts",
    itemId: "post_a",
    defaultValue: {
      title: "First Post",
      body: "Hello world",
      rank: 1,
    },
    privacy: "PUBLIC",
    searchKeys: ["title", "body", "PROPERTY_ITEMID"],
    filterKey: "title",
    sortKey: "rank",
  });

  const posts = useUserListGet<Post>({
    key: "posts",
    returnTop: 10,
  });

  return (
    <View className="w-full h-full p-8">
      <ContainerCol gap={2}>
        <PoppinsText weight="bold">List Demo</PoppinsText>

        <PoppinsText>{`Editing item: ${postA.itemId}`}</PoppinsText>
        <PoppinsText>{postA.value?.title ?? "No title"}</PoppinsText>

        <TouchableOpacity
          className="bg-slate-700 p-3 rounded"
          onPress={() =>
            setPostA({
              title: "Updated First Post",
              body: "Still here",
              rank: (postA.value?.rank ?? 0) + 1,
            })
          }
        >
          <PoppinsText>Update Post A</PoppinsText>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-slate-700 p-3 rounded"
          onPress={() =>
            setListItem({
              key: "posts",
              itemId: `post_${Date.now()}`,
              value: {
                title: "New Post",
                body: "Created from useUserListSet",
                rank: Date.now(),
              },
            })
          }
        >
          <PoppinsText>Add New Post</PoppinsText>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-slate-700 p-3 rounded"
          onPress={() =>
            setListPrivacy({
              key: "posts",
              privacy: "PUBLIC",
            })
          }
        >
          <PoppinsText>Make Posts Public</PoppinsText>
        </TouchableOpacity>

        <ContainerCol gap={1}>
          {posts?.map((post: any) => (
            <View
              key={post.id}
              className="bg-slate-800 p-3 rounded flex-row justify-between"
            >
              <ContainerCol>
                <PoppinsText weight="medium">
                  {post.value?.title ?? "Untitled"}
                </PoppinsText>
                <PoppinsText>{post.itemId}</PoppinsText>
              </ContainerCol>

              <TouchableOpacity
                className="bg-red-500 px-3 py-2 rounded"
                onPress={() => {
                  if (!post.itemId) return;
                  removeListItem({
                    key: "posts",
                    itemId: post.itemId,
                  });
                }}
              >
                <PoppinsText>Delete</PoppinsText>
              </TouchableOpacity>
            </View>
          ))}
        </ContainerCol>
      </ContainerCol>
    </View>
  );
}
