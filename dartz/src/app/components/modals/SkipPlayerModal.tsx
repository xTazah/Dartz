import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SignalSlashIcon } from "@heroicons/react/24/solid";

interface SkipPlayerPopoverProps {
  children: React.ReactNode;
  isOpen: boolean;
  onVoteSkip: () => void;
  playerName: string;
  hasVoted: boolean;
  currentVotes: number;
  votesNeeded: number;
}

export default function SkipPlayerPopover({
  children,
  isOpen,
  onVoteSkip,
  playerName,
  hasVoted,
  currentVotes,
  votesNeeded,
}: SkipPlayerPopoverProps) {
  const displayNeeded = votesNeeded > 0 ? votesNeeded : 1;

  return (
    <Popover open={isOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-64 p-3 bg-[var(--component-background)] rounded-md shadow-lg outline outline-[var(--component-background-hover)]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <SignalSlashIcon className="size-5 text-red-400 shrink-0" />
            <h4 className="font-medium leading-none text-sm text-[var(--font-color)]">
              {playerName} disconnected
            </h4>
          </div>

          <p className="text-xs text-[var(--font-color-muted)]">
            It&apos;s their turn. Vote to skip.
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[var(--component-background-hover)]">
              <div
                className="h-1.5 rounded-full bg-orange-400 transition-all"
                style={{
                  width: `${Math.min((currentVotes / displayNeeded) * 100, 100)}%`,
                }}
              />
            </div>
            <span className="text-xs text-[var(--font-color-muted)] shrink-0">
              {currentVotes}/{displayNeeded}
            </span>
          </div>

          <button
            onClick={onVoteSkip}
            disabled={hasVoted}
            className={`flex items-center justify-center w-full px-2 py-2 rounded-md text-sm transition-colors ${
              hasVoted
                ? "text-[var(--font-color-muted)] bg-[var(--component-background-hover)] cursor-default"
                : "text-orange-400 hover:bg-[var(--component-background-hover)] cursor-pointer"
            }`}
          >
            {hasVoted ? "Vote cast" : "Skip turn"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
