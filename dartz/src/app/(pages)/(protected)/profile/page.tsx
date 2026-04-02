"use client";

import { useContext, useEffect, useState } from 'react'
import { PencilIcon, CheckIcon, CalendarDaysIcon, TrophyIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline'
import {
  FlameIcon,
  CircleUserRoundIcon as AvatarIcon,
  XIcon,
  PlusIcon,
  ChartPieIcon
} from "lucide-react";
//import ActivityGraph from "@/app/components/statistics/activityGraph";
import styles from "@/app/styles/profile.module.scss";
import { UserContext } from '@/app/components/userProvider/userProvider';
import ActivityGraph from '@/app/components/statistics/activityGraph';
import statisticsStyles from "@/app/styles/statistics.module.scss";
import PlayerService from '@/app/services/backend/playerService';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import MatchService from '@/app/services/backend/matchService';
import { PlayerStatsResponse } from '@/app/utils/types';

interface UserProfile {
  id: string
  username: string
  profilePicture: string
  bio: string
  memberSince: Date
}

export default function ProfilePage() {
  const context = useContext(UserContext);
  const user = context?.user
  const [isEditing, setIsEditing] = useState(false)
  const [tempUsername, setTempUsername] = useState(user?.username || '')
  const [tempBio, setTempBio] = useState(user?.bio || '')
  const [tempProfilePicture, setTempProfilePicture] = useState(user?.profilePicture || '')
  const [stats, setStats] = useState<PlayerStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const matchService = new MatchService();
    matchService
      .getPlayerStats(user.id)
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Failed to load stats:", err))
      .finally(() => setLoading(false));
  }, [user?.id]);

    if (loading) {
    return (
      <div className={statisticsStyles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Profile</h1>
          <p className={statisticsStyles.subtitle}>Loading your profile data...</p>
        </div>
        <div className={statisticsStyles.grid}>
          {[1, 2, 3, 4].map((i) => <div key={i} className={statisticsStyles.skeleton} />)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-500">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    )
  }
    const handleSave = async () => {
    if (!user?.id) return;

    try {
      const service = new PlayerService();
      await service.updateUserProfile(user.id, tempUsername, tempProfilePicture, tempBio);
      

      if (context?.setUser) {
        context.setUser({
          ...user,
          username: tempUsername,
          bio: tempBio,
          profilePicture: tempProfilePicture,
        });
      }
      
      toast.success("Profil aktualisiert");

    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setIsEditing(false)
    }
  };

  return (
    <div >
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Profil</h1>
      </div>

      {/* Main Dashboard Grid */}
      <div className={statisticsStyles.grid}>
        
        {/* Profile Card - Full Width */}
        <div className={`${statisticsStyles.card}` +" row-span-2 col-span-2 lg:col-span-1 flex flex-col gap-5"}>
          <div className={statisticsStyles.cardLabel}><AvatarIcon className="w-4 h-4" /> Your Profil</div>
          
          {/* Avatar Section */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              <img 
                src={user.profilePicture} 
                className={styles.avatarImage}
              />
              {isEditing && (
                <button className={styles.editAvatarBtn}>            
                  <div className="flex justify-between items-center z-10">
                    <Popover>
                      <PopoverTrigger asChild>
                        <PencilIcon className="w-5 h-5" />
                      </PopoverTrigger>
                      <PopoverContent
                        sideOffset={0}
                        side="bottom"
                        align="center"
                        className="w-72 p-4 bg-[var(--component-background)] rounded-md shadow-lg outline outline-[var(--component-background-hover)]"
                      >
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none text-white">Add Profile Picture URL</h4>
                          </div>
                          <div className="grid gap-2">
                            <div className="items-center">
                              <input
                                type="text"
                                value={tempProfilePicture}
                                onChange={(e) => {
                                  setTempProfilePicture(e.target.value);
                                }}
                                placeholder="URL of your profile picture"
                                className="focus:outline outline-[var(--component-outline)] w-full col-span-2 h-8 text-white p-2 rounded bg-[var(--component-background-hover)] text-[var(--font-color)]"
                              />
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </button>
                
              )}
            </div>
          </div>

          {/* User Info */}
          <div className={styles.userInfoSection}>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  className={styles.editInput}
                  placeholder="Benutzername"
                />
                <textarea
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  className={styles.editTextarea}
                  placeholder="Deine Bio..."
                  rows={3}
                />
                <div className={styles.editActions}>
                  <button 
                    onClick={() => {
                      handleSave();
                    }}
                    className={styles.saveBtn}
                  >
                    <CheckIcon className="w-4 h-4" /> Save
                  </button>
                  <button 
                    onClick={() => {
                      setTempUsername(user.username)
                      setTempBio(user.bio)
                      setIsEditing(false)
                    }}
                    className={styles.cancelBtn}
                  >
                    <XIcon className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className={styles.username}>{user.username}</h2>
                 <p className={styles.bio}>{user.bio || "No Bio yet."}</p>
                <span className={styles.bio}>Member since: {user.memberSince ? new Date(user.memberSince).toLocaleDateString("de-de") : "Date not available"}</span>
                
                {/* Edit Button */}
                <button 
                  onClick={() => setIsEditing(true)}
                  className={styles.editProfileBtn}
                >
                  <PencilIcon className="w-4 h-4" /> Edit Profile
                </button>
              </>
            )}
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
          <ActivityGraph />
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