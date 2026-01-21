import { BillingCycle } from "@/prisma/schema/generated/prisma/enums";

export interface CreateSubscriptionPayload {
    name: string;
    price: number;
    currency: string;
    billingCycle: BillingCycle;
    points: string[];
    active?: boolean;
    isVisible?: boolean;
   
}