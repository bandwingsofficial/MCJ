"use client";

import type { LucideIcon } from "lucide-react";
import {
  Eye,
  Heart,
  LayoutDashboard,
  MessageCircle,
  Share2,
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import type { CommunityPostDetails } from "@/src/features/community/types/community.types";

import { CommunityManageOverviewPanel } from "./community-manage-overview-panel";
import { CommunityManagePreviewPanel } from "./community-manage-preview-panel";
import { CommunityManageLikesPanel } from "./community-manage-likes-panel";
import { CommunityManageCommentsPanel } from "./community-manage-comments-panel";
import { CommunityManageSharesPanel } from "./community-manage-shares-panel";

export type CommunityManageTabKey =
  | "overview"
  | "preview"
  | "likes"
  | "comments"
  | "shares";

export const COMMUNITY_MANAGE_DEFAULT_TAB: CommunityManageTabKey = "overview";

const TAB_CLASS =
  "inline-flex items-center rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

const TAB_ITEMS: ReadonlyArray<{
  value: CommunityManageTabKey;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "preview", label: "Preview", icon: Eye },
  { value: "likes", label: "Likes", icon: Heart },
  { value: "comments", label: "Comments", icon: MessageCircle },
  { value: "shares", label: "Shares", icon: Share2 },
];

interface Props {
  post: CommunityPostDetails;
  activeTab?: CommunityManageTabKey;
  onTabChange?: (tab: CommunityManageTabKey) => void;
}

export function CommunityManageWorkspace({
  post,
  activeTab = COMMUNITY_MANAGE_DEFAULT_TAB,
  onTabChange,
}: Props) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        onTabChange?.(value as CommunityManageTabKey);
      }}
    >
      <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
        {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className={TAB_CLASS}>
            <Icon className="mr-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview">
        <CommunityManageOverviewPanel post={post} />
      </TabsContent>

      <TabsContent value="preview">
        <CommunityManagePreviewPanel post={post} />
      </TabsContent>

      <TabsContent value="likes">
        <CommunityManageLikesPanel postId={post.id} />
      </TabsContent>

      <TabsContent value="comments">
        <CommunityManageCommentsPanel comments={post.comments ?? []} />
      </TabsContent>

      <TabsContent value="shares">
        <CommunityManageSharesPanel shareCount={post.shareCount} />
      </TabsContent>
    </Tabs>
  );
}
