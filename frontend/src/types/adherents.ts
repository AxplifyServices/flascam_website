export type AdherentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export type AdherentIdentifierType =
  | 'ICE'
  | 'IF'
  | 'RC'
  | 'CIN'
  | 'OTHER';

export type AdherentAssociation = {
  id: string;
  name: string;
  acronym?: string | null;
  region?: string | null;
};

export type AdherentAccount = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string | null;
};

export type Adherent = {
  id: string;

  displayName: string;
  legalName?: string | null;

  memberNumber?: string | null;

  identifierType?:
    | AdherentIdentifierType
    | null;

  identifierValue?: string | null;

  address?: string | null;
  city?: string | null;
  postalCode?: string | null;

  notes?: string | null;

  status: AdherentStatus;

  rejectionReason?: string | null;

  submittedAt: string;
  reviewedAt?: string | null;
  approvedAt?: string | null;
  suspendedAt?: string | null;

  createdAt: string;
  updatedAt: string;

  association:
    AdherentAssociation;

  account:
    AdherentAccount;
};

export type AdherentFormState = {
  regionalAssociationId: string;

  displayName: string;
  legalName: string;

  identifierType:
    | AdherentIdentifierType
    | '';

  identifierValue: string;

  address: string;
  city: string;
  postalCode: string;

  notes: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  password: string;
  passwordConfirmation: string;

  approveImmediately: boolean;
};

export type CreateAdherentPayload = {
  regionalAssociationId?: string;

  displayName: string;
  legalName?: string;

  identifierType?:
    AdherentIdentifierType;

  identifierValue?: string;

  address?: string;
  city?: string;
  postalCode?: string;

  notes?: string;

  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  password: string;

  approveImmediately?: boolean;
};

export type UpdateAdherentPayload = {
  regionalAssociationId?: string;

  displayName?: string;
  legalName?: string;

  identifierType?:
    AdherentIdentifierType;

  identifierValue?: string;

  address?: string;
  city?: string;
  postalCode?: string;

  notes?: string;

  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

export type UpdateAdherentStatusPayload = {
  status: AdherentStatus;
  reason?: string;
};