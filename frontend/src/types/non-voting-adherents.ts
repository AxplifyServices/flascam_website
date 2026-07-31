export type NonVotingMembershipStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'REJECTED'
  | 'SUSPENDED';

export type NonVotingDepositPaymentMethod =
  | 'CARD'
  | 'WAFACASH';

export type NonVotingDepositStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'PAID'
  | 'REJECTED'
  | 'REFUNDED';

export type NonVotingAdherentAccount = {
  id: string;

  email: string;

  firstName:
    string | null;

  lastName:
    string | null;

  phone:
    string | null;

  fullName: string;

  isActive: boolean;

  isEmailVerified: boolean;

  lastLoginAt:
    string | null;

  createdAt: string;

  updatedAt: string;
};

export type NonVotingAdherentDeposit = {
  paymentMethod:
    NonVotingDepositPaymentMethod;

  status:
    NonVotingDepositStatus;

  amount: string;

  currency: string;

  wafacashReference:
    string | null;

  paymentProvider:
    string | null;

  paymentSessionId:
    string | null;

  paymentTransactionId:
    string | null;

  requestedAt:
    string | null;

  submittedAt:
    string | null;

  confirmedAt:
    string | null;

  rejectedAt:
    string | null;

  refundedAt:
    string | null;

  rejectionReason:
    string | null;
};

export type NonVotingAdherentSuspension = {
  reason:
    string | null;

  suspendedAt:
    string | null;
};

export type NonVotingAdherentReview = {
  createdByUserId: string;

  reviewedByUserId:
    string | null;

  reviewedAt:
    string | null;

  activatedAt:
    string | null;
};

export type NonVotingAdherent = {
  id: string;

  userId: string;

  account:
    NonVotingAdherentAccount | null;

  city: string;

  membershipStatus:
    NonVotingMembershipStatus;

  deposit:
    NonVotingAdherentDeposit;

  suspension:
    NonVotingAdherentSuspension;

  review:
    NonVotingAdherentReview;

  canSubmitOffer: boolean;

  requiresCardPayment: boolean;

  requiresWafacashReview: boolean;

  canSubmitWafacashReference: boolean;

  createdAt: string;

  updatedAt: string;
};

export type NonVotingAdherentsPagination = {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
};

export type NonVotingAdherentsListResponse = {
  items:
    NonVotingAdherent[];

  pagination:
    NonVotingAdherentsPagination;
};

export type NonVotingAdherentsFilters = {
  page?: number;

  limit?: number;

  search?: string;

  status?:
    NonVotingMembershipStatus | '';
};

export type CreateNonVotingAdherentPayload = {
  firstName: string;

  lastName: string;

  phone: string;

  email: string;

  city: string;

  depositPaymentMethod:
    NonVotingDepositPaymentMethod;

  wafacashReference?: string;

  temporaryPassword?: string;
};

export type CreateNonVotingAdherentResponse = {
  adherent:
    NonVotingAdherent;

  temporaryPassword: string;

  temporaryPasswordGenerated:
    boolean;
};

export type UpdateNonVotingAdherentPayload = {
  firstName?: string;

  lastName?: string;

  phone?: string;

  email?: string;

  city?: string;
};

export type NonVotingAdherentFormState = {
  firstName: string;

  lastName: string;

  phone: string;

  email: string;

  city: string;

  depositPaymentMethod:
    NonVotingDepositPaymentMethod;

  wafacashReference: string;

  temporaryPassword: string;

  temporaryPasswordConfirmation:
    string;

  generateTemporaryPassword:
    boolean;
};

export type NonVotingRegistrationConfig = {
  depositAmount: string;

  currency: string;

  paymentMethods: Array<{
    code:
      NonVotingDepositPaymentMethod;

    label: string;

    requiresManualValidation:
      boolean;
  }>;
};

export type RegisterNonVotingAdherentPayload = {
  firstName: string;

  lastName: string;

  phone: string;

  email: string;

  city: string;

  password: string;

  depositPaymentMethod:
    NonVotingDepositPaymentMethod;

  wafacashReference?: string;
};

export type RegisterNonVotingAdherentResponse = {
  adherent:
    NonVotingAdherent;

  loginAllowed:
    boolean;

  requiresManualValidation:
    boolean;

  message:
    string;
};

export type NonVotingRegistrationForm = {
  firstName: string;

  lastName: string;

  phone: string;

  email: string;

  city: string;

  password: string;

  passwordConfirmation:
    string;

  depositPaymentMethod:
    NonVotingDepositPaymentMethod | '';

  wafacashReference:
    string;
};