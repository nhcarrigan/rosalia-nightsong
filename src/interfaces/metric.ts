/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */
export interface Metric {
  application: string;
  name:        string;
  value:       number;
  metadata?:   Record<string, string>;
}
