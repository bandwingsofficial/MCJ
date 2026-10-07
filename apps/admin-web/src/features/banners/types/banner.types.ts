export type BannerPlacement = "HOMEPAGE";
export type BannerStatus = "ACTIVE" | "INACTIVE";

export interface BannerImage {
  id: string;
  uploadId: string;
  imageUrl: string;
  objectKey: string;
  displayOrder: number;
  isPrimary: boolean;
  link: string | null;
}

export interface BannerListItem {
  id: string;
  name: string;
  type: BannerPlacement;
  status: BannerStatus;
  displayOrder: number;
  imageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BannerDetail extends BannerListItem {
  images: BannerImage[];
}

export interface BannerFilters {
  search?: string;
  status?: BannerStatus;
  type?: BannerPlacement;
  page?: number;
  pageSize?: number;
}

export interface UpsertBannerImage {
  id?: string;
  uploadId: string;
  isPrimary: boolean;
  displayOrder: number;
  link: string | null;
}

export interface UpsertBannerRequest {
  name: string;
  type: BannerPlacement;
  status?: BannerStatus;
  images: UpsertBannerImage[];
}
