"use client";

import { useContext, useEffect, useState } from 'react'
import { CalendarDaysIcon, TrophyIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline'
import {
  FlameIcon,
  CircleUserRoundIcon as AvatarIcon,
} from "lucide-react";
import styles from "@/app/styles/profile.module.scss";
import ActivityGraph from '@/app/components/statistics/activityGraph';
import statisticsStyles from "@/app/styles/statistics.module.scss";
import PlayerService from '@/app/services/backend/playerService';
import { toast } from 'sonner';
import MatchService from '@/app/services/backend/matchService';
import { PlayerStatsResponse } from '@/app/utils/types';
import { UserContext } from '@/app/components/userProvider/userProvider';

interface UserProfile {
  id: string
  username: string
  profilePicture: string
  bio: string
  memberSince: Date
}

interface Props {
  params: {
    userId: string
  }
}

export default function FriendProfilePage({ params }: Props) {
  const context = useContext(UserContext);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<PlayerStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFriendProfile = async () => {
      if (!params.userId) {
        setError("User ID not provided");
        setLoading(false);
        return;
      }

      try {
        const playerService = new PlayerService();
        const profileRes = await playerService.getById<UserProfile>(parseInt(params.userId));
        setUser(profileRes.data);

        const matchService = new MatchService();
        matchService
          .getPlayerStats(parseInt(params.userId))
          .then((res) => setStats(res.data))
          .catch((err) => {
            console.error("Failed to load stats:", err);
            if(err.response?.status === 404) 
             toast.error("No statistics available for this user");
            else
             toast.error("Failed to load statistics");
          })
          .finally(() => setLoading(false));
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setError("Failed to load user profile");
        setLoading(false);
        toast.error("Failed to load profile");
      }
    };

    fetchFriendProfile();
  }, [params.userId]);

  if (loading) {
    return (
      <div className={statisticsStyles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Profile</h1>
          <p className={statisticsStyles.subtitle}>Loading profile data...</p>
        </div>
        <div className={statisticsStyles.grid}>
          {[1, 2, 3, 4].map((i) => <div key={i} className={statisticsStyles.skeleton} />)}
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-500">
          <p>{error || "User profile not found."}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Profil</h1>
      </div>

      {/* Main Dashboard Grid */}
      <div className={statisticsStyles.grid}>
        
        {/* Profile Card - Full Width */}
        <div className={`${statisticsStyles.card}` +" row-span-2 col-span-2 lg:col-span-1 flex flex-col gap-5"}>
          <div className={statisticsStyles.cardLabel}><AvatarIcon className="w-4 h-4" /> Profil</div>
          
          {/* Avatar Section */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarLetter}>
                  {user.username?.charAt(0) || "?"}
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className={styles.userInfoSection}>
            <h2 className={styles.username}>{user.username}</h2>
            <p className={styles.bio}>{user.bio || "No Bio."}</p>
            <span className={styles.bio}>Member since: {user.memberSince ? new Date(user.memberSince).toLocaleDateString("de-de") : "Date not available"}</span>
          </div>
        </div>

        <div className={statisticsStyles.grid +" row-span-2 col-span-2 lg:col-span-1 flex flex-col gap-5"}>
          <div className={statisticsStyles.fullWidthCard }>
            <div className={styles.scoreWrapper}>
              <div className={styles.score}>180</div>
              <div className={styles.scoreAmount}>{ stats?.count180s} Times</div>
            </div>
          </div>
          <div className={statisticsStyles.fullWidthCard }>
            <div className={styles.scoreWrapper}>
              <div className={styles.score}>140+</div>
              <div className={styles.scoreAmount}>{ stats?.count140Plus} Times</div>
            </div>
          </div>        
          <div className={statisticsStyles.fullWidthCard }>
            <div className={styles.scoreWrapper}>
              <div className={styles.score}>100+</div>
              <div className={styles.scoreAmount}>{ stats?.count100Plus} Times</div>
            </div>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className={statisticsStyles.fullWidthCard }>
          <div className={statisticsStyles.cardLabel}><CalendarDaysIcon className="w-4 h-4" /> Activity Overview</div>
          <ActivityGraph userId={parseInt(params.userId)} />
        </div>

          {/* Win Rate Card */}
          <div className={statisticsStyles.card}>
            <div className={statisticsStyles.cardLabel}><FlameIcon className="w-4 h-4" /> Statistics</div>
            <div className={statisticsStyles.numberItem}>
              <span className={statisticsStyles.numberLabel}>Win Rate</span>
              <span className={statisticsStyles.numberValue}>{stats?.winRate ?? "--"}%</span>
            </div>
            <div className={statisticsStyles.numberItem}>
              <span className={statisticsStyles.numberLabel}>Total Games</span>
              <span className={statisticsStyles.numberValue}>{stats?.totalMatches ?? "--"}</span>
            </div>
            <div className={statisticsStyles.numberItem}>
              <span className={statisticsStyles.numberLabel}>Wins</span>
              <span className={statisticsStyles.numberValue}>{stats?.totalWins ?? "--"}</span>
            </div>
          </div>

          {/* Records Card */}
          <div className={statisticsStyles.card}>
            <div className={statisticsStyles.cardLabel}><TrophyIcon className="w-4 h-4" /> Records</div>
            <div className={statisticsStyles.recordRow}>
              <div className={statisticsStyles.recordIcon}><SparklesIcon className="w-4 h-4" /></div>
              <div className={statisticsStyles.recordInfo}>
                <span className={statisticsStyles.recordLabel}>Best Leg</span>
                <span className={statisticsStyles.recordValue}>{stats?.bestLegDarts ?? "--"} darts</span>
              </div>
            </div>
            <div className={statisticsStyles.recordRow}>
              <div className={statisticsStyles.recordIcon}><UsersIcon className="w-4 h-4" /></div>
              <div className={statisticsStyles.recordInfo}>
                <span className={statisticsStyles.recordLabel}>Average</span>
                <span className={statisticsStyles.recordValue}>{stats?.overallAverage ?? "--"}</span>
              </div>
            </div>
          </div>

      </div>
    </div>
  )
}
