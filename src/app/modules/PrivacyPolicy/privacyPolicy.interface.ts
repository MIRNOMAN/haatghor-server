export interface IPrivacyPolicy {
  id?: string;
  title: string;
  content: string;
  section?: string;
  order?: number;
  version?: string;
  isActive?: boolean;
  effectiveDate?: Date;
}

export interface IPrivacyPolicyFilters {
  searchTerm?: string;
  section?: string;
  isActive?: string;
  version?: string;
}
