import { create } from "zustand";
import { FriendlistUser, User } from "./types";

import FriendsService from "../services/backend/friendsService";
import {
  getOnlineStatus,
  setupOnlineStatusListener,
} from "../services/firebase/userService";

interface FriendsState {
  unsubscribeAll: () => void;
  friends: FriendlistUser[] | null;
  setFriends: (friends: FriendlistUser[]) => void;
  updateFriend: (friend: FriendlistUser) => void;
  clearFriends: () => void;
  fetchFriends: (userId: number) => Promise<void>;
}

export const useFriendsStore = create<FriendsState>((set, get) => {
  const friendService = new FriendsService();

  return {
    friends: null,
    setFriends: (friends) => set({ friends }),
    updateFriend: (friend) =>
      set((state) => ({
        friends: state.friends
          ? state.friends.map((f) =>
              f.user!.id === friend.user!.id ? friend : f
            )
          : [friend],
      })),
    clearFriends: () => set({ friends: null }),
    fetchFriends: async (userId: number) => {
      try {
        const response = await friendService.getFriends(userId);
        const users: User[] = response.data;

        let friendlistUsers: FriendlistUser[] = [];
        const unsubscribeCallbacks: (() => void)[] = [];

        const promises = users.map(async (user) => {
          const friend: FriendlistUser = {
            user: user,
            online: false,
          };

          const onlineStatus = await getOnlineStatus(user!.id);
          friend.online = onlineStatus;

          const unsubscribe = setupOnlineStatusListener(
            user!.id,
            (updatedOnlineStatus: boolean) => {
              friend.online = updatedOnlineStatus;
              get().updateFriend(friend);
            }
          );

          unsubscribeCallbacks.push(unsubscribe);
          friendlistUsers.push(friend);
        });

        await Promise.all(promises);
        set({ friends: friendlistUsers });

        get().unsubscribeAll = () => {
          unsubscribeCallbacks.forEach((unsubscribe) => unsubscribe());
        };
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    },
    unsubscribeAll: () => {},
  };
});
