export type AuthUser = {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  regionalAssociationId: string | null;
};