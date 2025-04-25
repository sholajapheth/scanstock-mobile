import { BusinessData } from "../hooks/useBusiness";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  profilePicture?: string;
  business?: BusinessData;
}
