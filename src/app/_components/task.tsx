"use client";
import { api } from "~/trpc/react";

export function Task() {
  const [task] = api.task.latestTask.useSuspenseQuery();

  return (
    <div className="w-full max-w-xs">
      {task ? (
        <p className="truncate">Your most recent task: {task.title}</p>
      ) : (
        <p>You have no tasks yet.</p>
      )}
    </div>
  );
}
