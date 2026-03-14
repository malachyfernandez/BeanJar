import React from 'react';
import Post from './Post';

interface PostListProps {
    posts: any[] | undefined;
}

const PostList = ({ posts }: PostListProps) => {
    return (
        <>
            {posts?.map((post, index) => {
                const title = post?.value?.title ?? '';
                const description = post?.value?.description ?? '';
                const postId = post?.itemId ?? '';
                return (
                    <Post
                        key={index}
                        title={title}
                        description={description}
                        postId={postId}
                    />
                );
            })}
        </>
    );
};

export default PostList;
