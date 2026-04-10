export class EvolutionWebhookDto {
  event: string;
  instance: string;
  data?: {
    state?: string;
    statusReason?: number;
  } | null;
  date_time: string;
}