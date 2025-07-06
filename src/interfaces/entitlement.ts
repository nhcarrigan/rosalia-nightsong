/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

/* eslint-disable @typescript-eslint/naming-convention -- Needs to match Discord's structure. */
export interface Entitlement {
  application_id: string;
  event: {
    data: {
      application_id:  string;
      consumed:        boolean;
      deleted:         boolean;
      ends_at:         string;
      gift_code_flags: number;
      guild_id:        string;
      id:              string;
      promotion_id:    string | null;
      sku_id:          string;
      starts_at:       string;
      subscription_id: string;
      type:            number;
      user_id:         string;
    };
    timestamp: string;
    type:      string;
  };
  type:    number;
  version: number;
}
