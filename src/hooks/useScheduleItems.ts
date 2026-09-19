import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ScheduleItem } from "@/lib/schedule";

export function useScheduleItems(userId?: string) {
  return useQuery({
    queryKey: ["schedule-items", userId],
    enabled: !!userId,
    queryFn: async (): Promise<ScheduleItem[]> => {
      const { data, error } = await supabase
        .from("schedule_items")
        .select(
          "id, title, room, place_name, address, lat, lng, day_of_week, start_time, end_time, note",
        )
        .order("day_of_week")
        .order("start_time");
      if (error) throw error;
      return (data ?? []) as ScheduleItem[];
    },
  });
}
