import { create } from "zustand";
import { FriendlistUser, User } from "./types";
import FriendsService from "../services/backend/friendsService";
import {
  getBulkOnlineStatus,
  onUserOnline,
  onUserOffline,
} from "../services/gameServer/userService";

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

        // Get all online statuses in one call
        const userIds = users.map((u) => u!.id);
        const statuses = await getBulkOnlineStatus(userIds);

        const friendlistUsers: FriendlistUser[] = users.map((user) => ({
          user,
          online: statuses[user!.id] ?? false,
        }));

        set({ friends: friendlistUsers });

        // Listen for online/offline events
        const unsubOnline = onUserOnline((onlineUserId: number) => {
          const friends = get().friends;
          const friend = friends?.find((f) => f.user!.id === onlineUserId);
          if (friend) {
            get().updateFriend({ ...friend, online: true });
          }
        });

        const unsubOffline = onUserOffline((offlineUserId: number) => {
          const friends = get().friends;
          const friend = friends?.find((f) => f.user!.id === offlineUserId);
          if (friend) {
            get().updateFriend({ ...friend, online: false });
          }
        });

        get().unsubscribeAll = () => {
          unsubOnline();
          unsubOffline();
        };
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    },
    unsubscribeAll: () => {},
  };
});
