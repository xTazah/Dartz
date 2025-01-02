import {
  ref,
  set,
  onValue,
  update,
  get,
  onDisconnect,
  off,
  push,
} from "firebase/database";
import { database } from "./firebaseConfig";
import {
  FriendlistUser,
  FriendRequest,
  LobbyInvite,
  User,
} from "../../utils/types";
import { toast } from "sonner";
import PlayerService from "../backend/playerService";
import FriendsService from "../backend/friendsService";

export function handleUserLogin(user: User): void {
  try {
    const userRef = ref(database, `Users/${user?.id}`);
    get(userRef)
      .then((snapshot) => {
        if (!snapshot.val().user) {
          // create entry if it doesnt exist
          const newUser: FriendlistUser = {
            user: user,
            online: true,
          };
          update(userRef, newUser);
        } else {
          // set online status
          update(userRef, { online: true });
        }
        onDisconnect(userRef).update({ online: false }); //mark user as offline //ToDo: call this on Logout manually
      })
      .catch(() => console.log("cannot fetch user profile"));
  } catch (error) {
    console.error("error in firebase login", error);
  }
}

export function setupOnlineStatusListener(
  userId: number,
  onOnlineStatusChange: (online: boolean) => void
): () => void {
  const userRef = ref(database, `Users/${userId}/online`);

  const onlineStatusCallback = (snapshot: any) => {
    if (snapshot.exists()) {
      const onlineStatus = snapshot.val();
      onOnlineStatusChange(onlineStatus);
    }
  };

  const unsub = onValue(userRef, onlineStatusCallback);

  return () => {
    unsub;
  };
}

export function setupUserCallbacks(
  userId: number,
  onLobbyInvite: (lobbyInvites: Record<string, LobbyInvite>) => void,
  onFriendRequest: (friendRequests: Record<string, FriendRequest>) => void
): () => void {
  const lobbyInvitesRef = ref(database, `Users/${userId}/openLobbyInvites`);
  const friendRequestsRef = ref(database, `Users/${userId}/openFriendRequests`);

  const lobbyInviteCallback = (snapshot: any) => {
    if (snapshot.exists()) {
      const invites = Object.fromEntries(
        Object.entries(snapshot.val()).map(([key, value]) => [
          key,
          value as LobbyInvite,
        ])
      );
      onLobbyInvite(invites);
    } else {
      onLobbyInvite({});
    }
  };
  onValue(lobbyInvitesRef, lobbyInviteCallback);

  const friendRequestsCallback = (snapshot: any) => {
    if (snapshot.exists()) {
      const requests = Object.fromEntries(
        Object.entries(snapshot.val()).map(([key, value]) => [
          key,
          value as FriendRequest,
        ])
      );
      onFriendRequest(requests);
    } else {
      onFriendRequest({});
    }
  };
  onValue(friendRequestsRef, friendRequestsCallback);

  // return an unsubscribe function
  return () => {
    off(lobbyInvitesRef, "value", lobbyInviteCallback);
    off(friendRequestsRef, "value", friendRequestsCallback);
  };
}

export function inviteUserToLobby(
  lobbyId: string,
  sender: User,
  invited: User
): void {
  const lobbyInvitesRef = ref(
    database,
    `Users/${invited?.id}/openLobbyInvites`
  );

  const lobbyInvite: LobbyInvite = {
    lobbyId: lobbyId,
    sender: sender,
  };

  // check for existing invites to this lobby
  get(lobbyInvitesRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const invites = snapshot.val();
        const inviteExists = Object.values(
          invites as Record<string, LobbyInvite>
        ).some((invite) => invite.lobbyId === lobbyId);

        if (inviteExists) {
          toast(`${invited?.username} has already been invited to this lobby.`);
          return;
        }
      }
      // No existing invites, add the new invite
      push(lobbyInvitesRef, lobbyInvite)
        .then(() => {
          toast("Successfully invited " + invited?.username + " to the lobby.");
        })
        .catch((error) => {
          console.error("Error adding invite:", error);
        });
    })
    .catch((error) => {
      console.error("Error checking invites:", error);
    });
}

export function sendFriendRequest(
  sender: User,
  recieverUsername: string
): Promise<boolean> {
  const playerService = new PlayerService();
  const friendsService = new FriendsService();

  return new Promise((resolve, reject) => {
    playerService
      .getByUsername(recieverUsername)
      .then((response) => {
        const reciever: User = response.data;
        friendsService
          .getIsFriend(sender!.id, reciever!.id)
          .then(() => {
            const friendRequestsRef = ref(
              database,
              `Users/${reciever?.id}/openFriendRequests`
            );

            const friendRequest: FriendRequest = {
              userId: sender!.id,
              username: sender!.username,
            };

            // Check for existing friendRequest
            get(friendRequestsRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  const requests = snapshot.val();
                  const requestExists = Object.values(
                    requests as Record<string, FriendRequest>
                  ).some((request) => request.userId === sender?.id);

                  if (requestExists) {
                    toast(
                      `${reciever?.username} already has an open friend request from you`
                    );
                    resolve(false); // Request already exists
                    return;
                  }
                }
                // Add friend request
                push(friendRequestsRef, friendRequest)
                  .then(() => {
                    toast(
                      "Successfully sent friend request to " +
                        reciever?.username
                    );
                    resolve(true); // Successfully sent
                  })
                  .catch((error) => {
                    console.error("Error adding friend:", error);
                    resolve(false); // Error sending request
                  });
              })
              .catch((error) => {
                console.error("Error checking friend requests:", error);
                resolve(false); // Error checking friend requests
              });
          })
          .catch((error) => {
            toast.error("You are already friends with " + recieverUsername);
            resolve(false);
          });
      })
      .catch((error) => {
        console.log(error);
        toast.error("No player found with username " + recieverUsername);
        resolve(false); // reciever not found
      });
  });
}

export function clearOpen(
  type: "FriendRequests" | "LobbyInvites",
  key: string,
  user: User
): void {
  console.log(`Trying to clear: Users/${user!.id}/open${type}/${key}`);
  const reference = ref(database, `Users/${user!.id}/open${type}/${key}`);
  set(reference, null);
}
