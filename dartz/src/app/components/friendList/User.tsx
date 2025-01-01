import { UserIcon } from "@heroicons/react/24/solid";
import styles from "../../styles/friendList.module.scss";

interface UserProps {
  username: string;
}

const UserComponent = ({ username }: UserProps) => {
  return (
    <div className="flex flex-row items-center gap-3">
      <div className={`${styles.friendCircle}`}>
        <UserIcon className="size-5" />
      </div>
      <div>{username}</div>
    </div>
  );
};

export default UserComponent;
