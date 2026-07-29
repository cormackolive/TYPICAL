export interface ShopifyOrderDb {
  id: string;
  influencer_id: string | null;
  shopify_order_id: string;
  order_number: string | null;
  fulfillment_status: "Unfulfilled" | "Partially complete / In transit" | "Delivered" | null;
  shipping_address: string | null;
  items: string | null;
  tracking: string | null;
  order_date: string | null;
  tags: string[];
  line_items_total: number | null;
  last_synced_at: string;
}

export interface AssignmentDb {
  id: string;
  influencer_name: string | null;
  team_member: string | null;
  message: string | null;
  due_date: string | null;
  status: "Pending" | "In progress" | "Complete";
  created_at: string;
}

export interface InfluencerDb {
  id: string;
  name: string;
  location: string | null;
  ig_handle: string | null;
  tiktok_handle: string | null;
  followers: number | null;
  persona: string | null;
  notes: string | null;
  ig_post_link: string | null;
  tiktok_post_link: string | null;
  story_posted: boolean;
  created_at: string;
  shopify_order: ShopifyOrderDb[];
}
