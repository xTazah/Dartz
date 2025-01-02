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
} from "../utils/types";
import { toast } from "sonner";

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

export function clearLobbyInvite(lobbyKey: string, user: User): void {
  const lobbyInviteRef = ref(
    database,
    `Users/${user!.id}/openLobbyInvites/${lobbyKey}`
  );
  set(lobbyInviteRef, null);
}
