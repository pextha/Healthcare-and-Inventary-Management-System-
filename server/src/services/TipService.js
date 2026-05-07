import { fetchTipsByWeekFromAPI } from "../utils/tipApiClient.js";
import { PregnancyRepository } from "../repositories/PregnancyRepository.js";

export class TipService {
  constructor() {
    this.pregnancyRepo = new PregnancyRepository();
  }

  
   //Fetch tips for the mother's current pregnancy week.
   
  async getTipsForCurrentWeek(userId) {
    try {
      const MIN_WEEK = 1;
      const MAX_WEEK = 42;

      const pregnancy = await this.pregnancyRepo.findActiveByUser(userId);
      const rawWeek = pregnancy?.pregnancyWeekNumber ?? null;

      // Determine whether the week is within the valid tip range
      const hasValidWeek =
        rawWeek !== null && rawWeek >= MIN_WEEK && rawWeek <= MAX_WEEK;

      // Clamp to the nearest valid week for the API call
      const week = rawWeek
        ? Math.min(MAX_WEEK, Math.max(MIN_WEEK, rawWeek))
        : MIN_WEEK;

      const tips = await fetchTipsByWeekFromAPI(week);

      return {
        tips,
        week,
        // Only show the week badge when the actual week is a known, valid value
        showWeekBadge: hasValidWeek,
      };
    } catch (error) {
      const err = new Error("Failed to fetch pregnancy tips for current week");
      err.statusCode = 502;
      throw err;
    }
  }
}
