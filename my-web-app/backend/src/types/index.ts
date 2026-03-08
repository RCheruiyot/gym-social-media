export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Post {
    id: string;
    userId: string;
    title: string;
    content: string;
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    content: string;
}